import { Router } from "express";
import { 
  register, 
  login, 
  logout, 
  refreshToken 
} from "../controllers/authController.js";

const router = Router();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", register);

// @route   POST /api/auth/login
// @desc    Authenticate user & return access token / set cookies
// @access  Public
router.post("/login", login);

// @route   POST /api/auth/refresh-token
// @desc    Mint a new access token using valid httpOnly refresh token
// @access  Public (Cookie-based)
router.post("/refresh-token", refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user & clear cookie sessions
// @access  Public
router.post("/logout", logout);

export default router;