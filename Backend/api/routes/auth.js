import { Router } from "express";
import { login, register,refreshToken } from "../controller/auth.js";

const router = Router();

// router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

export default router;
