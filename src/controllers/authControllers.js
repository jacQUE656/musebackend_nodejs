import {
  findUserByEmail,
  createUser,
  getUserById,
  updateLastLogin,
} from "../db_services/userService.js";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import {
  generateTokens,
  verifyRefreshToken,
  generateAccessToken,
} from "../utils/tokenUtils.js";
import {
  validateLogin,
  validateRegister,
} from "../validators/authValidator.js";
import emailService from "../mailing/emailService.js";
import notificatinService from "../db_services/notificationService.js";
// ==========================================
// REGISTER USER
// ==========================================
export const register = async (req, res) => {
  const validation = validateRegister.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { firstname, lastname, email, phone, password } = validation.data;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await createUser({
      firstname,
      lastname,
      email,
      phone,
      passwordHash: hashedPassword,
      role: Role.user,
    });

    // Await async generateTokens
    const { accessToken } = await generateTokens(newUser.id, res);

    // Fire-and-forget — must run before the response is sent, since code
    // after a `return` never executes. Not awaited so a slow/failed email
    // doesn't delay or break registration.
    notificatinService
      .createNotification({
        userId: newUser.id,
        type: "welcome",
        title: "Welcome to Muse 🎵",
        message:
          "Your account is ready: Start exploring songs, albums and playlists.",
      })
      .catch((err) =>
        console.error("Failed to  create welcome notification", err),
      );

    emailService
      .sendWelcomeEmail(newUser.email, newUser.firstname, newUser.lastname)
      .catch((err) => {
        console.error("Failed to send welcome email:", err);
      });

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: newUser,
        accessToken,
      },
    });
  } catch (err) {
    console.error("🔥 Error in register controller:", err);
    return res.status(500).json({
      message: "Server error, please try again later",
      ...(process.env.NODE_ENV !== "production" && {
        error: err.message,
        stack: err.stack,
      }),
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================
export const login = async (req, res) => {
  const validation = validateLogin.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { email, password } = validation.data;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update lastLogin timestamp in DB
    const updatedUser = await updateLastLogin(user.id);

    // Await async generateTokens
    const { accessToken } = await generateTokens(user.id, res);

    return res.status(200).json({
      status: "success",
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          lastLogin: updatedUser.lastLogin,
        },
        accessToken,
      },
    });
  } catch (err) {
    console.error("🔥 Error in login controller:", err);
    return res.status(500).json({
      message: "Server error, please try again later",
      ...(process.env.NODE_ENV !== "production" && {
        error: err.message,
        stack: err.stack,
      }),
    });
  }
};

// ==========================================
// REFRESH TOKEN
// ==========================================
export const refreshToken = async (req, res) => {
  try {
    const refreshTokenVal = req.cookies?.refreshToken;

    if (!refreshTokenVal) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const decoded = verifyRefreshToken(refreshTokenVal);

    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    const newAccessToken = generateAccessToken(user.id, user.email, user.role);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

// ==========================================
// LOGOUT USER
// ==========================================
export const logout = (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};
