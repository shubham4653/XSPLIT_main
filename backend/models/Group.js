const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  icon: {
    type: String
  },
  color: {
    type: String
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }],
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  budget: {
    type: Number,
    default: 0
  },
  isArchived: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
