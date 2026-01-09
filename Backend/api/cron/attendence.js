import cron from "node-cron";
import Class from "../models/class.js";
import Attendance from "../models/attendance.js";
import Holiday from "../models/holiday.js";

cron.schedule("1 0 * * 1-6", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isSaturday = today.getDay() === 6; // 6 = Saturday

    const classes = await Class.find({});

    for (const cls of classes) {
      /**
       * ===============================
       * 1️⃣ CREATE ATTENDANCE FOR TODAY
       * ===============================
       */
      const todayExists = await Attendance.findOne({
        classId: cls._id,
        date: today,
      });

      if (!todayExists) {
        // 🔹 Check pre-decided holiday
        const holiday = await Holiday.findOne({
          date: today,
          $or: [
            { appliesToAllClasses: true },
            { classIds: cls._id },
          ],
        });

        if (holiday) {
          await Attendance.create({
            classId: cls._id,
            date: today,
            isHoliday: true,
            holidayReason: holiday.title,
            takenBy: null,
            students: cls.students,
          });
        } else {
          await Attendance.create({
            classId: cls._id,
            date: today,
            isHoliday: false,
            takenBy: null,
            students: cls.students,
          });
        }
      }

      /**
       * ===============================
       * 2️⃣ IF SATURDAY → CREATE SUNDAY
       * ===============================
       */
      if (isSaturday) {
        const sunday = new Date(today);
        sunday.setDate(sunday.getDate() + 1);
        sunday.setHours(0, 0, 0, 0);

        const sundayExists = await Attendance.findOne({
          classId: cls._id,
          date: sunday,
        });

        if (!sundayExists) {
          await Attendance.create({
            classId: cls._id,
            date: sunday,
            isHoliday: true,
            holidayReason: "Sunday",
            takenBy: null,
            students: [],
          });
        }
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
