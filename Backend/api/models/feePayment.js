import mongoose from "mongoose";

const feePaymentSchema = new mongoose.Schema(
  {
    studentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },
    // "2025-01" for MONTHLY, "Q1-2024-25" for QUARTERLY, "2024-25" for ANNUALLY
    month: { type: String, required: true },
    amountPaid: { type: Number, required: true },
    paymentMode: {
      type: String,
      enum: ["CASH", "UPI", "BANK_TRANSFER", "ONLINE"],
      required: true,
    },
    transactionId: { type: String, default: null }, // manual UPI/bank ref
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    receiptNumber: { type: String, required: true, unique: true },
    paidDate: { type: Date, default: Date.now },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
    status: { type: String, enum: ["PAID", "PARTIAL"], default: "PAID" },
    remarks: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("FeePayment", feePaymentSchema);
