import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import prisma, { connectDB, disconnectDB } from "./config/dbConnect.js";
import authRoutes from "./routers/authRoutes.js";
import songRoutes from "./routers/songRoutes.js";
import albumRoutes from "./routers/albumRoutes.js";
import playlistRoutes from "./routers/playlistRoutes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import notificationRouter from "./routers/notificationRouter.js";

const app = express();

// 1. Core Global Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true, // Required for httpOnly cookies cross-origin
}));
app.use(express.json());
app.use(cookieParser());

// 2. Route Mounting
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("api/notifications" , notificationRouter);

// Health Check Endpoint
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// 3. 404 + Global Error Handler (MUST BE MOUNTED AFTER ALL ROUTES)
app.use(notFound);
app.use(errorHandler);

// 4. Server Initialization & Graceful Shutdown
const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`RBAC Music API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server due to database connection error:", error);
    process.exit(1);
  }
};

startServer();

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      console.log("Database disconnected and server closed successfully.");
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;