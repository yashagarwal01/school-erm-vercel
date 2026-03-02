import * as subjectService from "../services/subject.js";

export const createSubject = async (req, res) => {
  try {
    const subject = await subjectService.createSubject(req.body);
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createSubjectBulk = async (req, res) => {
  try {
    const { subjectName, examId, classIds, maxMarks, teacherId } = req.body;
    const subjects = await subjectService.createSubjectBulk({
      subjectName,
      examId,
      classIds,
      maxMarks: Number(maxMarks),
      teacherId: teacherId || null,
      createdBy: req.user.userId,
    });
    res.status(201).json(subjects);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await subjectService.getSubjects(req.query);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
