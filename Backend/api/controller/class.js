import * as ClassService from "../services/class.js";

export const createClass = async (req, res) => {
  try {
    const cls = await ClassService.createClass(req.body);
    res.status(201).json(cls);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const classes = await ClassService.getAllClasses();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClassById = async (req, res) => {
  try {
    const cls = await ClassService.getClassById(req.params.id);
    res.json(cls);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const addStudentToClass = async (req, res) => {
  try {
    const cls = await ClassService.addStudentToClass(
      req.params.classId,
      req.body
    );
    res.json(cls);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const removeStudentFromClass = async (req, res) => {
  try {
    const cls = await ClassService.removeStudentFromClass(
      req.params.classId,
      req.params.studentUserId
    );
    res.json(cls);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
