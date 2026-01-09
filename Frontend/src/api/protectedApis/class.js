import protectedApi from "../protectedApi";

/* =========================
   CLASS
========================= */

/**
 * 📌 Create a new class
 * payload: { className, section?, classTeacherId }
 */
export const createClass = async (payload) => {
  const res = await protectedApi.post("/classes", payload);
  return res.data;
};

/**
 * 📌 Get all classes
 */
export const getAllClasses = async () => {
  const res = await protectedApi.get("/classes");
  return res.data;
};

/**
 * 📌 Get class by ID (used in attendance page)
 */
export const getClassById = async (classId) => {
  const res = await protectedApi.get(`/classes/${classId}`);
  return res.data;
};

/**
 * 📌 Add student to class
 * payload: { rollNumber, userId }
 */
export const addStudentToClass = async (classId, payload) => {
  const res = await protectedApi.post(
    `/classes/${classId}/students`,
    payload
  );
  return res.data;
};

/**
 * 📌 Remove student from class
 */
export const removeStudentFromClass = async (classId, studentUserId) => {
  const res = await protectedApi.delete(
    `/classes/${classId}/students/${studentUserId}`
  );
  return res.data;
};
