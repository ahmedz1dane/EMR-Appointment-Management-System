import { loginUser, refreshUserToken, logoutUser } from '../services/authService.js';
import { sendResponse } from '../utils/response.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendResponse(res, 400, false, 'Please provide an email and password');
    }
    const data = await loginUser(email, password);
    sendResponse(res, 200, true, 'Login successful', data);
  } catch (error) {
    sendResponse(res, 401, false, error.message);
  }
};

export const refresh = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return sendResponse(res, 400, false, 'Refresh token required');
    }
    const data = await refreshUserToken(token);
    sendResponse(res, 200, true, 'Token refreshed successfully', data);
  } catch (error) {
    sendResponse(res, 401, false, error.message);
  }
};

export const logout = async (req, res) => {
  try {
    await logoutUser(req.user._id);
    sendResponse(res, 200, true, 'Logout successful');
  } catch (error) {
    sendResponse(res, 500, false, 'Server error');
  }
};
