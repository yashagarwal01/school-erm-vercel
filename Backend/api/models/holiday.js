import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    dateFrom: {
      type: Date,
      required: true,
      set: (v) => new Date(new Date(v).setHours(0, 0, 0, 0)),
    },
    dateTo: {
      type: Date,
      required: true,
      set: (v) => new Date(new Date(v).setHours(0, 0, 0, 0)),
    },

    title: {
      type: String,
      required: true, // e.g. "Diwali", "Independence Day"
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["NATIONAL", "FESTIVAL", "SCHOOL", "SUNDAY","GOVT ORDER"],
      required: true,
    },

    appliesToAllClasses: {
      type: Boolean,
      default: true,
    },

    classIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
  },
  {
    timestamps: true,
  }
);


export default mongoose.model("Holiday", holidaySchema);
