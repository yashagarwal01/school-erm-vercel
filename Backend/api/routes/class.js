import { Router } from "express";
import {
  createClass,
  getAllClasses,
  getClassById,
  addStudentToClass,
  removeStudentFromClass,
} from "../controller/class.js";
import { verifyTokenMiddleware } from "../middleware/token.js";


const router = Router();

// Admin
router.post("/",verifyTokenMiddleware, createClass);
router.get("/",verifyTokenMiddleware, getAllClasses);
router.get("/:id", getClassById);

// Admin / Teacher
router.post("/:classId/students",verifyTokenMiddleware, addStudentToClass);
router.delete("/:classId/students/:studentUserId",verifyTokenMiddleware, removeStudentFromClass);

export default router;
