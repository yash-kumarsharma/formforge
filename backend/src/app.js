const express = require("express");
const cors = require("cors");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const rateLimit = require("express-rate-limit");
const logger = require("./config/logger");

// Import API routes
const authRoutes = require("./modules/auth/auth.routes");
const formRoutes = require("./modules/forms/forms.routes");
const questionRoutes = require("./modules/questions/questions.routes");
const responseRoutes = require("./modules/responses/responses.routes");
const collaboratorRoutes = require("./modules/collaborators/collaborators.routes");
const exportRoutes = require("./modules/exports/exports.routes");

// Error handler middleware
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// ====== MIDDLEWARE ======

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  logger.warn('FRONTEND_URL not set in production environment');
}

app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// ====== API ROUTES ======
app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/collaborators", collaboratorRoutes);
app.use("/api/exports", exportRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "FormForge API",
    timestamp: new Date().toISOString()
  });
});

// ====== ERROR HANDLER ======
app.use(errorHandler);

module.exports = app;
