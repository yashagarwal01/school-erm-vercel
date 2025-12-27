import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { generateTokens } from "../middleware/token.js";
import jwt from "jsonwebtoken";

export const registerService = async (data) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });
  const tokens = generateTokens(user)

  return {...user,...tokens};
};

export const loginService = async (data) => {
  const user = await User.findOne({ loginId: data.loginId });
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // const isMatch = await bcrypt.compare(data.password, user.password);
  const isMatch = data.password == user.password;
  if (!isMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }
 const tokens = generateTokens(user)

  return {user:{name:user.name, role:user.role},...tokens};
};

export const refreshTokenService = async (refreshToken) => {
  try {

    console.log(refreshToken)

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    // 1️⃣ Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // 2️⃣ Find user & validate token
    const user = await User.findById(decoded.userId);
    if (!user ) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // 3️⃣ Generate NEW access token ONLY
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    return {accessToken:newAccessToken};
  } catch (err) {
    return res.status(403).json({ message: "Refresh token expired or invalid" });
  }
};