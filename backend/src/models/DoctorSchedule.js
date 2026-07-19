import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
}, { _id: false });

const breakSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
  day: { type: Number, required: true, enum: [0, 1, 2, 3, 4, 5, 6] },
  isWorking: { type: Boolean, default: false },
  sessions: [sessionSchema],
  breaks: [breakSchema]
}, { _id: false });

const doctorScheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  days: [dayScheduleSchema],
  slotDuration: {
    type: Number,
    required: true,
    default: 15
  }
}, { timestamps: true });

const DoctorSchedule = mongoose.model('DoctorSchedule', doctorScheduleSchema);
export default DoctorSchedule;
