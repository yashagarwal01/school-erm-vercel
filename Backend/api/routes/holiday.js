import express from "express";
import {
  createHoliday,
  getHolidays,
  deleteHoliday,
} from "../controller/holiday.js";

const router = express.Router();

// Admin only
router.post("/", createHoliday);
router.get("/", getHolidays);
router.delete("/:id", deleteHoliday);

export default router;
