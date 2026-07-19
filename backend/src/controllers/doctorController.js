import { getAllDoctors, createDoctorSchedule, getDoctorSchedule } from '../services/doctorService.js';
import { sendResponse } from '../utils/response.js';

export const getDoctors = async (req, res) => {
  try {
    const doctors = await getAllDoctors(req.query);
    sendResponse(res, 200, true, 'Doctors fetched successfully', doctors);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const schedule = await createDoctorSchedule(doctorId, req.body);
    sendResponse(res, 200, true, 'Schedule updated successfully', schedule);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

export const fetchSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const schedule = await getDoctorSchedule(doctorId);
    if (!schedule) {
      return sendResponse(res, 404, false, 'Schedule not found');
    }
    sendResponse(res, 200, true, 'Schedule fetched successfully', schedule);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
