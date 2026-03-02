import { Router } from "express";
import { createExam, getExams } from "../controller/exam.js";
import { verifyTokenMiddleware } from "../middleware/token.js";

const router = Router();

router.post("/", verifyTokenMiddleware, createExam);
router.get("/", verifyTokenMiddleware, getExams);

export default router;
