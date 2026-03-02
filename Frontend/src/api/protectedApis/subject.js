import protectedApi from "../protectedApi";

/* =========================
   SUBJECT
========================= */

/**
 * Get subjects, optionally filtered
 * params: { examId?, classId? }
 */
export const getSubjects = async (params = {}) => {
  const res = await protectedApi.get("/subjects", { params });
  return res.data;
};

/**
 * Create a subject
 * payload: { subjectName, examId, classId, maxMarks }
 */
export const createSubject = async (payload) => {
  const res = await protectedApi.post("/subjects", payload);
  return res.data;
};

/**
 * Create the same subject for multiple classes at once
 * payload: { subjectName, examId, classIds: string[], maxMarks }
 */
export const createSubjectBulk = async (payload) => {
  const res = await protectedApi.post("/subjects/bulk", payload);
  return res.data;
};
