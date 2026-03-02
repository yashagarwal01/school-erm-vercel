import { Router } from "express";
import { createSubject, createSubjectBulk, getSubjects } from "../controller/subject.js";
import { verifyTokenMiddleware } from "../middleware/token.js";

const router = Router();

router.post("/bulk", verifyTokenMiddleware, createSubjectBulk);
router.post("/", verifyTokenMiddleware, createSubject);
router.get("/", verifyTokenMiddleware, getSubjects);

export default router;
