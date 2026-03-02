import * as markService from "../services/mark.js";

export const getStudentExams = async (req, res) => {
  try {
    const data = await markService.getStudentExams(req.query.studentId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMarks = async (req, res) => {
  try {
    const { marks } = req.body;
    if (!marks || marks.length === 0) {
      return res.status(400).json({ message: "No marks provided" });
    }

    // Authorization: class teacher or subject teacher only
    const { classId, subjectId } = marks[0];
    const authorized = await markService.isAuthorizedToAddMarks(
      req.user.userId,
      classId,
      subjectId
    );
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized to add marks for this subject" });
    }

    const result = await markService.addMarks(marks, req.user.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudentMarks = async (req, res) => {
  try {
    const data = await markService.getStudentMarks(
      req.query.studentId,
      req.query.examId
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClassResult = async (req, res) => {
  try {
    const data = await markService.getClassResult(req.query.examId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMarks = async (req, res) => {
  try {
    const result = await markService.deleteMarks(
      req.query.examId,
      req.query.studentUserId
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
