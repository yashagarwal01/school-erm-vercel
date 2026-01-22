import protectedApi from "../protectedApi";


export const postHolidays = async (payload) => {
  const res = await protectedApi.post("/holidays", payload);
  return res;
};


export const getHolidays = async (monthStr) => {
  const res = await protectedApi.get(`/holidays?month=${monthStr}`);
  return res;
};
