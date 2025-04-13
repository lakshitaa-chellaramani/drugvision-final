import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  medication: { type: String, required: true },
  drugs: [{ name: { type: String, required: true } }],
  dosage: { type: String, required: true },
  frequency: { type: String, enum: ['once a day', 'twice a day','alternate days', 'once a week', 'as needed' ], required: true, },
  timeOfDay: { type: [String], enum: ['morning', 'afternoon', 'evening', 'night'], default: [], },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  prescribedBy: { type: String },
  patient: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Medication || mongoose.model('Medication', MedicationSchema);
