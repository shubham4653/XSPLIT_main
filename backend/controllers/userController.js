const Group = require('../models/Group');
const Expense = require('../models/Expense');
const { simplifyDebts } = require('../utils/debtSimplifier');

// @desc    Get dashboard summary for user
// @route   GET /api/users/dashboard
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Find all groups the user belongs to
    const groups = await Group.find({ members: userId }).lean();
    const groupIds = groups.map(g => g._id);

    // Fetch all expenses for all groups
    const expenses = await Expense.find({ groupId: { $in: groupIds } }).lean();

    // Map to store balances for current user across all groups
    let totalYouOwe = 0;
    let totalOwesYou = 0;

    // Process each group independently using the debt simplifier
    const groupSummaries = groups.map(group => {
      const groupExpenses = expenses.filter(e => e.groupId.toString() === group._id.toString());
      
      const balancesMap = new Map();
      groupExpenses.forEach(expense => {
        const paidBy = expense.paidBy.toString();
        const amount = expense.amount;

        balancesMap.set(paidBy, (balancesMap.get(paidBy) || 0) + amount);

        expense.splits.forEach(split => {
          const debtorId = split.user.toString();
          const amountOwed = split.amountOwed;
          balancesMap.set(debtorId, (balancesMap.get(debtorId) || 0) - amountOwed);
        });
      });

      const rawBalances = Array.from(balancesMap, ([id, balance]) => ({ userId: id, balance }));
      const transactions = simplifyDebts(rawBalances);

      // Find transactions involving current user in this group
      let userOwes = 0;
      let owesUser = 0;

      transactions.forEach(t => {
        if (t.from === userId) {
          userOwes += t.amount;
        } else if (t.to === userId) {
          owesUser += t.amount;
        }
      });

      totalYouOwe += userOwes;
      totalOwesYou += owesUser;

      return {
        _id: group._id,
        name: group.name,
        icon: group.icon,
        color: group.color,
        userOwes,
        owesUser,
        memberCount: group.members.length,
        totalExpenses: groupExpenses.length,
        lastActivity: groupExpenses.length > 0 ? groupExpenses[groupExpenses.length - 1].date : group.createdAt
      };
    });

    const totalBalance = totalOwesYou - totalYouOwe;

    res.status(200).json({
      success: true,
      data: {
        totalBalance,
        totalYouOwe,
        totalOwesYou,
        groups: groupSummaries
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const Notification = require('../models/Notification');

// @desc    Get activity feed for user (recent expenses across all groups)
// @route   GET /api/users/activity
// @access  Private
const getActivityFeed = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Find all groups the user belongs to
    const groups = await Group.find({ members: userId }).lean();
    const groupIds = groups.map(g => g._id);

    // Fetch recent expenses where the user was involved
    const expenses = await Expense.find({ 
      groupId: { $in: groupIds },
      $or: [
        { paidBy: userId },
        { 'splits.user': userId }
      ]
    })
      .populate('groupId', 'name icon color')
      .populate('paidBy', 'name profilePicture')
      .sort({ date: -1, createdAt: -1 })
      .limit(15);

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getFriendsBalances = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const User = require('../models/User');

    const groups = await Group.find({ members: userId }).lean();
    const groupIds = groups.map(g => g._id);

    const expenses = await Expense.find({ groupId: { $in: groupIds } }).lean();

    const allMemberIds = new Set();
    groups.forEach(g => g.members.forEach(m => {
      if (m.toString() !== userId) allMemberIds.add(m.toString());
    }));

    const friendsData = await User.find({ _id: { $in: Array.from(allMemberIds) } })
      .select('name profilePicture upiId email').lean();

    const friendsMap = new Map();
    friendsData.forEach(f => {
      friendsMap.set(f._id.toString(), {
        ...f,
        balance: 0,
        sharedGroups: []
      });
    });

    groups.forEach(group => {
      const groupExpenses = expenses.filter(e => e.groupId.toString() === group._id.toString());
      
      const balancesMap = new Map();
      groupExpenses.forEach(expense => {
        const paidBy = expense.paidBy.toString();
        const amount = expense.amount;

        balancesMap.set(paidBy, (balancesMap.get(paidBy) || 0) + amount);

        expense.splits.forEach(split => {
          const debtorId = split.user.toString();
          const amountOwed = split.amountOwed;
          balancesMap.set(debtorId, (balancesMap.get(debtorId) || 0) - amountOwed);
        });
      });

      const rawBalances = Array.from(balancesMap, ([id, balance]) => ({ userId: id, balance }));
      const transactions = simplifyDebts(rawBalances);

      transactions.forEach(t => {
        if (t.from === userId) {
          if (friendsMap.has(t.to)) {
            const friendObj = friendsMap.get(t.to);
            friendObj.balance -= t.amount;
            const existingGroup = friendObj.sharedGroups.find(g => g._id.toString() === group._id.toString());
            if (!existingGroup) {
              friendObj.sharedGroups.push({
                _id: group._id,
                name: group.name,
                icon: group.icon,
                color: group.color,
                balance: -t.amount
              });
            } else {
              existingGroup.balance -= t.amount;
            }
          }
        } else if (t.to === userId) {
          if (friendsMap.has(t.from)) {
            const friendObj = friendsMap.get(t.from);
            friendObj.balance += t.amount;
            const existingGroup = friendObj.sharedGroups.find(g => g._id.toString() === group._id.toString());
            if (!existingGroup) {
              friendObj.sharedGroups.push({
                _id: group._id,
                name: group.name,
                icon: group.icon,
                color: group.color,
                balance: t.amount
              });
            } else {
              existingGroup.balance += t.amount;
            }
          }
        }
      });
    });

    let results = Array.from(friendsMap.values());
    results.forEach(r => r.balance = Math.round(r.balance * 100) / 100);
    results.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const settleWithFriend = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: { message: 'Valid amount is required' } });
    }

    const userId = req.user._id.toString();
    const groups = await Group.find({ members: { $all: [userId, friendId] } }).lean();
    const groupIds = groups.map(g => g._id);
    const expenses = await Expense.find({ groupId: { $in: groupIds } }).lean();

    const debtsInGroups = [];

    groups.forEach(group => {
      const groupExpenses = expenses.filter(e => e.groupId.toString() === group._id.toString());
      const balancesMap = new Map();
      groupExpenses.forEach(expense => {
        const paidBy = expense.paidBy.toString();
        const amt = expense.amount;
        balancesMap.set(paidBy, (balancesMap.get(paidBy) || 0) + amt);
        expense.splits.forEach(split => {
          const debtorId = split.user.toString();
          const amountOwed = split.amountOwed;
          balancesMap.set(debtorId, (balancesMap.get(debtorId) || 0) - amountOwed);
        });
      });

      const rawBalances = Array.from(balancesMap, ([id, balance]) => ({ userId: id, balance }));
      const transactions = simplifyDebts(rawBalances);

      transactions.forEach(t => {
        if (t.from === userId && t.to === friendId) {
          debtsInGroups.push({ groupId: group._id, amountWeOwe: t.amount });
        }
      });
    });

    if (debtsInGroups.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'You do not owe this friend any money.' } });
    }

    debtsInGroups.sort((a, b) => b.amountWeOwe - a.amountWeOwe);

    let remainingAmountToSettle = Number(amount);
    const createdExpenses = [];
    const Notification = require('../models/Notification');
    
    // We can't cleanly import cache if groupController has a circular dependency, but we can try
    let cache = null;
    try {
      cache = require('./groupController').cache;
    } catch(e) {}

    for (const debt of debtsInGroups) {
      if (remainingAmountToSettle <= 0) break;

      const amountToPayHere = Math.min(remainingAmountToSettle, debt.amountWeOwe);
      remainingAmountToSettle -= amountToPayHere;
      remainingAmountToSettle = Math.round(remainingAmountToSettle * 100) / 100;

      const expense = await Expense.create({
        groupId: debt.groupId,
        description: note ? `Settlement: ${note}` : 'Settlement',
        amount: Number(amountToPayHere),
        category: 'settlement',
        paidBy: req.user._id,
        splits: [{ user: friendId, amountOwed: Number(amountToPayHere) }],
        date: Date.now()
      });

      createdExpenses.push(expense);

      const group = groups.find(g => g._id.toString() === debt.groupId.toString());
      await Notification.create({
        userId: friendId,
        type: 'settlement',
        message: `${req.user.name || 'Someone'} paid you ₹${Number(amountToPayHere).toFixed(2)} in ${group.name}.`,
        relatedGroup: group._id,
        relatedExpense: expense._id
      });

      if (cache) cache.del(`balances_${debt.groupId.toString()}`);
    }

    res.status(200).json({ success: true, data: createdExpenses });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  getDashboardSummary,
  getActivityFeed,
  getNotifications,
  markNotificationRead,
  getFriendsBalances,
  settleWithFriend
};
