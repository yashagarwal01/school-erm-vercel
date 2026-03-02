import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },

    studentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    rollNumber: Number,

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subject",
      required: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exam",
      required: true,
    },

    marksObtained: {
      type: Number,
      required: true,
    },

    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);


markSchema.index(
  { studentUserId: 1, subjectId: 1, examId: 1 },
  { unique: true }
);

export default mongoose.model("mark", markSchema);