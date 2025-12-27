import jwt from "jsonwebtoken";




/**
 * Access Token → short-lived
 */
export const generateTokens = (user) => {

  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return {refreshToken, accessToken}
};

export const refreshToken = (req, res, next) => {
  const user = req.user;

  req.accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  req.refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  next();
};

/**
 * Verify Token
 */
export const verifyTokenMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    console.log(token,">>")

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
