import Attendance from "../models/attendance.js";
import Class from "../models/class.js";
import { initializeAttendanceForClass } from "../utils/attendanceInitializer.js";
import { getISTDayStart } from "../utils/helper.js";

export const getPermissionsForAttendance = async () =>{
  
}

export const getByClassAndDate = async (classId, date, userId) => {
  const day = getISTDayStart(date);
  // day.setHours(0, 0, 0, 0);
  let attendance = await Attendance.find({
    date: day,
    allowedToTake: userId
  })
    .populate("students.studentUserId", "name studentId")
    .populate("classId", "className section");

  // 👇 LAZY CREATE
  // if (attendance.length === 0) {
  //   const cls = await Class.find({});

  //   if (!cls) {
  //     throw new Error("CLASS_NOT_FOUND");
  //   }

  //   attendance = await initializeAttendanceForClass(cls, day);

  //   attendance = await Attendance.findById(attendance._id)
  //     .populate("students.studentUserId", "name studentId")
  //     .populate("classId", "className section");
  // }

  return attendance;
};

export const updateAttendance = async (
  attendanceId,
  students,
  teacherId
) => {
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) throw new Error("ATTENDANCE_NOT_FOUND");

  if (attendance.isHoliday) {
    throw new Error("CANNOT_UPDATE_HOLIDAY_ATTENDANCE");
  }

  if (attendance.status === "not_taken") {
    attendance.status = "taken";
  }

  if (!students || students.length === 0) {
    throw new Error("STUDENTS_REQUIRED");
  }

  attendance.students = students;
  attendance.takenBy = teacherId;

  return await attendance.save();
};

export const getStudentAttendance = async (studentUserId, from, to) => {
  const start = new Date(from);
  const end = new Date(to);
  end.setDate(end.getDate() + 1); // inclusive end

  const docs = await Attendance.find({
    date: { $gte: start, $lt: end },
    $or: [
      { "students.studentUserId": studentUserId },
      { isHoliday: true },
    ],
  })
    .populate("classId", "className section")
    .sort({ date: 1 });

  return docs.map((doc) => {
    const entry = doc.students.find(
      (s) => s.studentUserId.toString() === studentUserId.toString()
    );
    return {
      date: doc.date.toISOString().split("T")[0],
      status: doc.isHoliday ? "holiday" : (entry?.status ?? "unmarked"),
      className: doc.classId?.className ?? "",
      section: doc.classId?.section ?? "",
      isHoliday: doc.isHoliday,
      holidayReason: doc.holidayReason ?? null,
    };
  });
};

// Admin: get attendance for a class on a specific date (no permission filter)
export const adminGetByClassAndDate = async (classId, date) => {
  const day = getISTDayStart(date);
  return await Attendance.findOne({ classId, date: day })
    .populate("students.studentUserId", "name")
    .populate("classId", "className section")
    .populate("takenBy", "name")
    .populate("allowedToTake", "name");
};

// Admin: get attendance records for a class within a date range (for permission management)
export const adminGetAttendanceRange = async (classId, from, to) => {
  const start = getISTDayStart(from);
  const end = getISTDayStart(to);
  end.setDate(end.getDate() + 1); // inclusive end

  return await Attendance.find({ classId, date: { $gte: start, $lt: end } })
    .sort({ date: 1 })
    .populate("takenBy", "name")
    .populate("allowedToTake", "_id name");
};

// Admin: update the allowedToTake array for an attendance record
export const updatePermissions = async (attendanceId, allowedToTake) => {
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) throw new Error("ATTENDANCE_NOT_FOUND");

  attendance.allowedToTake = allowedToTake;
  return await attendance.save();
};
