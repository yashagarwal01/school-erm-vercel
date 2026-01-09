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