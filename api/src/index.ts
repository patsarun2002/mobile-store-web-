import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import dotenv from "dotenv";
import apiRoutes from "./api";
import { errorHandler, notFoundHandler } from "./utils/errorHandler";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// ✅ Health check ก่อน CORS, helmet และ middleware ทุกตัว
// cron job และ server-to-server request จะไม่โดน CORS block
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Enforce HTTPS in production
if (process.env.NODE_ENV === "production") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.header("x-forwarded-proto") !== "https") {
      return res.redirect(`https://${req.header("host")}${req.url}`);
    }
    next();
  });
}

const requiredEnvVars = ["DATABASE_URL", "SECRET_KEY"];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

// Validate JWT secret key strength
if (process.env.SECRET_KEY && process.env.SECRET_KEY.length < 32) {
  console.error("SECRET_KEY must be at least 32 characters long");
  process.exit(1);
}

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    // ✅ อนุญาต request ที่ไม่มี origin (cron job, mobile app, curl)
    if (!origin) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV === "production") {
      if (!process.env.FRONTEND_URL) {
        console.error(
          "FRONTEND_URL environment variable is required in production",
        );
        return callback(new Error("Server configuration error"));
      }
      const allowedOrigins = (process.env.FRONTEND_URL || "")
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);

      if (!allowedOrigins.includes(origin)) {
        return callback(null, false); // ✅ silent reject ไม่ throw error
      }
      return callback(null, true);
    } else {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        process.env.FRONTEND_URL,
      ].filter(Boolean) as string[];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false); // ✅ silent reject ไม่ throw error
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: false,
    xContentTypeOptions: true,
    xFrameOptions: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(cors(corsOptions));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! This is the backend server.");
});

// API Routes
app.use("/api", apiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});