import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import { handleWebhook } from "./controllers/payment.controller.js";

import apiRoutes from "./routes/index.js";

const app: Express = express();


// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Stripe webhook needs the raw request body for signature verification,
// so it must be registered before the global JSON body parser below.
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Request body parsers & Cookie parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Rate Limiting for Auth Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// System Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(200, { status: "UP", timestamp: new Date() }, "GrandStay API Server Healthy"));
});

// Main API Routes
app.use("/api", apiRoutes);


// 404 & Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
