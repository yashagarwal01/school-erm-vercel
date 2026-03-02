import * as AttendanceService from "../services/attendance.js";

export const adminGetAttendanceByClassAndDate = async (req, res) => {
  try {
    const { classId, date } = req.params;
    const attendance = await AttendanceService.adminGetByClassAndDate(classId, date);
    res.json(attendance);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const adminGetAttendanceRange = async (req, res) => {
  try {
    const { classId } = req.params;
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: "from and to query params required" });
    }
    const records = await AttendanceService.adminGetAttendanceRange(classId, from, to);
    res.json(records);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePermissions = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { allowedToTake } = req.body;
    const attendance = await AttendanceService.updatePermissions(attendanceId, allowedToTake);
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

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
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: "from and to query params required" });
    }
    const data = await AttendanceService.getStudentAttendance(
      req.params.studentId,
      from,
      to
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
