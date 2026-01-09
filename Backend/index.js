import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth from "./api/routes/auth.js";
import admin from "./api/routes/admin.js";
import classes from "./api/routes/class.js";
import attendance from "./api/routes/attendance.js";
import { connectDB } from "./config/db.js";

const app = express();

/* 🔐 CORS CONFIG */
app.use(
  cors({
    origin: "http://localhost:3000", // Next.js frontend
    credentials: true,               // allow cookies / auth headers
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(cookieParser());

// DB
connectDB();

// Routes
app.use("/api/auth", auth);
app.use("/api/admin", admin);
app.use("/api/classes", classes);
app.use("/api/attendance", attendance);

import  "./api/cron/attendence.js"


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  
  console.log(`🚀 Server running on port ${PORT}`);
});
