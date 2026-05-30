const User = require('../models/User');
const { generateTokens, clearTokens } = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Auth user & get token (Unified Login/Signup)
// @route   POST /api/auth
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password, name, phone, upiId } = req.body;

    // Validate input basic presence
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Please provide email and password' } });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    // Scenario 1: User exists -> Login flow
    if (user) {
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
      }

      // Generate tokens
      generateTokens(res, user._id);

      user.lastLogin = Date.now();
      await user.save();

      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          upiId: user.upiId,
          profilePicture: user.profilePicture,
          preferences: user.preferences
        }
      });
    }

    // Scenario 2: User doesn't exist -> Signup flow
    // If name is not provided, prompt frontend to ask for name
    if (!name) {
      return res.status(404).json({ 
        success: false, 
        error: { 
          code: 'REQUIRES_NAME', 
          message: 'User not found. Please provide a name to create an account.' 
        } 
      });
    }

    // If name is provided, create the new user
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      upiId,
      lastLogin: Date.now()
    });

    if (newUser) {
      generateTokens(res, newUser._id);

      return res.status(201).json({
        success: true,
        data: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          upiId: newUser.upiId,
          profilePicture: newUser.profilePicture,
          preferences: newUser.preferences
        }
      });
    } else {
      return res.status(400).json({ success: false, error: { message: 'Invalid user data' } });
    }
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  clearTokens(res);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          upiId: user.upiId,
          profilePicture: user.profilePicture,
          preferences: user.preferences
        }
      });
    } else {
      res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.upiId = req.body.upiId !== undefined ? req.body.upiId : user.upiId;
      user.profilePicture = req.body.profilePicture || user.profilePicture;

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        data: {
          _id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          upiId: updatedUser.upiId,
          profilePicture: updatedUser.profilePicture
        }
      });
    } else {
      res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/profile/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: { message: 'Please provide a new password' } });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    user.password = password; // pre-save hook will hash it
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// @desc    Get auth status without throwing 401
// @route   GET /api/auth/status
// @access  Public
const getAuthStatus = async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(200).json({ success: true, data: { isAuthenticated: false } });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';
    const decoded = require('jsonwebtoken').verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(200).json({ success: true, data: { isAuthenticated: false } });
    }

    return res.status(200).json({
      success: true,
      data: {
        isAuthenticated: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          upiId: user.upiId,
          profilePicture: user.profilePicture,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    return res.status(200).json({ success: true, data: { isAuthenticated: false } });
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: { message: 'No Google token provided' } });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, error: { message: 'Invalid Google token' } });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      // Create new user via Google
      user = await User.create({
        name: payload.name,
        email: payload.email,
        authProvider: 'google',
        googleId: payload.sub,
        profilePicture: payload.picture,
        lastLogin: Date.now()
      });
    } else {
      // If user exists, update last login and provider if needed
      user.lastLogin = Date.now();
      if (!user.googleId) {
        user.googleId = payload.sub;
        if (user.authProvider === 'local') {
          // You could keep it local or change it. Let's not overwrite if they had a local pass.
        }
      }
      await user.save();
    }

    generateTokens(res, user._id);

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        upiId: user.upiId,
        profilePicture: user.profilePicture,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  authUser,
  logoutUser,
  getUserProfile,
  updateProfile,
  getAuthStatus,
  updatePassword,
  googleLogin
};
