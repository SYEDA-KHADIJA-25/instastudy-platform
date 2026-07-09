require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Importing routes
const usersRouter = require("./routes/users");
const tutorsRouter = require("./routes/tutors");
const availRouter = require("./routes/availability");
const bookingsRouter = require("./routes/bookings");
const materialsRouter = require("./routes/materials");
const adminRouter = require("./routes/admin");
const reviewsRouter = require("./routes/reviews");
const paymentsRouter = require("./routes/payments");

const app = express();

// CORS configuration - Keeping origin: "*" for now, but 
// consider restricting to your Vercel frontend URL for better security
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ⚠️ Stripe webhook must use raw body — must be BEFORE express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }), paymentsRouter);

app.use(express.json({ limit: "10mb" }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/users", usersRouter);
app.use("/api/tutors", tutorsRouter);
app.use("/api/availability", availRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/payments", paymentsRouter);

// Health check routes
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/test", (_req, res) => res.json({ test: "working", path: "/test" }));
app.get("/api/test", (_req, res) => res.json({ test: "api working" }));

// Root route (Optional: prevents 404 on base URL)
app.get("/", (_req, res) => res.json({ message: "Welcome to InstaStudy API" }));

// Fallback for 404
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;

// Vercel serverless / Local development check
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, async () => {
    console.log(`\n✅ InstaStudy API running on http://localhost:${PORT}`);
    try {
      const { db } = require("./db");
      await db.collection("_health").doc("ping").set({ ok: true });
      console.log("✅ Firestore connected successfully\n");
    } catch (e) {
      console.error("❌ Firestore connection failed:", e.message, "\n");
    }
  });
}

module.exports = app;