import dotenv from "dotenv"; // 1. Load env vars first
dotenv.config();

import dns from 'dns';
// Force usage of Google Public DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Custom imports
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "https://resumemachines.vercel.app",
];
const corsOrigins = allowedOrigins.length ? allowedOrigins : defaultOrigins;

// Connect DB
connectDB();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no origin) and allowed frontend origins
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", userRouter);
app.use("/api/resume", resumeRouter);

// Static uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      // Static assets can be fetched from any frontend origin
      res.set("Access-Control-Allow-Origin", "*");
    },
  })
);

app.get("/", (req, res) => {
  res.send("API working");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server responding on port ${PORT}`);
});
