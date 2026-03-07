import dotenv from "dotenv";
import compression from "compression";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import subjectRoutes from "./routes/subject.route";
import aiRoutes from "./routes/ai.routes";
import scheduleRoutes from "./routes/schedule.route";
import availabilityRoutes from "./routes/availability.route";
import gamificationRoutes from "./routes/gamification.route";
import { connectDB } from "./config/db";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// MongoDB Connection
connectDB();

import { errorHandler } from "./middleware/error.middleware";

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/gamification", gamificationRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("AI Study Planner API is running...");
});

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
