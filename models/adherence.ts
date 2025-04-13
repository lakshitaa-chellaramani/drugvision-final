import mongoose from 'mongoose';

const AdherenceSchema = new mongoose.Schema({
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true,
  },
  date: {
    type: String, // Format: 'YYYY-MM-DD'
    required: true,
  },
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    required: true,
  },
  taken: {
    type: Boolean,
    default: null, // null = not marked yet
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
  }
}, { timestamps: true });

AdherenceSchema.index({ medicationId: 1, date: 1, timeOfDay: 1 }, { unique: true });

export default mongoose.models.Adherence || mongoose.model('Adherence', AdherenceSchema);
