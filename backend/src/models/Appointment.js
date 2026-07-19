import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // Format: HH:mm
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Arrived', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  purpose: {
    type: String
  },
  notes: {
    type: String
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Crucial unique compound index to prevent double booking of the exact same slot
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });
// Index for fast queries
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ department: 1, date: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
