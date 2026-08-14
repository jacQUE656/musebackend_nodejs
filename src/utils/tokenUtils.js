import jwt from "jsonwebtoken";
import { getUserById } from "../db_services/userService.js"; // Match exact export name from userService

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
export const generateTokens = async (userId, res) => {
  // FIXED: Added await to resolve the Prisma Promise
  const user = await getUserById(userId); 

  if (!user) {
    throw new Error("User not found during token generation");
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id);

  const isProduction = process.env.NODE_ENV === "production";

  // FIXED: maxAge aligned with 15m expiration (15 * 60 * 1000 ms)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Long-lived refresh cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });

  return { accessToken, refreshToken };
};

// Verifies a refresh token and returns its payload, or throws if invalid/expired
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};