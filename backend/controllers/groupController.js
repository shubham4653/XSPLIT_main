const Group = require('../models/Group');
const Expense = require('../models/Expense');
const { simplifyDebts } = require('../utils/debtSimplifier');
const NodeCache = require('node-cache');

// Cache instance (5 minutes TTL)
const cache = new NodeCache({ stdTTL: 300 });

// @desc    Get group balances and optimal settlement transactions
// @route   GET /api/groups/:id/balances
// @access  Private
const getGroupBalances = async (req, res) => {
  try {
    const groupId = req.params.id;

    // Check cache first
    const cacheKey = `balances_${groupId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({ success: true, data: cachedData, cached: true });
    }

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: { message: 'Group not found' } });
    }

    if (!group.members.includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, error: { message: 'Not authorized to view this group' } });
    }

    // Fetch all expenses for this group
    const expenses = await Expense.find({ groupId }).lean();

    // Calculate net balances
    // map of userId -> net balance
    const balancesMap = new Map();

    expenses.forEach(expense => {
      const paidBy = expense.paidBy.toString();
      const amount = expense.amount;

      // Add credit to payer
      balancesMap.set(paidBy, (balancesMap.get(paidBy) || 0) + amount);

      // Subtract debit from each split
      expense.splits.forEach(split => {
        const debtorId = split.user.toString();
        const amountOwed = split.amountOwed;
        balancesMap.set(debtorId, (balancesMap.get(debtorId) || 0) - amountOwed);
      });
    });

    // Convert map to array of objects
    const rawBalances = Array.from(balancesMap, ([userId, balance]) => ({ userId, balance }));

    // Simplify debts
    const transactions = simplifyDebts(rawBalances);

    const responseData = {
      transactions,
      rawBalances
    };

    // Save to cache
    cache.set(cacheKey, responseData);

    res.status(200).json({ success: true, data: responseData, cached: false });

  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { name, icon, color, budget } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: { message: 'Group name is required' } });
    }

    const group = await Group.create({
      name,
      icon,
      color,
      budget: Number(budget) || 0,
      owner: req.user._id,
      members: [req.user._id]
    });

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Get all user's groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('owner', 'name email profilePicture upiId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Get all user's friends (1-on-1 groups)
// @route   GET /api/groups/friends
// @access  Private
const getFriends = async (req, res) => {
  try {
    const friends = await Group.find({ members: req.user._id, type: 'friend' })
      .populate('members', 'name email profilePicture upiId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: friends });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Get past collaborators (unique users from all groups user is in)
// @route   GET /api/groups/collaborators
// @access  Private
const getCollaborators = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email profilePicture');
    
    const collaboratorMap = new Map();
    
    groups.forEach(group => {
      group.members.forEach(member => {
        if (member._id.toString() !== req.user._id.toString()) {
          if (!collaboratorMap.has(member._id.toString())) {
            collaboratorMap.set(member._id.toString(), member);
          }
        }
      });
    });

    const collaborators = Array.from(collaboratorMap.values());
    res.status(200).json({ success: true, data: collaborators });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Get single group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email profilePicture upiId')
      .populate('owner', 'name email profilePicture upiId');

    if (!group) {
      return res.status(404).json({ success: false, error: { message: 'Group not found' } });
    }

    if (!group.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, error: { message: 'Not authorized to view this group' } });
    }

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Record a settlement (payment) between two users
// @route   POST /api/groups/:id/settle
// @access  Private
const settleDebt = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { toUserId, amount } = req.body;

    if (!toUserId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, error: { message: 'Valid toUserId and amount are required' } });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: { message: 'Group not found' } });
    }

    if (!group.members.includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, error: { message: 'Not authorized in this group' } });
    }

    // A settlement is essentially an expense paid by the current user
    // where the entire amount is owed by the user they are settling with.
    // E.g. I owe Bob $50. I settle it. So I pay $50, and Bob "owes" me $50. This cancels out my debt.
    const Expense = require('../models/Expense');
    const expense = await Expense.create({
      groupId,
      description: 'Settlement',
      amount: Number(amount),
      category: 'settlement', // fixed capitalization to match Expense model enum
      paidBy: req.user._id,
      splits: [{ user: toUserId, amountOwed: Number(amount) }],
      date: Date.now()
    });

    // Notify the user who received the settlement
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: toUserId,
      type: 'settlement',
      message: `${req.user.name || 'Someone'} paid you ₹${Number(amount).toFixed(2)} in ${group.name}.`,
      relatedGroup: groupId,
      relatedExpense: expense._id
    });

    // Invalidate cache
    cache.del(`balances_${groupId}`);

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Get group preview for invite links
// @route   GET /api/groups/:id/preview
// @access  Protected
const getGroupPreview = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).select('name icon color members');
    if (!group) {
      return res.status(404).json({ success: false, error: { message: 'Group not found' } });
    }
    res.status(200).json({ success: true, data: { name: group.name, icon: group.icon, color: group.color, memberCount: group.members.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Invalid group link' } });
  }
};

// @desc    Join a group via invite link
// @route   POST /api/groups/:id/join
// @access  Protected
const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: { message: 'Group not found' } });
    }

    // Check if user is already a member
    if (group.members.includes(req.user._id.toString())) {
      return res.status(200).json({ success: true, message: 'Already a member', data: group });
    }

    // Add user to members array
    group.members.push(req.user._id);
    await group.save();

    res.status(200).json({ success: true, message: 'Joined successfully', data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Add a member to an existing group
// @route   POST /api/groups/:id/members
// @access  Private
const addMemberToGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: { message: 'User ID is required' } });

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: { message: 'Group not found' } });
    
    if (!group.members.includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ success: false, error: { message: 'User is already a member' } });
    }

    group.members.push(userId);
    await group.save();

    cache.del(`balances_${group._id}`);

    res.status(200).json({ success: true, message: 'Member added successfully', data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Update group details
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: { message: 'Group not found' } });
    
    if (!group.members.includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
    }

    group.name = req.body.name || group.name;
    group.icon = req.body.icon !== undefined ? req.body.icon : group.icon;
    group.color = req.body.color || group.color;
    group.budget = req.body.budget !== undefined ? Number(req.body.budget) : group.budget;

    await group.save();
    
    cache.del(`balances_${group._id}`);
    
    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: { message: 'Group not found' } });

    if (group.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: { message: 'Owner cannot leave the group. You must delete it.' } });
    }

    group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
    await group.save();

    cache.del(`balances_${group._id}`);

    res.status(200).json({ success: true, message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: { message: 'Group not found' } });

    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: { message: 'Only the owner can delete this group' } });
    }

    await Expense.deleteMany({ groupId: group._id });
    
    const Notification = require('../models/Notification');
    await Notification.deleteMany({ relatedGroup: group._id });

    await group.deleteOne();

    cache.del(`balances_${group._id}`);

    res.status(200).json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  getGroupBalances,
  settleDebt,
  getGroupPreview,
  joinGroup,
  updateGroup,
  leaveGroup,
  deleteGroup,
  getCollaborators,
  addMemberToGroup,
  // Export cache for invalidation when adding/editing expenses later
  cache
};
