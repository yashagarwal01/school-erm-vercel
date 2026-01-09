import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true, // e.g., STU-001 or roll number
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    contact: {
      email: {
        type: String,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
      },
    },

    // 🔹 Guardian (generic, if needed)
    guardian: {
      name: String,
      relation: String,
      phone: String,
      email: String,
    },

    // 🔹 Separate fields for parents (optional)
    father: {
      name: { type: String },
      contact: {
        phone: String,
        email: String,
      },
    },
    mother: {
      name: { type: String },
      contact: {
        phone: String,
        email: String,
      },
    },
    status: {
      type: String,
      enum: ["Studying", "Graduated", "Dropped"],
      default: "Studying",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
