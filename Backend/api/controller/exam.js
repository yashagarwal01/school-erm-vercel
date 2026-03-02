import * as examService from "../services/exam.js";

export const createExam = async (req, res) => {
  try {
    const exam = await examService.createExam(req.body);
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExams = async (_req, res) => {
  try {
    const exams = await examService.getExams();
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
