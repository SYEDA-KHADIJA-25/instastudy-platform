require("dotenv").config();
const express = require("express");
const cors = require("cors");

const usersRouter       = require("./routes/users");
const tutorsRouter      = require("./routes/tutors");
const availabilityRouter = require("./routes/availability");
const bookingsRouter    = require("./routes/bookings");
const materialsRouter   = require("./routes/materials");
const adminRouter       = require("./routes/admin");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" })); // 10mb for base64 CV uploads

app.use("/api/users",        usersRouter);
app.use("/api/tutors",       tutorsRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/bookings",     bookingsRouter);
app.use("/api/materials",    materialsRouter);
app.use("/api/admin",        adminRouter);

app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ InstaStudy API running on http://localhost:${PORT}`);
});
