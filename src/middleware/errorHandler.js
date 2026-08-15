import multer from "multer";
import { ZodError } from "zod";

function errorHandler(err, req, res, next) {
  // Multer errors (file size, unexpected field, file count, custom fileFilter errors)
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "File is too large",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field",
      LIMIT_FILE_COUNT: "Too many files",
    };
    return res.status(400).json({
      error: messages[err.code] || "File upload error",
    });
  }

  // Multer's fileFilter can also throw a plain Error (as in our audio/image type check)
  if (err.message === "Invalid audio file type" || err.message === "Invalid image file type") {
    return res.status(400).json({ error: err.message });
  }

  // Zod validation errors that weren't caught by validateBody (e.g. thrown manually with .parse())
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Prisma known request errors (unique constraint violations, record not found, etc.)
  if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A record with this value already exists" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
    console.error("Prisma error:", err);
    return res.status(500).json({ error: "Database error" });
  }

  // JWT errors that escape the auth middleware for any reason
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Fallback: anything unhandled
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? "Something went wrong" : err.message,
  });
}

export default errorHandler;