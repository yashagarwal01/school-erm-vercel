import express from "express";
import {
  getAttendanceByClassAndDate,
  updateAttendance,
  getStudentAttendance,
  adminGetAttendanceByClassAndDate,
  adminGetAttendanceRange,
  updatePermissions,
} from "../controller/attendance.js";
import { verifyTokenMiddleware } from "../middleware/token.js";


const router = express.Router();

// Admin only - must be before /:attendanceId routes to avoid conflict
router.get("/admin/class/:classId/date/:date", verifyTokenMiddleware, adminGetAttendanceByClassAndDate);
router.get("/admin/class/:classId", verifyTokenMiddleware, adminGetAttendanceRange);
router.put("/:attendanceId/permissions", verifyTokenMiddleware, updatePermissions);

// Teacher / Admin
router.get("/class/:classId/date/:date", verifyTokenMiddleware, getAttendanceByClassAndDate);
router.put("/:attendanceId", verifyTokenMiddleware, updateAttendance);

// Student / Admin
router.get("/student/:studentId", getStudentAttendance);

export default router;
