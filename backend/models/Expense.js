const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amountOwed: { 
    type: Number, 
    required: true, 
    min: 0 
  }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true, 
    index: true 
  },
  description: { 
    type: String, 
    required: true, 
    maxlength: 100,
    trim: true
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  category: { 
    type: String, 
    enum: ['food', 'transport', 'housing', 'entertainment', 'shopping', 'healthcare', 'travel', 'utilities', 'education', 'settlement', 'other'],
    default: 'other'
  },
  paidBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  splits: [splitSchema],
  receipt: {
    type: String // base64 or cloud URL
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  recurringConfig: {
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'custom'] 
    },
    interval: Number, // days
    endDate: Date,
    occurrences: Number
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  editHistory: [{
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: Date,
    changes: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
