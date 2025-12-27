import protectedApi from "../protectedApi";


export const getStudent = async () => {
  const res = await protectedApi.get("/admin/student");
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

export const postEmployeeBulk = async (payload) => {
  const res = await protectedApi.post("/admin/employee/bulk", payload);
  return res.data;
};