import { Router } from "express";
import {
  addMarks,
  getStudentMarks,
  getStudentExams,
  getClassResult,
  deleteMarks,
} from "../controller/mark.js";
import { verifyTokenMiddleware } from "../middleware/token.js";

const router = Router();

router.post("/", verifyTokenMiddleware, addMarks);
router.get("/student/exams", verifyTokenMiddleware, getStudentExams);
router.get("/student", verifyTokenMiddleware, getStudentMarks);
router.get("/class", verifyTokenMiddleware, getClassResult);
router.delete("/", verifyTokenMiddleware, deleteMarks);

export default router;
