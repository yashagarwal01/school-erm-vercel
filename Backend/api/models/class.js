import mongoose from "mongoose";

const classStudentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: Number,
      required: true,
    },
    studentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { _id: false } // prevents extra _id inside students array
);

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true, // e.g. "10", "12", "LKG"
      trim: true,
    },

    section: {
      type: String,
      trim: true,
      default: null, // optional
    },

    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // teacher userId
    },

    students: {
      type: [classStudentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("class", classSchema);
