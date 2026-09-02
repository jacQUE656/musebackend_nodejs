// ==========================================
// GOOGLE SIGN-IN / SIGN-UP
// ==========================================
// Frontend sends a Google OAuth *access token* (from @react-oauth/google's
// useGoogleLogin, implicit flow — not an ID token). We verify it by calling
// Google's userinfo endpoint directly, so no extra library (e.g.
// google-auth-library) is required.
//
// Add this function to authControllers.js, alongside register/login/etc.
// Add these two imports at the top of authControllers.js:
//   import crypto from "node:crypto";
//   (findUserByEmail, createUser, updateLastLogin are already imported there)
