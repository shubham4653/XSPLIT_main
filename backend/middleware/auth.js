const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';
      const decoded = jwt.verify(token, jwtSecret);

      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, error: { message: 'Not authorized, token failed' } });
    }
  } else {
    res.status(401).json({ success: false, error: { message: 'Not authorized, no token' } });
  }
};

module.exports = { protect };
