import Subject from "../models/subject.js";

export const createSubject = async (data) => {
  return await Subject.create(data);
};

// Create the same subject for multiple classes at once
export const createSubjectBulk = async ({ subjectName, examId, classIds, maxMarks, teacherId, createdBy }) => {
  if (!Array.isArray(classIds) || classIds.length === 0) {
    throw new Error("classIds must be a non-empty array");
  }
  const docs = classIds.map((classId) => ({
    subjectName,
    examId,
    classId,
    maxMarks,
    teacherId: teacherId || null,
    createdBy,
  }));
  return await Subject.insertMany(docs, { ordered: false });
};

export const getSubjects = async (filters) => {
  return await Subject.find(filters).populate("teacherId", "name");
};
