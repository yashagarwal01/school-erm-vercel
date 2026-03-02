import Exam from "../models/exam.js";

export const createExam = async (data) => {
  return await Exam.create(data);
};

export const getExams = async () => {
  return await Exam.find().sort({ createdAt: -1 });
};
