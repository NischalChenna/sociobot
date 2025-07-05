import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import festivalRoutes from "./routes/festivals.js";
import contentRoutes from "./routes/content.js";
import schedulerRoutes from "./routes/scheduler.js";
import dashboardRoutes from "./routes/dashboard.js";
import adminRoutes from "./routes/admin.js";

// Import middleware
import { authenticateToken } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Import services
import { initializeScheduler } from "./services/scheduler.js";
import { initializeNotifications } from "./services/notifications.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static("uploads"));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/sociobot")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io available to routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", authenticateToken, userRoutes);
app.use("/api/festivals", authenticateToken, festivalRoutes);
app.use("/api/content", authenticateToken, contentRoutes);
app.use("/api/scheduler", authenticateToken, schedulerRoutes);
app.use("/api/dashboard", authenticateToken, dashboardRoutes);
app.use("/api/admin", authenticateToken, adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize services
initializeScheduler(io);
initializeNotifications();

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
