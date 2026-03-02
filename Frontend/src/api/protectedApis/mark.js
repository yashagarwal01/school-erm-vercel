import protectedApi from "../protectedApi";

/* =========================
   MARKS
========================= */

/**
 * Add marks (bulk insert)
 * marks: Array of { classId, studentUserId, rollNumber, subjectId, examId, marksObtained }
 */
export const addMarks = async (marks) => {
  const res = await protectedApi.post("/marks", { marks });
  return res.data;
};

/**
 * Get all exams a student has marks for
 * query: { studentId }
 */
export const getStudentExams = async (studentId) => {
  const res = await protectedApi.get("/marks/student/exams", {
    params: { studentId },
  });
  return res.data;
};

/**
 * Get marks for a specific student in an exam
 * query: { studentId, examId }
 */
export const getStudentMarks = async (studentId, examId) => {
  const res = await protectedApi.get("/marks/student", {
    params: { studentId, examId },
  });
  return res.data;
};

/**
 * Get all marks for a class result (teacher view)
 * query: { examId }
 */
export const getClassResult = async (examId) => {
  const res = await protectedApi.get("/marks/class", {
    params: { examId },
  });
  return res.data;
};

/**
 * Delete marks for an exam, optionally scoped to one student
 * params: { examId, studentUserId? }
 */
export const deleteMarks = async (examId, studentUserId) => {
  const params = { examId };
  if (studentUserId) params.studentUserId = studentUserId;
  const res = await protectedApi.delete("/marks", { params });
  return res.data;
};
