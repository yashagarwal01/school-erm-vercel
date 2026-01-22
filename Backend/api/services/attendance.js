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

export const getStudentAttendance = async (studentUserId, month) => {
  const start = new Date(month + "-01");
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  return await Attendance.find({
    date: { $gte: start, $lt: end },
    "students.studentUserId": studentUserId,
  });
};
