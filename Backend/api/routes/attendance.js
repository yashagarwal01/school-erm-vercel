import express from "express";
import {
  getAttendanceByClassAndDate,
  updateAttendance,
  getStudentAttendance,
} from "../controller/attendance.js";
import { verifyTokenMiddleware } from "../middleware/token.js";


const router = express.Router();

// Teacher / Admin
router.get("/class/:classId/date/:date",verifyTokenMiddleware, getAttendanceByClassAndDate);
router.put("/:attendanceId",verifyTokenMiddleware, updateAttendance);

// Student / Admin
router.get("/student/:studentId", getStudentAttendance);

export default router;
