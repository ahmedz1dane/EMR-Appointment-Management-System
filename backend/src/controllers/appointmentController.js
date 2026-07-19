import { bookAppointment, fetchAppointments, updateAppointment, deleteAppointment, markArrived } from '../services/appointmentService.js';
import { sendResponse } from '../utils/response.js';

const notifySockets = (req, event, data) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(event, data);
  }
};

export const createAppointment = async (req, res) => {
  try {
    const appointment = await bookAppointment(req.body, req.user);
    notifySockets(req, 'appointment_created', appointment);
    sendResponse(res, 201, true, 'Appointment created successfully', appointment);
  } catch (error) {
    if (error.message.includes('already booked')) {
      return sendResponse(res, 409, false, error.message);
    }
    sendResponse(res, 500, false, error.message);
  }
};

export const getAppointments = async (req, res) => {
  try {
    const { appointments, meta } = await fetchAppointments(req.query, req.user);
    sendResponse(res, 200, true, 'Appointments fetched successfully', appointments, meta);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

export const modifyAppointment = async (req, res) => {
  try {
    const appointment = await updateAppointment(req.params.id, req.body, req.user);
    notifySockets(req, 'appointment_updated', appointment);
    sendResponse(res, 200, true, 'Appointment updated successfully', appointment);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await deleteAppointment(req.params.id, req.user);
    notifySockets(req, 'appointment_cancelled', appointment);
    sendResponse(res, 200, true, 'Appointment cancelled successfully', appointment);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

export const setPatientArrived = async (req, res) => {
  try {
    const appointment = await markArrived(req.params.id, req.user);
    notifySockets(req, 'appointment_updated', appointment);
    sendResponse(res, 200, true, 'Patient marked as arrived', appointment);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
