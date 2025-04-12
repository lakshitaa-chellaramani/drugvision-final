import mongoose from "mongoose"

const HealthPlanSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  medications: [
    {
      medication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medication",
      },
      dosage: String,
      frequency: String,
      time: String,
      withFood: Boolean,
    },
  ],
  diet: [
    {
      type: String,
    },
  ],
  exercise: [
    {
      type: String,
    },
  ],
  sleep: [
    {
      type: String,
    },
  ],
  additionalRecommendations: {
    type: String,
  },
  progress: {
    medicationAdherence: {
      type: Number,
      default: 0,
    },
    dietAdherence: {
      type: Number,
      default: 0,
    },
    exerciseAdherence: {
      type: Number,
      default: 0,
    },
    sleepQuality: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.HealthPlan || mongoose.model("HealthPlan", HealthPlanSchema)
