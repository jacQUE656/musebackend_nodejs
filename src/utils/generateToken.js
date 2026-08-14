import jwt from "jsonwebtoken";

// Short-lived access token — sent in response body or a short-lived cookie
export const generateAccessToken = (userId, userEmail, userRole) => {
  const payload = { userId, userEmail, userRole };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
};

// Long-lived refresh token — used only to mint new access tokens
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

// Issues both tokens and sets them as httpOnly cookies on the response
export const generateTokens = (userId, userEmail, userRole, res) => {
  const accessToken = generateAccessToken(userId, userEmail, userRole);
  const refreshToken = generateRefreshToken(userId);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 *24 * 7, // 7 days
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });

  return { accessToken, refreshToken };
};

// Verifies a refresh token and returns its payload, or throws if invalid/expired
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};