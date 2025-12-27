import {
  getStudentService,
  bulkCreateStudentService,
  createStudentService,
  bulkCreateEmployeeService,
  createEmployeeService,
} from "../services/admin.js";

export const getStudent = async (req, res) => {
  try {
    const user = req.user
    const result = await getStudentService(user);

    return res.status(201).json({
      success: true,
      message: "Students fetched successfully",
      // count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Get Students Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to get students",
    });
  }
}


export const bulkCreateStudents = async (req, res) => {
  try {
    const students = req.body;

    const result = await bulkCreateStudentService(students);

    return res.status(201).json({
      success: true,
      message: "Students created successfully",
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Bulk Create Students Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create students",
    });
  }
};

export const createStudent = async (req, res) => {
  try {
    const student = req.body;

    const result = await createStudentService(student);

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create Student Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create student",
    });
  }
};


export const bulkCreateEmployee = async (req, res) => {
  try {
    const teachers = req.body;

    const result = await bulkCreateEmployeeService(teachers);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Bulk Create Employee Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create teachers",
    });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const teacher = req.body;

    const result = await createEmployeeService(teacher);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create Employee Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create teacher",
    });
  }
};
