import Class from "../models/class.js";
import Attendance from "../models/attendance.js";
import Holiday from "../models/holiday.js";

export const initializeAttendanceForClass = async (cls, date) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  // already exists? stop
  const exists = await Attendance.findOne({
    classId: cls._id,
    date: day,
  });

  if (exists) return exists;

  // check holiday
  const holiday = await Holiday.findOne({
    date: day,
    $or: [
      { appliesToAllClasses: true },
      { classIds: cls._id },
    ],
  });

  return Attendance.create({
    classId: cls._id,
    date: day,
    isHoliday: !!holiday || day.getDay() === 0, // Sunday
    holidayReason:
      day.getDay() === 0
        ? "Sunday"
        : holiday?.title || null,
    takenBy: holiday ? null : cls.classTeacherId,
    allowedToTake: [cls.classTeacherId],
    students: holiday || day.getDay() === 0 ? [] : cls.students,
  });
};
