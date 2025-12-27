import { Router } from "express";
import {getStudent,createStudent,createEmployee,bulkCreateStudents,bulkCreateEmployee} from "../controller/admin.js"
import { verifyTokenMiddleware } from "../middleware/token.js";

const router = Router();

router.use(verifyTokenMiddleware);

router.get("/student", getStudent);
router.post("/student", createStudent);
router.post("/student/bulk", bulkCreateStudents);
router.post("/employee", createEmployee);
router.post("/employee/bulk", bulkCreateEmployee);

export default router;
