import Mark from "../models/mark.js";
import Exam from "../models/exam.js";
import Class from "../models/class.js";
import Subject from "../models/subject.js";

/**
 * Upsert marks for all students in one subject (replaces insertMany to allow re-saves)
 */
export const addMarks = async (marks, enteredBy) => {
  const ops = marks.map((m) => ({
    updateOne: {
      filter: {
        studentUserId: m.studentUserId,
        subjectId: m.subjectId,
        examId: m.examId,
      },
      update: { $set: { ...m, enteredBy } },
      upsert: true,
    },
  }));
  return await Mark.bulkWrite(ops);
};

/**
 * Check whether a teacher is authorized to enter marks for a given class+subject.
 * Allowed if: class teacher OR assigned subject teacher.
 */
export const isAuthorizedToAddMarks = async (teacherUserId, classId, subjectId) => {
  const [cls, subject] = await Promise.all([
    Class.findById(classId, "classTeacherId"),
    Subject.findById(subjectId, "teacherId"),
  ]);
  if (!cls || !subject) return false;
  const isClassTeacher = cls.classTeacherId?.toString() === teacherUserId;
  const isSubjectTeacher = subject.teacherId?.toString() === teacherUserId;
  return isClassTeacher || isSubjectTeacher;
};

export const getStudentMarks = async (studentId, examId) => {
  return await Mark.find({ studentUserId: studentId, examId }).populate(
    "subjectId"
  );
};

export const getClassResult = async (examId) => {
  return await Mark.find({ examId })
    .populate("studentUserId")
    .populate("subjectId");
};

export const deleteMarks = async (examId, studentUserId) => {
  const filter = { examId };
  if (studentUserId) filter.studentUserId = studentUserId;
  return await Mark.deleteMany(filter);
};

export const getStudentExams = async (studentId) => {
  const examIds = await Mark.find({ studentUserId: studentId }).distinct("examId");
  return await Exam.find({ _id: { $in: examIds } });
};
