const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  expenseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Expense', 
    required: true, 
    index: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    required: true, 
    maxlength: 500,
    trim: true
  },
  mentions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
