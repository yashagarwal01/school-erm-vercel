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

// Cron
import "./api/cron/attendence.js";

const app = express();

/* ===============================
   🔐 CORS CONFIG (PRODUCTION)
================================ */
app.use(
  cors({
    origin: [process.env.CLIENT_URL,"http://localhost:3000",   ], // HTTPS frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Required for proxy (Nginx / Lightsail)
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

/* ===============================
   DB CONNECTION
================================ */
connectDB();

/* ===============================
   ROUTES
================================ */
app.use("/api/auth", auth);
app.use("/api/admin", admin);
app.use("/api/classes", classes);
app.use("/api/attendance", attendance);

/* ===============================
   HEALTH CHECK
================================ */
app.get("/health", (_, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
