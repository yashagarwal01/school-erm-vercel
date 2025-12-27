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

    // Applicable only for teachers
    standards: {
      type: [String], // e.g. ["1", "2-A", "10"]
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
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    contact: {
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
      },
      phone: {
        type: String,
      },
      address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
      },
    },

    // Parent / Guardian info (optional)
    father: {
      name: String,
      contact: {
        phone: String,
        email: String,
      },
    },

    mother: {
      name: String,
      contact: {
        phone: String,
        email: String,
      },
    },

    salary: {
      type: Number,
    },

    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    leavingDate: {
      type: Date,
      default: null, // stays null while employee is active
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);


export default mongoose.model("teacher", employeeSchema);
