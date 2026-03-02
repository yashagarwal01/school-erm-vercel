import protectedApi from "../protectedApi";

/* =========================
   ATTENDANCE
========================= */

/**
 * 📌 Get attendance for a class on a specific date
 * date format: YYYY-MM-DD
 */
export const getAttendanceByClassAndDate = async (classId, date) => {
  const res = await protectedApi.get(
    `/attendance/class/${classId}/date/${date}`
  );
  return res.data;
};

/**
 * 📌 Update / mark attendance
 * payload: { students: [...] }
 */
export const updateAttendance = async (attendanceId, payload) => {
  const res = await protectedApi.put(
    `/attendance/${attendanceId}`,
    payload
  );
  return res.data;
};

/**
 * 📌 Get attendance by attendanceId (utility)
 */
export const getAttendanceById = async (attendanceId) => {
  const res = await protectedApi.get(`/attendance/${attendanceId}`);
  return res.data;
};

/**
 * 📌 Get monthly attendance of a student
 * month format: YYYY-MM
 */
export const getStudentMonthlyAttendance = async (studentUserId, from, to) => {
  const res = await protectedApi.get(
    `/attendance/student/${studentUserId}`,
    {
      params: { from, to },
    }
  );
  return res.data;
};

/**
 * 📌 Admin: Get attendance for any class on a specific date (no permission filter)
 */
export const adminGetAttendanceByClassAndDate = async (classId, date) => {
  const res = await protectedApi.get(
    `/attendance/admin/class/${classId}/date/${date}`
  );
  return res.data;
};

/**
 * 📌 Admin: Get attendance records for a class within a date range
 */
export const adminGetAttendanceRange = async (classId, from, to) => {
  const res = await protectedApi.get(`/attendance/admin/class/${classId}`, {
    params: { from, to },
  });
  return res.data;
};

/**
 * 📌 Admin: Update allowedToTake (permission) for an attendance record
 * allowedToTake: string[] (array of user IDs)
 */
export const updateAttendancePermissions = async (attendanceId, allowedToTake) => {
  const res = await protectedApi.put(
    `/attendance/${attendanceId}/permissions`,
    { allowedToTake }
  );
  return res.data;
};
