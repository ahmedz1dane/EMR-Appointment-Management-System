import User from '../models/User.js';
import { sendResponse } from '../utils/response.js';

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !role) {
      return sendResponse(res, 400, false, 'Please provide all required fields');
    }

    if (role === 'Doctor' && !department) {
      return sendResponse(res, 400, false, 'Department is required for Doctor');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendResponse(res, 400, false, 'User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department
    });

    sendResponse(res, 201, true, `${role} created successfully`, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select('-password -refreshToken').sort({ createdAt: -1 });
    sendResponse(res, 200, true, 'Users fetched successfully', users);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
