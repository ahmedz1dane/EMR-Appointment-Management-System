import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import { logAudit } from '../utils/logger.js';

export const bookAppointment = async (appointmentData, user) => {
  const { patientId, patientData, doctor, department, date, time, purpose, notes } = appointmentData;
  let patient;

  if (patientId) {
    patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');
  } else if (patientData) {
    // New patient creation
    patient = await Patient.findOne({ mobileNumber: patientData.mobileNumber });
    if (!patient) {
      patient = new Patient(patientData);
      await patient.save();
    }
  } else {
    throw new Error('Patient information is required');
  }

  try {
    const appointment = new Appointment({
      patient: patient._id,
      doctor,
      department,
      date,
      time,
      purpose,
      notes,
      bookedBy: user._id
    });

    await appointment.save();

    logAudit({
      user: user._id,
      role: user.role,
      action: 'Appointment Created',
      entity: 'Appointment',
      entityId: appointment._id
    });

    return appointment;
  } catch (error) {
    // Catch unique constraint violation (duplicate key error index)
    if (error.code === 11000) {
      throw new Error('This slot is already booked. Please choose another slot.');
    }
    throw error;
  }
};

export const fetchAppointments = async (query, user) => {
  const filter = {};
  
  if (user.role === 'Doctor') {
    filter.doctor = user._id;
  } else if (query.doctor) {
    filter.doctor = query.doctor;
  }

  if (query.patient) {
    // Sub-query for patient by name or mobile
    const patients = await Patient.find({
      $or: [
        { name: { $regex: query.patient, $options: 'i' } },
        { mobileNumber: { $regex: query.patient, $options: 'i' } }
      ]
    });
    filter.patient = { $in: patients.map(p => p._id) };
  }

  if (query.department) filter.department = query.department;
  if (query.status) filter.status = query.status;
  if (query.startDate && query.endDate) {
    filter.date = { $gte: query.startDate, $lte: query.endDate };
  } else if (query.date) {
    filter.date = query.date;
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  const sortBy = query.sortBy || 'date';
  const order = query.order === 'desc' ? -1 : 1;
  const sort = { [sortBy]: order, time: order };

  const total = await Appointment.countDocuments(filter);
  const appointments = await Appointment.find(filter)
    .populate('patient', 'name mobileNumber')
    .populate('doctor', 'name department')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    appointments,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const updateAppointment = async (id, updateData, user) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) throw new Error('Appointment not found');

  if (user.role === 'Doctor' && appointment.doctor.toString() !== user._id.toString()) {
    throw new Error('Not authorized to update this appointment');
  }

  // Receptionist/Admin can update date, time, purpose, notes, status
  if (user.role === 'Doctor') {
    if (updateData.notes) appointment.notes = updateData.notes;
  } else {
    if (updateData.date) appointment.date = updateData.date;
    if (updateData.time) appointment.time = updateData.time;
    if (updateData.purpose) appointment.purpose = updateData.purpose;
    if (updateData.notes) appointment.notes = updateData.notes;
    if (updateData.status) appointment.status = updateData.status;
  }

  try {
    await appointment.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('This slot is already booked. Please choose another slot.');
    }
    throw error;
  }

  logAudit({
    user: user._id,
    role: user.role,
    action: 'Appointment Updated',
    entity: 'Appointment',
    entityId: appointment._id
  });

  return appointment;
};

export const deleteAppointment = async (id, user) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) throw new Error('Appointment not found');

  appointment.status = 'Cancelled';
  await appointment.save();

  logAudit({
    user: user._id,
    role: user.role,
    action: 'Appointment Cancelled',
    entity: 'Appointment',
    entityId: appointment._id
  });

  return appointment;
};

export const markArrived = async (id, user) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) throw new Error('Appointment not found');

  appointment.status = 'Arrived';
  await appointment.save();

  logAudit({
    user: user._id,
    role: user.role,
    action: 'Patient Arrived',
    entity: 'Appointment',
    entityId: appointment._id
  });

  return appointment;
};
