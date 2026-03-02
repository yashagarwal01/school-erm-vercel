import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exam",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },

    maxMarks: {
      type: Number,
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

export default mongoose.model("subject", subjectSchema);