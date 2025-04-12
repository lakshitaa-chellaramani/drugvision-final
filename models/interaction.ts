import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema({
  patient: {
    type: String,
    required: true,
  },
  drug1: {
    type: String,
    required: true,
  },
  drug2: {
    type: String,
    required: true,
  },
  severity: {
    type: Number, // e.g., 1–10 scale
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Interaction || mongoose.model('Interaction', InteractionSchema);

