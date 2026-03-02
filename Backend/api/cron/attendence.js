import cron from "node-cron";
import Class from "../models/class.js";
import { initializeAttendanceForClass } from "../utils/attendanceInitializer.js";

// Runs Mon–Sat at 00:01 IST. Sunday is always a holiday — no record needed.
// cron.schedule("* * * * * *", async () => {
cron.schedule("1 0 * * 1-6", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const classes = await Class.find({});

    for (const cls of classes) {
      await initializeAttendanceForClass(cls, today);
    }

    console.log(`✅ Attendance initialized for ${today.toDateString()}`);
  } catch (err) {
    console.error("❌ Attendance cron failed", err);
  }
});
