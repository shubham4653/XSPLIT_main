const express = require('express');
const router = express.Router();
const { getDashboardSummary, getActivityFeed, getNotifications, markNotificationRead } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Get dashboard summary
router.get('/dashboard', protect, getDashboardSummary);

// Get activity feed
router.get('/activity', protect, getActivityFeed);

// Notifications
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
