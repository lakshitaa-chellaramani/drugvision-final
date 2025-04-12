// models/interaction.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IInteraction extends Document {
  drug1: string;
  drug2: string;
  severity: number;
  description: string;
  date: Date;
  patient?: mongoose.Types.ObjectId;
}

const InteractionSchema = new Schema<IInteraction>({
  drug1: { type: String, required: true },
  drug2: { type: String, required: true },
  severity: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: false }
});

// Create a compound index to prevent duplicate drug interaction pairs
InteractionSchema.index({ drug1: 1, drug2: 1 }, { unique: true });

export default mongoose.models.Interaction || mongoose.model<IInteraction>('Interaction', InteractionSchema);