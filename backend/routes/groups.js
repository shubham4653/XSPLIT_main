const express = require('express');
const router = express.Router();
const { getGroupBalances, createGroup, getGroups, getGroupById, settleDebt, getGroupPreview, joinGroup, updateGroup, leaveGroup, deleteGroup, getCollaborators, addMemberToGroup } = require('../controllers/groupController');
const { getGroupExpenses } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createGroup);
router.get('/', protect, getGroups);

// Collaborators route
router.get('/collaborators', protect, getCollaborators);

router.get('/:id', protect, getGroupById);
router.put('/:id', protect, updateGroup);
router.delete('/:id', protect, deleteGroup);
// Public/Semi-public preview route
router.get('/:id/preview', protect, getGroupPreview);

// Join/Leave group routes
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);

// Add member directly
router.post('/:id/members', protect, addMemberToGroup);

// Get group balances and settlement transactions
router.get('/:id/balances', protect, getGroupBalances);

// Settle debt
router.post('/:id/settle', protect, settleDebt);

// Get group expenses
router.get('/:groupId/expenses', protect, getGroupExpenses);

module.exports = router;
