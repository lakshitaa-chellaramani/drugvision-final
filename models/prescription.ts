// This file would contain the Prescription model schema
// Commented out as requested

/*
import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medications: [{
    medication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
    },
    dosage: String,
    frequency: String,
    duration: String,
  }],
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
  prescriptionImage: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
*/
