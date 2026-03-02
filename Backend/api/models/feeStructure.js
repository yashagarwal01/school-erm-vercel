import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // "Tuition Fee", "Transport", "Sports" etc.
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const feeStructureSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },
    academicYear: { type: String, required: true }, // "2024-25"
    feeType: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "ANNUALLY"],
      default: "MONTHLY",
    },
    components: [componentSchema],
    totalAmount: { type: Number, required: true }, // auto-computed from components
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

feeStructureSchema.index(
  { classId: 1, academicYear: 1, feeType: 1 },
  { unique: true }
);

export default mongoose.model("FeeStructure", feeStructureSchema);
