import publicApi from "./publicApi";

export const LoginApi = async (payload) => {
  const res = await publicApi.post("/auth/login", payload);
  const { accessToken, refreshToken } = res.data;

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
  return res.data;
};
