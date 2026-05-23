const Expense = require('../models/Expense');
const Group = require('../models/Group');
const { cache } = require('./groupController');

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { groupId, description, amount, category, splits, receipt, date } = req.body;

    // Verify group membership
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: { message: 'Group not found' } });
    }

    if (!group.members.includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, error: { message: 'Not authorized in this group' } });
    }

    // Validate splits match total amount (allowing tiny floating point difference)
    const totalSplit = splits.reduce((sum, split) => sum + Number(split.amountOwed), 0);
    if (Math.abs(totalSplit - amount) > 0.05) {
      return res.status(400).json({ success: false, error: { message: 'Split amounts do not equal total expense amount' } });
    }

    const expense = await Expense.create({
      groupId,
      description,
      amount,
      category,
      paidBy: req.user._id,
      splits,
      receipt,
      date: date || Date.now()
    });

    // Create notifications for all other members
    const Notification = require('../models/Notification');
    const notifications = group.members
      .filter(memberId => memberId.toString() !== req.user._id.toString())
      .map(memberId => ({
        userId: memberId,
        type: 'expense_added',
        title: `New expense in ${group.name}`,
        message: `${req.user.name || 'Someone'} added "${description}" for ₹${amount.toFixed(2)}.`,
        relatedGroup: groupId,
        relatedExpense: expense._id
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Invalidate group balances cache
    cache.del(`balances_${groupId}`);

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Get expenses for a group
// @route   GET /api/groups/:groupId/expenses
// @access  Private
const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: { message: 'Group not found' } });
    }

    if (!group.members.includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, error: { message: 'Not authorized in this group' } });
    }

    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'name email profilePicture')
      .populate('splits.user', 'name profilePicture')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: { message: 'Expense not found' } });
    }

    const group = await Group.findById(expense.groupId);
    
    // Only creator or group owner can delete
    if (
      expense.paidBy.toString() !== req.user._id.toString() &&
      group.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, error: { message: 'Not authorized to delete this expense' } });
    }

    await expense.deleteOne();

    // Invalidate group balances cache
    cache.del(`balances_${expense.groupId}`);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  createExpense,
  getGroupExpenses,
  deleteExpense
};
