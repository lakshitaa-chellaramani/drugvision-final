import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  medication:{
    type: String,
    required:true
  },
  drugs: [
    {
      name: {
        type: String,
        required: true,
      }
    }
  ],
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
  prescribedBy: {
    type: String,
  },
  patient: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Medication || mongoose.model('Medication', MedicationSchema);
