import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { logAudit } from '../utils/logger.js';

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
  
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });

  return { accessToken, refreshToken };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid credentials');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  logAudit({
    user: user._id,
    role: user.role,
    action: 'Login',
    entity: 'Auth'
  });

  return { 
    user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
    accessToken,
    refreshToken 
  };
};

export const refreshUserToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error('Invalid refresh token');
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return tokens;
};

export const logoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = null;
    await user.save();
    
    logAudit({
      user: user._id,
      role: user.role,
      action: 'Logout',
      entity: 'Auth'
    });
  }
};
