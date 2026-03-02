import Class from "../models/class.js";
import User from "../models/user.js";

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
  return await Class.find({},{students:0})
    .populate("classTeacherId", "name")
    // .populate("students.studentUserId", "name studentId")
    .sort({ className: 1 });
};

export const getClassById = async (id) => {
  const cls = await Class.findById(id)
    .populate("classTeacherId", "name employeeId")
    .populate("students.studentUserId", "name loginId");

  if (!cls) throw new Error("CLASS_NOT_FOUND");

  return cls;
};

export const assignClassTeacher = async (id,classTeacherId) => {
  console.log(classTeacherId)
  const cls = await Class.findByIdAndUpdate(id,
    {classTeacherId},
    { new: true }
  )
  .populate("classTeacherId", "name")
    .populate("students.studentUserId", "name studentId");
  
  return cls;
};

export const addStudentToClass = async (classId, { rollNumber, userId }) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new Error("CLASS_NOT_FOUND");

  // ❌ Duplicate roll number in this class
  if (cls.students.some(s => s.rollNumber === rollNumber)) {
    throw new Error("ROLL_NUMBER_ALREADY_EXISTS");
  }

  // ❌ Student already in this class
  if (cls.students.some(s => s.studentUserId.toString() === userId)) {
    throw new Error("STUDENT_ALREADY_IN_CLASS");
  }

  // ❌ Student already enrolled in another class (global uniqueness)
  const otherClass = await Class.findOne({
    _id: { $ne: classId },
    "students.studentUserId": userId,
  });
  if (otherClass) {
    throw new Error("STUDENT_ALREADY_IN_ANOTHER_CLASS");
  }

  cls.students.push({ rollNumber, studentUserId: userId });
  return await cls.save();
};

export const removeStudentFromClass = async (classId, studentUserId) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new Error("CLASS_NOT_FOUND");

  cls.students = cls.students.filter(
    s => s.studentUserId.toString() !== studentUserId
  );

  return await cls.save();
};

export const getAvailableStudents = async () => {
  // All student users
  const studentUsers = await User.find({ role: "student" }, { name: 1, loginId: 1 });

  // All student userIds already enrolled in any class
  const classes = await Class.find({}, { "students.studentUserId": 1 });
  const enrolledIds = new Set(
    classes.flatMap(c => c.students.map(s => s.studentUserId.toString()))
  );

  // Return only those not yet in any class
  return studentUsers
    .filter(u => !enrolledIds.has(u._id.toString()))
    .map(u => ({ _id: u._id, name: u.name, loginId: u.loginId }));
};
