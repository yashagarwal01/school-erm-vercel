import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    employeeType: {
      type: String,
      required: true,
      enum: [
        "Teacher",
        "Principal",
        "VicePrincipal",
        "Accountant",
        "Clerk",
        "Librarian",
        "Peon",
        "Driver",
        "Admin",
        "Other",
      ],
    },

    // Only for teachers
    standards: {
      type: [String],
      default: [],
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
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    contact: {
      email: {
        type: String,
        lowercase: true,
        unique: true,
        sparse: true, // ✅ allows multiple null values
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

    salary: {
      type: Number,
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    leavingDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
