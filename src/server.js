import "dotenv/config";
import express from 'express';
import prisma, { connectDB, disconnectDB } from "./config/dbConnect.js";

await connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});