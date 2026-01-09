// models/Counter.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // EMP-2026, STU-2026
  },
  seq: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Counter", counterSchema);
