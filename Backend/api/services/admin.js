import bcrypt from "bcryptjs";
import StudentSchema from "../models/studentProfile.js";
import EmployeeSchema from "../models/employeeProfile.js";
import UserSchema from "../models/user.js";

export const getStudentService = async (user) =>{
  console.log(user)
  const students = await StudentSchema.find(
    {},
    {
      studentId: 1,
      firstName: 1,
      lastName: 1,
      "father.name": 1,
      "contact.email": 1,
      "contact.phone": 1,
    }
  ).lean();

  return students.map((s) => ({
    id: s._id,
    studentId: s.studentId,
    name: `${s.firstName} ${s.lastName}`.trim(),
    fatherName: s.father?.name || s.mother?.name || "—",
    email: s.contact?.email || "—",
    phone: s.contact?.phone || "—",
  }));
}

export const bulkCreateStudentService = async (students = []) => {
  if (!Array.isArray(students) || students.length === 0) {
    throw new Error("STUDENTS_ARRAY_REQUIRED");
  }

  const studentDocs = [];

  for (const student of students) {
    const { studentId, name,dob } = student;

    // 1️⃣ Check if user already exists
    let user = await UserSchema.findOne({ loginId: studentId });

    // 2️⃣ Create user if not exists
    if (!user) {
      const hashedPassword = await bcrypt.hash(dob, 10); // default password

      user = await UserSchema.create({
        loginId: studentId,
        name,
        role: "student",
        password: hashedPassword,
      });
    }

    // 3️⃣ Prepare student profile with userId
    studentDocs.push({
      ...student,
      userId: user._id,
    });
  }

  // 4️⃣ Bulk insert student profiles
  return await StudentSchema.insertMany(studentDocs, {
    ordered: false,
    runValidators: true,
  });
};

export const createStudentService = async (student) =>{
  const { studentId, name,dob } = student;

    // 1️⃣ Check if user already exists
    let user = await UserSchema.findOne({ loginId: studentId });

    // 2️⃣ Create user if not exists
    if (!user) {
      const hashedPassword = await bcrypt.hash(dob, 10); // default password

      user = await UserSchema.create({
        loginId: studentId,
        name,
        role: "student",
        password: hashedPassword,
      });
    }
    return await StudentSchema.create(student)
}

export const bulkCreateEmployeeService = async (teachers = []) => {
  if (!Array.isArray(teachers) || teachers.length === 0) {
    throw new Error("TEACHER_ARRAY_REQUIRED");
  }

  const teacherDocs = [];

  for (const teacher of teachers) {
    const { teacherId, name,dob } = teacher;

    // 1️⃣ Check if user already exists
    let user = await UserSchema.findOne({ loginId: teacherId });

    // 2️⃣ Create user if not exists
    if (!user) {
      const hashedPassword = await bcrypt.hash(dob, 10); // default password

      user = await UserSchema.create({
        loginId: teacherId,
        name,
        role: "teacher",
        password: hashedPassword,
      });
    }

    // 3️⃣ Prepare student profile with userId
    teacherDocs.push({
      ...teacher,
      userId: user._id,
    });
  }

  // 4️⃣ Bulk insert student profiles
  return await EmployeeSchema.insertMany(teacherDocs, {
    ordered: false,
    runValidators: true,
  });
};

export const createEmployeeService = async (teacher) =>{
  const { teacherId, name,dob } = teacher;

    // 1️⃣ Check if user already exists
    let user = await UserSchema.findOne({ loginId: teacherId });

    // 2️⃣ Create user if not exists
    if (!user) {
      const hashedPassword = await bcrypt.hash(dob, 10); // default password

      user = await UserSchema.create({
        loginId: teacherId,
        name,
        role: "teacher",
        password: hashedPassword,
      });
    }
    return await EmployeeSchema.create(teacher)
}