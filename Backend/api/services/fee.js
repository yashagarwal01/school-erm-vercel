import crypto from "crypto";
import Razorpay from "razorpay";
import FeeStructure from "../models/feeStructure.js";
import FeePayment from "../models/feePayment.js";
import Class from "../models/class.js";
import mongoose from "mongoose";

/* ===============================
   HELPERS
================================ */

const generateReceiptNumber = () => {
  const ts = Date.now().toString().slice(-7);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RCP-${ts}-${rand}`;
};

/**
 * Returns ["2024-04","2024-05",...,"2025-03"] for academicYear "2024-25"
 */
const getAcademicYearMonths = (academicYear) => {
  const [startYearStr] = academicYear.split("-");
  const startYear = parseInt(startYearStr, 10);
  const months = [];
  for (let m = 4; m <= 12; m++) {
    months.push(`${startYear}-${String(m).padStart(2, "0")}`);
  }
  for (let m = 1; m <= 3; m++) {
    months.push(`${startYear + 1}-${String(m).padStart(2, "0")}`);
  }
  return months;
};

/* ===============================
   FEE STRUCTURE
================================ */

export const createFeeStructure = async (data) => {
  const totalAmount = (data.components ?? []).reduce(
    (sum, c) => sum + c.amount,
    0
  );
  return await FeeStructure.create({ ...data, totalAmount });
};

export const getFeeStructures = async (query = {}) => {
  // Only pass known filter fields to mongoose
  const filter = {};
  if (query.classId) filter.classId = query.classId;
  if (query.academicYear) filter.academicYear = query.academicYear;
  if (query.feeType) filter.feeType = query.feeType;
  return await FeeStructure.find(filter)
    .populate("classId", "className section")
    .sort({ createdAt: -1 });
};

export const getFeeStructureById = async (id) => {
  return await FeeStructure.findById(id).populate("classId", "className section");
};

export const getFeeStructureByClass = async (classId, academicYear) => {
  const filter = { classId };
  if (academicYear) filter.academicYear = academicYear;
  return await FeeStructure.find(filter).populate("classId", "className section");
};

export const updateFeeStructure = async (id, data) => {
  if (data.components) {
    data.totalAmount = data.components.reduce((sum, c) => sum + c.amount, 0);
  }
  return await FeeStructure.findByIdAndUpdate(id, data, { new: true }).populate(
    "classId",
    "className section"
  );
};

/* ===============================
   PAYMENTS — ADMIN (Manual)
================================ */

export const collectFee = async (data) => {
  const receiptNumber = generateReceiptNumber();
  return await FeePayment.create({ ...data, receiptNumber });
};

/* ===============================
   FEE STATUS — STUDENT
================================ */

export const getStudentFeeOverview = async (studentUserId, academicYear) => {
  // 1. Find student's class
  const studentClass = await Class.findOne({
    "students.studentUserId": studentUserId
  });


  if (!studentClass) return { classId: null, structure: null, months: [] };

  // 2. Get fee structure for the class + academic year
  const structure = await FeeStructure.findOne({
    classId: studentClass._id,
    academicYear,
    feeType: "MONTHLY",
  });

  // 3. Get all payments for this student this year
  const payments = await FeePayment.find({
    studentUserId,
    classId: studentClass._id,
  }).lean();

  const paymentMap = {};
  payments.forEach((p) => {
    paymentMap[p.month] = p;
  });

  // 4. Build months grid
  const months = getAcademicYearMonths(academicYear).map((month) => {
    const payment = paymentMap[month] ?? null;
    return {
      month,
      dueAmount: structure?.totalAmount ?? 0,
      payment,
      status: payment ? payment.status : "PENDING",
    };
  });

  const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0);
  const totalDue =
    (structure?.totalAmount ?? 0) * months.filter((m) => !m.payment).length;

  return {
    classId: studentClass._id,
    className: studentClass.className,
    section: studentClass.section,
    structure,
    months,
    summary: {
      totalPaid,
      totalDue,
      paidMonths: payments.length,
      pendingMonths: months.filter((m) => !m.payment).length,
    },
  };
};

/* ===============================
   FEE STATUS — CLASS (Admin)
================================ */

export const getClassFeeOverview = async (classId, academicYear, month) => {
  // Get all students in class
  const cls = await Class.findById(classId).populate(
    "students.studentUserId",
    "name loginId"
  );
  if (!cls) return [];

  // Get fee structure
  const structure = await FeeStructure.findOne({
    classId,
    academicYear,
    feeType: "MONTHLY",
  });

  // Build query
  const paymentFilter = { classId };
  if (month) paymentFilter.month = month;

  const payments = await FeePayment.find(paymentFilter).lean();
  const paymentMap = {};
  payments.forEach((p) => {
    const key = `${p.studentUserId}-${p.month}`;
    paymentMap[key] = p;
  });

  return cls.students.map((s) => {
    const uid = s.studentUserId._id.toString();
    const paid = month ? !!paymentMap[`${uid}-${month}`] : null;
    const payment = month ? paymentMap[`${uid}-${month}`] ?? null : null;
    return {
      studentUserId: s.studentUserId,
      rollNumber: s.rollNumber,
      status: paid ? payment.status : "PENDING",
      payment,
      dueAmount: structure?.totalAmount ?? 0,
    };
  });
};

/* ===============================
   PAYMENT LOOKUP (for receipt)
================================ */

export const getPaymentById = async (id) => {
  return await FeePayment.findById(id)
    .populate("studentUserId", "name loginId")
    .populate("classId", "className section")
    .populate("feeStructureId")
    .populate("collectedBy", "name");
};

export const getStudentPayments = async (studentUserId) => {
  return await FeePayment.find({ studentUserId })
    .populate("feeStructureId", "components totalAmount")
    .sort({ paidDate: -1 });
};

/* ===============================
   RAZORPAY
================================ */

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

export const createRazorpayOrder = async ({
  amount,
  studentUserId,
  feeStructureId,
  month,
}) => {
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // convert to paise
    currency: "INR",
    receipt: `fee_${String(studentUserId).slice(-6)}_${month}`,
    notes: { studentUserId, feeStructureId, month },
  });
  return order;
};

export const verifyAndSavePayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  studentUserId,
  classId,
  feeStructureId,
  month,
  amountPaid,
}) => {
  // Verify Razorpay signature
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new Error("Payment verification failed: invalid signature");
  }

  const receiptNumber = generateReceiptNumber();
  return await FeePayment.create({
    studentUserId,
    classId,
    feeStructureId,
    month,
    amountPaid,
    paymentMode: "ONLINE",
    razorpayOrderId,
    razorpayPaymentId,
    receiptNumber,
    status: "PAID",
  });
};
