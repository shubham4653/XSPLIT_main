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

module.exports = {
  getDashboardSummary,
  getActivityFeed,
  getNotifications,
  markNotificationRead
};
