import cron from "node-cron";
import Class from "../models/class.js";
import { initializeAttendanceForClass } from "../utils/attendanceInitializer.js"; 
// ⬆️ adjust path if needed

cron.schedule("1 0 * * 1-6", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isSaturday = today.getDay() === 6; // 6 = Saturday

    const classes = await Class.find({});

    for (const cls of classes) {
      // 1️⃣ Create attendance for today
      await initializeAttendanceForClass(cls, today);

      // 2️⃣ If Saturday → auto-create Sunday
      if (isSaturday) {
        const sunday = new Date(today);
        sunday.setDate(sunday.getDate() + 1);
        sunday.setHours(0, 0, 0, 0);

        await initializeAttendanceForClass(cls, sunday);
      }
    }

    console.log(
      `✅ Attendance initialized for ${today.toDateString()}${
        isSaturday ? " and Sunday" : ""
      }`
    );
  } catch (err) {
    console.error("❌ Attendance cron failed", err);
  }
});
