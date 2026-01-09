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
export const getStudentMonthlyAttendance = async (studentUserId, month) => {
  const res = await protectedApi.get(
    `/attendance/student/${studentUserId}`,
    {
      params: { month },
    }
  );
  return res.data;
};
