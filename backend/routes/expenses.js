const express = require('express');
const router = express.Router();
const { createExpense, deleteExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createExpense);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
