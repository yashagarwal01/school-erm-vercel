import bcrypt from "bcryptjs";
import StudentSchema from "../models/studentProfile.js";
import EmployeeSchema from "../models/employeeProfile.js";
import UserSchema from "../models/user.js";
import { generateId } from "../utils/generateId.js";

export const getStudentService = async (user, query = {}) => {
  const { page = 1, limit = 10, search = "" } = query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const hasSearch = search && search.trim() !== "";
  const searchText = search.trim();
  const regex = hasSearch ? new RegExp(searchText, "i") : null;

  /* ================= FILTER ================= */
  const matchFilter = hasSearch
    ? {
      $or: [
        { studentId: regex },
        { firstName: regex },
        { lastName: regex },
        { "father.name": regex },
        { "contact.email": regex },
        { "contact.phone": regex },
      ],
    }
    : {};

  /* ================= PIPELINE ================= */
  const pipeline = [];

  // MATCH
  if (hasSearch) {
    pipeline.push({ $match: matchFilter });
  }

  // SORT (latest first)
  pipeline.push({ $sort: { createdAt: -1 } });

  // PAGINATION
  pipeline.push({ $skip: skip }, { $limit: limitNum });

  // PROJECTION
  pipeline.push({
    $project: {
      studentId: 1,
      firstName: 1,
      lastName: 1,
      "father.name": 1,
      "contact.email": 1,
      "contact.phone": 1,
    },
  });

  /* ================= EXECUTION ================= */
  const [students, total] = await Promise.all([
    StudentSchema.aggregate(pipeline),
    StudentSchema.countDocuments(matchFilter),
  ]);

  /* ================= RESPONSE ================= */
  return {
    employeeId: user.employeeId,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    data: students.map((s) => ({
      id: s._id,
      studentId: s.studentId,
      name: `${s.firstName} ${s.lastName || ""}`.trim(),
      fatherName: s.father?.name || "—",
      email: s.contact?.email || "—",
      phone: s.contact?.phone || "—",
    })),
  };
};



export const createStudentService = async (student) => {
  const { firstName, lastName, dob } = student;
  const studentId = generateId("STU")
  // 1️⃣ Check if user already exists
  let user = await UserSchema.findOne({ loginId: studentId });

  // 2️⃣ Create user if not exists
  if (!user) {
    const hashedPassword = await bcrypt.hash(dob, 10); // default password

    user = await UserSchema.create({
      loginId: studentId,
      name: `${firstName} ${lastName || ""}`.trim(),
      role: "student",
      password: hashedPassword,
      status: "Active"
    });
  }
  return await StudentSchema.create({ ...student, status: "Studying" })
}



export const createEmployeeService = async (employee) => {
  const { firstName, lastName, dob } = employee;
  const employeeId = generateId("EMP")
  // 1️⃣ Check if user already exists
  let user = await UserSchema.findOne({ loginId: employeeId });

  // 2️⃣ Create user if not exists
  if (!user) {
    const hashedPassword = await bcrypt.hash(dob, 10); // default password

    user = await UserSchema.create({
      loginId: employeeId,
      name: `${firstName} ${lastName || ""}`.trim(),
      role: "employee",
      password: hashedPassword,
    });
  }
  return await EmployeeSchema.create(employee)
}

export const getEmployeeService = async (query = {}) => {
  const { page = 1, limit = 10, search = "" } = query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const hasSearch = search && search.trim() !== "";
  const regex = hasSearch ? new RegExp(search.trim(), "i") : null;

  /* ================= FILTER ================= */
  const filter = hasSearch
    ? {
      $or: [
        { employeeId: regex },
        { firstName: regex },
        { lastName: regex },
        { employeeType: regex },
        { "contact.email": regex },
        { "contact.phone": regex },
      ],
    }
    : {};

  /* ================= DB QUERY ================= */
  const [employees, total] = await Promise.all([
    EmployeeSchema.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select(
        "employeeId employeeType standards firstName lastName dob gender contact salary joiningDate leavingDate status"
      ),
    EmployeeSchema.countDocuments(filter),
  ]);

  /* ================= RESPONSE ================= */
  return {
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    data: employees.map((e) => ({
      id: e._id,
      employeeId: e.employeeId,
      employeeType: e.employeeType,
      standards: e.standards || [],
      name: `${e.firstName} ${e.lastName || ""}`.trim(),
      firstName: e.firstName,
      lastName: e.lastName || "",
      dob: e.dob || null,
      gender: e.gender || "—",
      email: e.contact?.email || "—",
      phone: e.contact?.phone || "—",
      address: e.contact?.address || {},
      salary: e.salary || 0,
      joiningDate: e.joiningDate,
      leavingDate: e.leavingDate,
      status: e.status,
    })),
  };
};

// ----------- ID LOGIC NOT ADDED TO BELOW ---------------

export const bulkCreateStudentService = async (students = []) => {
  if (!Array.isArray(students) || students.length === 0) {
    throw new Error("STUDENTS_ARRAY_REQUIRED");
  }

  const studentDocs = [];

  for (const student of students) {
    const { studentId, firstName, lastName, dob } = student;

    // 1️⃣ Check if user already exists
    let user = await UserSchema.findOne({ loginId: studentId });

    // 2️⃣ Create user if not exists
    if (!user) {
      const hashedPassword = await bcrypt.hash(dob, 10); // default password

      user = await UserSchema.create({
        loginId: studentId,
        name: `${firstName} ${lastName || ""}`.trim(),
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

export const bulkCreateEmployeeService = async (teachers = []) => {
  if (!Array.isArray(teachers) || teachers.length === 0) {
    throw new Error("TEACHER_ARRAY_REQUIRED");
  }

  const teacherDocs = [];

  for (const teacher of teachers) {
    const { teacherId, firstName, lastName, dob } = teacher;

    // 1️⃣ Check if user already exists
    let user = await UserSchema.findOne({ loginId: teacherId });

    // 2️⃣ Create user if not exists
    if (!user) {
      const hashedPassword = await bcrypt.hash(dob, 10); // default password

      user = await UserSchema.create({
        loginId: teacherId,
        name: `${firstName} ${lastName || ""}`.trim(),
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
