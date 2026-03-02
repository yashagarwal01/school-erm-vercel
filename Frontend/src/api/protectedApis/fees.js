import protectedApi from "../protectedApi";

/* =========================
   FEE STRUCTURE
========================= */

export const createFeeStructure = async (payload) => {
  const res = await protectedApi.post("/fees/structure", payload);
  return res.data;
};

export const getFeeStructures = async (params = {}) => {
  const res = await protectedApi.get("/fees/structure", { params });
  return res.data;
};

export const getFeeStructureById = async (id) => {
  const res = await protectedApi.get(`/fees/structure/${id}`);
  return res.data;
};

export const getFeeStructureByClass = async (classId, academicYear) => {
  const res = await protectedApi.get(`/fees/structure/class/${classId}`, {
    params: { academicYear },
  });
  return res.data;
};

export const updateFeeStructure = async (id, payload) => {
  const res = await protectedApi.put(`/fees/structure/${id}`, payload);
  return res.data;
};

/* =========================
   PAYMENTS
========================= */

/**
 * Admin manually collects a fee (CASH / UPI / BANK_TRANSFER)
 * payload: { studentUserId, classId, feeStructureId, month, amountPaid, paymentMode, transactionId?, remarks? }
 */
export const collectFee = async (payload) => {
  const res = await protectedApi.post("/fees/collect", payload);
  return res.data;
};

/* =========================
   OVERVIEW
========================= */

/** Student: get their own fee overview for a given academic year */
export const getMyFeeOverview = async (academicYear) => {
  const res = await protectedApi.get("/fees/my/overview", {
    params: { academicYear },
  });
  return res.data;
};

/** Admin: get fee overview for a specific student */
export const getStudentFeeOverview = async (studentUserId, academicYear) => {
  const res = await protectedApi.get(`/fees/student/${studentUserId}/overview`, {
    params: { academicYear },
  });
  return res.data;
};

/** Admin: get fee overview for all students in a class for a month */
export const getClassFeeOverview = async (classId, academicYear, month) => {
  const res = await protectedApi.get(`/fees/class/${classId}/overview`, {
    params: { academicYear, month },
  });
  return res.data;
};

/* =========================
   RECEIPT
========================= */

/** Opens receipt PDF in a new tab */
export const downloadReceipt = (paymentId) => {
  const token = localStorage.getItem("accessToken");
  const base = process.env.NEXT_PUBLIC_API_URL;
  window.open(
    `${base}/fees/receipt/${paymentId}?token=${token}`,
    "_blank"
  );
};

/* =========================
   RAZORPAY
========================= */

/** Create a Razorpay order on the backend */
export const createRazorpayOrder = async (payload) => {
  const res = await protectedApi.post("/fees/razorpay/create-order", payload);
  return res.data;
};

/**
 * Verify payment and save to DB
 * payload: { razorpayOrderId, razorpayPaymentId, razorpaySignature, classId, feeStructureId, month, amountPaid }
 */
export const verifyRazorpayPayment = async (payload) => {
  const res = await protectedApi.post("/fees/razorpay/verify", payload);
  return res.data;
};
