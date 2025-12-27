import publicApi from "./publicApi";

export const LoginApi = async (payload) => {
  const res = await publicApi.post("/auth/login", payload);
  return res.data;
};
