import Attendance from "../models/attendance.js";

export const getByClassAndDate = async (classId, date) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const attendance = await Attendance.findOne({
    classId,
    date: day,
  }).populate("students.studentUserId", "name studentId")
  .populate("classId", "className section");

  if (!attendance) throw new Error("ATTENDANCE_NOT_FOUND");

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
