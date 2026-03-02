import PDFDocument from "pdfkit";
import * as feeService from "../services/fee.js";

/* ===============================
   FEE STRUCTURE
================================ */

export const createFeeStructure = async (req, res) => {
  try {
    const data = await feeService.createFeeStructure({
      ...req.body,
      createdBy: req.user.userId,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFeeStructures = async (req, res) => {
  try {
    const data = await feeService.getFeeStructures(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFeeStructureById = async (req, res) => {
  try {
    const data = await feeService.getFeeStructureById(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFeeStructureByClass = async (req, res) => {
  try {
    const data = await feeService.getFeeStructureByClass(
      req.params.classId,
      req.query.academicYear
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateFeeStructure = async (req, res) => {
  try {
    const data = await feeService.updateFeeStructure(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   PAYMENTS
================================ */

export const collectFee = async (req, res) => {
  try {
    const data = await feeService.collectFee({
      ...req.body,
      collectedBy: req.user.userId,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudentFeeOverview = async (req, res) => {
  try {
    const academicYear = req.query.academicYear ?? getCurrentAcademicYear();
    const data = await feeService.getStudentFeeOverview(
      req.params.studentUserId,
      academicYear
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyFeeOverview = async (req, res) => {
  try {
    const academicYear = req.query.academicYear ?? getCurrentAcademicYear();
    const data = await feeService.getStudentFeeOverview(
      req.user.userId,
      academicYear
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClassFeeOverview = async (req, res) => {
  try {
    const { academicYear, month } = req.query;
    const data = await feeService.getClassFeeOverview(
      req.params.classId,
      academicYear ?? getCurrentAcademicYear(),
      month
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   RECEIPT PDF
================================ */

export const downloadReceipt = async (req, res) => {
  try {
    const payment = await feeService.getPaymentById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${payment.receiptNumber}.pdf`
    );
    doc.pipe(res);

    /* --- Header --- */
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("FEE RECEIPT", { align: "center" });
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("gray")
      .text("School Management System", { align: "center" });
    doc.fillColor("black").moveDown(0.8);

    /* --- Meta row --- */
    const metaY = doc.y;
    doc
      .fontSize(9)
      .text(`Receipt No: ${payment.receiptNumber}`, 50, metaY, { width: 240 });
    doc.text(
      `Date: ${new Date(payment.paidDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`,
      300,
      metaY,
      { align: "right", width: 245 }
    );
    doc.moveDown(1.5);

    /* --- Divider --- */
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#000").stroke();
    doc.moveDown(0.8);

    /* --- Student Info --- */
    doc.fontSize(11).font("Helvetica-Bold").text("Student Details");
    doc.moveDown(0.4);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Name          :  ${payment.studentUserId?.name ?? "-"}`);
    doc.text(`Login ID      :  ${payment.studentUserId?.loginId ?? "-"}`);
    const className = payment.classId?.className ?? "-";
    const section = payment.classId?.section ? ` - ${payment.classId.section}` : "";
    doc.text(`Class         :  ${className}${section}`);
    doc.text(`Period        :  ${payment.month}`);
    doc.moveDown(0.8);

    /* --- Fee Breakdown --- */
    doc.fontSize(11).font("Helvetica-Bold").text("Fee Breakdown");
    doc.moveDown(0.4);
    doc.fontSize(10).font("Helvetica");

    const components = payment.feeStructureId?.components ?? [];
    if (components.length) {
      components.forEach((c) => {
        doc.text(
          `${c.name.padEnd(20)}   ₹ ${c.amount.toLocaleString("en-IN")}`,
          { indent: 10 }
        );
      });
      doc.moveDown(0.4);
      doc
        .moveTo(50, doc.y)
        .lineTo(300, doc.y)
        .strokeColor("#ccc")
        .stroke();
      doc.moveDown(0.4);
    }

    doc
      .font("Helvetica-Bold")
      .text(
        `Total Fee :  ₹ ${(
          payment.feeStructureId?.totalAmount ?? 0
        ).toLocaleString("en-IN")}`
      );
    doc
      .font("Helvetica")
      .fillColor("#1a6b2e")
      .text(
        `Amount Paid :  ₹ ${payment.amountPaid.toLocaleString("en-IN")}`
      );
    doc.fillColor("black").moveDown(0.8);

    /* --- Payment Info --- */
    doc.fontSize(11).font("Helvetica-Bold").text("Payment Information");
    doc.moveDown(0.4);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Payment Mode  :  ${payment.paymentMode}`);
    doc.text(`Status        :  ${payment.status}`);
    if (payment.transactionId)
      doc.text(`Transaction ID :  ${payment.transactionId}`);
    if (payment.razorpayPaymentId)
      doc.text(`Razorpay Ref   :  ${payment.razorpayPaymentId}`);
    if (payment.collectedBy?.name)
      doc.text(`Collected By   :  ${payment.collectedBy.name}`);
    if (payment.remarks) doc.text(`Remarks        :  ${payment.remarks}`);

    doc.moveDown(3);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#000")
      .stroke();
    doc.moveDown(0.6);
    doc
      .fontSize(8)
      .fillColor("gray")
      .text(
        "This is a computer-generated receipt and does not require a physical signature.",
        { align: "center" }
      );

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   RAZORPAY
================================ */

export const createRazorpayOrder = async (req, res) => {
  try {
    const order = await feeService.createRazorpayOrder(req.body);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const payment = await feeService.verifyAndSavePayment({
      ...req.body,
      studentUserId: req.user.userId,
    });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ===============================
   UTIL
================================ */

const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  // Indian academic year: April to March
  if (month >= 4) return `${year}-${String(year + 1).slice(2)}`;
  return `${year - 1}-${String(year).slice(2)}`;
};
