import protectedApi from "../protectedApi";

export const getStudent = async (page,
  limit,
  search) => {
  const res = await protectedApi.get("/admin/student", {
    params: {
      page: page,
      limit: limit,
      search:search,
    },
  });

  return res.data;
};


export const postStudent = async (payload) => {
  const res = await protectedApi.post("/admin/student", payload);
  return res.data;
};

export const postStudentBulk = async (payload) => {
  const res = await protectedApi.post("/admin/student/bulk", payload);
  return res.data;
};

export const postEmployee = async (payload) => {
  const res = await protectedApi.post("/admin/employee", payload);
  return res.data;
};

export const getEmployee = async (page,
  limit,
  search) => {
  const res = await protectedApi.get("/admin/employee", {
    params: {
      page: page,
      limit: limit,
      search:search,
    },
  });

  return res;
};

export const postEmployeeBulk = async (payload) => {
  const res = await protectedApi.post("/admin/employee/bulk", payload);
  return res.data;
};

/**
 * Fetch all teachers (employees with employeeType === "Teacher")
 * Uses page=0&limit=0 to return all records
 */
export const getTeachers = async () => {
  const res = await protectedApi.get("/admin/employee", {
    params: { page: 0, limit: 0 },
  });
  const employees = res.data?.data ?? [];
  return employees.filter((e) => e.employeeType === "Teacher");
};