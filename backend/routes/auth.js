const express = require('express');
const router = express.Router();
const { authUser, logoutUser, getUserProfile, updateProfile, getAuthStatus, googleLogin, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Unified Login / Signup
router.post('/', authUser);

// Logout
router.post('/logout', logoutUser);

// Profile (Protected)
router.route('/profile').get(protect, getUserProfile).put(protect, updateProfile);

// Password Update (Protected)
router.put('/profile/password', protect, updatePassword);

// Google Login
router.post('/google', googleLogin);

// Auth Status (Public, returns 200 always)
router.get('/status', getAuthStatus);

module.exports = router;
