import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    index: true
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    index: true
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required']
  },
  dob: {
    type: Date,
    required: [true, 'Date of Birth is required']
  }
}, { timestamps: true });

// Ensure text search if needed, but simple index is better for exact/prefix
patientSchema.index({ name: 1, mobileNumber: 1 });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
