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

// Connect DB
connectDB();

// Middleware
app.use(cors()); // Global CORS - allows all origins by default
app.use(express.json());

// Routes
app.use("/api/auth", userRouter);
app.use("/api/resume", resumeRouter);

// Static uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      // Removed the trailing slash after 5173
      res.set("Access-Control-Allow-Origin", "https://resumemachines.vercel.app/");
    },
  })
);

app.get("/", (req, res) => {
  res.send("API working");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server responding on http://localhost:${PORT}`);
});