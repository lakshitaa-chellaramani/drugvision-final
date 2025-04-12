// This file contains the Doctor model schema
import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  medicalLicense: {
    type: String,
    required: true,
    unique: true,
  },
  specialty: {
    type: String,
    required: true,
  },
    createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
