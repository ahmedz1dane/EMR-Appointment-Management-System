import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ email: 'admin@emr.com' });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@emr.com',
        password: 'admin', // will be hashed by pre-save hook
        role: 'Super Admin'
      });
      console.log('Super Admin created successfully. (Email: admin@emr.com, Password: admin)');
    } else {
      console.log('Super Admin already exists.');
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedSuperAdmin();
