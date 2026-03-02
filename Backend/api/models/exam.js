import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    academicYear: { type: String, required: true },
    createdBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);
