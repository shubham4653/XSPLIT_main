const jwt = require('jsonwebtoken');

const generateTokens = (res, userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret';

  // Generate Access Token (7d)
  const accessToken = jwt.sign({ userId }, jwtSecret, {
    expiresIn: '7d'
  });

  // Generate Refresh Token (7d)
  const refreshToken = jwt.sign({ userId }, refreshSecret, {
    expiresIn: '7d'
  });

  const isProd = process.env.NODE_ENV === 'production';

  // Set Access Token in HTTP-only cookie
  res.cookie('jwt', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Set Refresh Token in HTTP-only cookie
  res.cookie('jwt_refresh', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return { accessToken, refreshToken };
};

const clearTokens = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
    expires: new Date(0)
  };

  res.cookie('jwt', '', cookieOptions);
  res.cookie('jwt_refresh', '', cookieOptions);
};

module.exports = { generateTokens, clearTokens };
