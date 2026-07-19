import User from '../models/User.js';
import DoctorSchedule from '../models/DoctorSchedule.js';

export const getAllDoctors = async (query) => {
  const filter = { role: 'Doctor' };
  if (query.department) {
    filter.department = query.department;
  }
  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }
  return await User.find(filter).select('-password -refreshToken').sort({ name: 1 });
};

export const createDoctorSchedule = async (doctorId, scheduleData) => {
  let schedule = await DoctorSchedule.findOne({ doctor: doctorId });
  if (schedule) {
    Object.assign(schedule, scheduleData);
  } else {
    schedule = new DoctorSchedule({ doctor: doctorId, ...scheduleData });
  }
  return await schedule.save();
};

export const getDoctorSchedule = async (doctorId) => {
  return await DoctorSchedule.findOne({ doctor: doctorId });
};
