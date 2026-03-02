import { Router } from "express";
import {
  createClass,
  getAllClasses,
  getClassById,
  addStudentToClass,
  removeStudentFromClass,
  assignClassTeacher,
  getAvailableStudents,
} from "../controller/class.js";
import { verifyTokenMiddleware } from "../middleware/token.js";


const router = Router();

// Admin
router.post("/", verifyTokenMiddleware, createClass);
router.get("/", verifyTokenMiddleware, getAllClasses);
router.get("/available-students", verifyTokenMiddleware, getAvailableStudents);
router.get("/:id", getClassById);
router.patch("/assignClassTeacher/:id", assignClassTeacher);

// Admin / Teacher
router.post("/:classId/students", verifyTokenMiddleware, addStudentToClass);
router.delete("/:classId/students/:studentUserId", verifyTokenMiddleware, removeStudentFromClass);

export default router;
