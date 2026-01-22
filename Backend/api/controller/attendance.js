import * as AttendanceService from "../services/attendance.js";

export const getAttendanceByClassAndDate = async (req, res) => {
  try {
    const { classId, date } = req.params;
    const attendance = await AttendanceService.getByClassAndDate(classId, date,req.user.userId);
    res.json(attendance);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await AttendanceService.updateAttendance(
      req.params.attendanceId,
      req.body.students,
      req.user.userId // from auth middleware
    );
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const data = await AttendanceService.getStudentAttendance(
      req.params.studentId,
      req.query.month
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
