import publicApi from "./publicApi";
import { setSession } from "@/lib/storage";

export const LoginApi = async (payload) => {
  const res = await publicApi.post("/auth/login", payload);
  const { accessToken, refreshToken, user } = res.data;

  if (accessToken && refreshToken && user) {
    setSession({
      userId: user._id,
      name: user.name,
      loginType: user.role,
      accessToken,
      refreshToken,
    });
  }

  return res.data;
};
