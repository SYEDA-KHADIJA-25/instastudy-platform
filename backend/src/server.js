require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const usersRouter     = require("./routes/users");
const tutorsRouter    = require("./routes/tutors");
const availRouter     = require("./routes/availability");
const bookingsRouter  = require("./routes/bookings");
const materialsRouter = require("./routes/materials");
const adminRouter     = require("./routes/admin");
const reviewsRouter   = require("./routes/reviews");
const paymentsRouter  = require("./routes/payments");

const app = express();

app.use(cors({ origin: "*" }));

// ⚠️ Stripe webhook MUST use raw body — register BEFORE express.json()
app.use("/api/payments/webhook", require("express").raw({ type: "application/json" }));
app.use("/api/payments/webhook", paymentsRouter);

app.use(express.json({ limit: "10mb" }));

// Request logger — shows every API call in terminal
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/users",        usersRouter);
app.use("/api/tutors",       tutorsRouter);
app.use("/api/availability", availRouter);
app.use("/api/bookings",     bookingsRouter);
app.use("/api/materials",    materialsRouter);
app.use("/api/admin",        adminRouter);
app.use("/api/reviews",      reviewsRouter);
app.use("/api/payments",     paymentsRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`\n✅ InstaStudy API running on http://localhost:${PORT}`);
  console.log(`   DB: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}\n`);

  // Test DB connection
  try {
    const db = require("./db");
    await db.execute("SELECT 1");
    console.log("✅ MySQL connected successfully\n");
  } catch (e) {
    console.error("❌ MySQL connection failed:", e.message, "\n");
  }
});
