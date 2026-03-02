import { Router } from "express";
import {
  createFeeStructure,
  getFeeStructures,
  getFeeStructureById,
  getFeeStructureByClass,
  updateFeeStructure,
  collectFee,
  getStudentFeeOverview,
  getMyFeeOverview,
  getClassFeeOverview,
  downloadReceipt,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controller/fee.js";
import { verifyTokenMiddleware } from "../middleware/token.js";

const router = Router();

/* ---- Fee Structure ---- */
router.post("/structure", verifyTokenMiddleware, createFeeStructure);
router.get("/structure", verifyTokenMiddleware, getFeeStructures);
router.get("/structure/class/:classId", verifyTokenMiddleware, getFeeStructureByClass);
router.get("/structure/:id", verifyTokenMiddleware, getFeeStructureById);
router.put("/structure/:id", verifyTokenMiddleware, updateFeeStructure);

/* ---- Payments ---- */
router.post("/collect", verifyTokenMiddleware, collectFee);

/* ---- Overview ---- */
router.get("/my/overview", verifyTokenMiddleware, getMyFeeOverview);
router.get("/student/:studentUserId/overview", verifyTokenMiddleware, getStudentFeeOverview);
router.get("/class/:classId/overview", verifyTokenMiddleware, getClassFeeOverview);

/* ---- Receipt PDF ---- */
router.get("/receipt/:paymentId", verifyTokenMiddleware, downloadReceipt);

/* ---- Razorpay ---- */
router.post("/razorpay/create-order", verifyTokenMiddleware, createRazorpayOrder);
router.post("/razorpay/verify", verifyTokenMiddleware, verifyRazorpayPayment);

export default router;
