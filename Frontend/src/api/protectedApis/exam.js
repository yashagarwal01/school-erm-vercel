import protectedApi from "../protectedApi";

/* =========================
   EXAM
========================= */

/**
 * Get all exams
 */
export const getExams = async () => {
  const res = await protectedApi.get("/exams");
  return res.data;
};

/**
 * Create an exam
 * payload: { name, academicYear }
 */
export const createExam = async (payload) => {
  const res = await protectedApi.post("/exams", payload);
  return res.data;
};
