import mongoose from "mongoose"

const AppointmentSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 30,
  },
  type: {
    type: String,
    enum: ["Initial Consultation", "Follow-up", "Medication Review", "Regular Check-up", "Comprehensive Exam"],
    required: true,
  },
  status: {
    type: String,
    enum: ["requested", "confirmed", "cancelled", "completed"],
    default: "requested",
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema)
