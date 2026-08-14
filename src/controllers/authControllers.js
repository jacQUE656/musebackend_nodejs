import { findUserByEmail, createUser, getUserById } from "../db_services/userService.js";
import bcrypt from "bcryptjs";
import { 
    generateTokens, 
    verifyRefreshToken, 
    generateAccessToken 
} from "../utils/tokenUtils.js";
import { validateLogin, validateRegister } from "../validators/authValidator.js";

// ==========================================
// REGISTER USER
// ==========================================
export const register = async (req, res) => {
    const validation = validateRegister.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: validation.error.flatten().fieldErrors
        });
    }

    const { firstname, lastname, email, phone, password } = validation.data;

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await createUser({
            firstname,
            lastname,
            email,
            phone,
            password: hashedPassword
        });

        // Await async generateTokens
        const { accessToken } = await generateTokens(newUser.id, res);

        return res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: {
                user: newUser,
                accessToken
            }
        });

    } catch (err) {
        return res.status(500).json({ message: "Server error, please try again later" });
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
            errors: validation.error.flatten().fieldErrors
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

        // Await async generateTokens
        const { accessToken } = await generateTokens(user.id, res);

        return res.status(200).json({
            status: "success",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                accessToken
            }
        });

    } catch (err) {
        return res.status(500).json({ message: "Server error, please try again later" });
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

        // 1. Verify token payload
        const decoded = verifyRefreshToken(refreshTokenVal);

        // 2. Query user to ensure payload fresh data (e.g., current role)
        const user = await getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        // 3. Generate new short-lived access token
        const newAccessToken = generateAccessToken(user.id, user.email, user.role);

        // Update cookie
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 // 15 mins
        });

        return res.status(200).json({
            status: "success",
            data: { accessToken: newAccessToken }
        });

    } catch (err) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};

// ==========================================
// LOGOUT USER
// ==========================================
export const logout = (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
};