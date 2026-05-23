const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  type: { 
    type: String, 
    enum: ['expense_added', 'group_invite', 'settlement', 'mention', 'reminder'] 
  },
  message: {
    type: String,
    trim: true
  },
  relatedExpense: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Expense' 
  },
  relatedGroup: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group' 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
