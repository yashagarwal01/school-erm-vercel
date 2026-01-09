import Class from "../models/class.js";

export const createClass = async (data) => {
  const exists = await Class.findOne({
    className: data.className,
    section: data.section || null,
  });

  if (exists) {
    throw new Error("CLASS_ALREADY_EXISTS");
  }

  return await Class.create(data);
};

export const getAllClasses = async () => {
  return await Class.find()
    .populate("classTeacherId", "name")
    .populate("students.studentUserId", "name studentId")
    .sort({ className: 1 });
};

export const getClassById = async (id) => {
  const cls = await Class.findById(id)
    // .populate("classTeacherId", "name")
    .populate("students.studentUserId", "name studentId");

  if (!cls) throw new Error("CLASS_NOT_FOUND");

  return cls;
};

export const addStudentToClass = async (classId, { rollNumber, userId }) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new Error("CLASS_NOT_FOUND");

  // ❌ Duplicate roll number
  if (cls.students.some(s => s.rollNumber === rollNumber)) {
    throw new Error("ROLL_NUMBER_ALREADY_EXISTS");
  }

  // ❌ Student already in class
  if (cls.students.some(s => s.userId.toString() === userId)) {
    throw new Error("STUDENT_ALREADY_IN_CLASS");
  }

  cls.students.push({ rollNumber, userId });
  return await cls.save();
};

export const removeStudentFromClass = async (classId, studentUserId) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new Error("CLASS_NOT_FOUND");

  cls.students = cls.students.filter(
    s => s.userId.toString() !== studentUserId
  );

  return await cls.save();
};
