const router = require("express").Router();
const db = require("../db");
const { requireAuth } = require("../auth");
const { v4: uuidv4 } = require("uuid");

// ── POST /api/reviews  — student submits a review after session ──
router.post("/", requireAuth, async (req, res) => {
  const { bookingId, tutorId, rating, feedback } = req.body;
  const studentId = req.uid;

  if (!bookingId || !tutorId || !rating) {
    return res.status(400).json({ error: "bookingId, tutorId and rating are required" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verify booking belongs to this student and is completed
    const [[booking]] = await conn.execute(
      "SELECT * FROM bookings WHERE id = ? AND student_id = ? AND status = 'completed'",
      [bookingId, studentId]
    );
    if (!booking) {
      throw new Error("Booking not found or not completed");
    }

    // Prevent duplicate reviews
    const [[existing]] = await conn.execute(
      "SELECT id FROM reviews WHERE booking_id = ?",
      [bookingId]
    );
    if (existing) {
      throw new Error("You have already reviewed this session");
    }

    // Get student name
    const [[student]] = await conn.execute(
      "SELECT name FROM users WHERE uid = ?",
      [studentId]
    );

    const id = uuidv4();
    await conn.execute(
      `INSERT INTO reviews (id, booking_id, tutor_id, student_id, student_name, rating, feedback)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, bookingId, tutorId, studentId, student?.name ?? "Student", rating, feedback ?? null]
    );

    // Recalculate tutor's average rating and review count
    const [[stats]] = await conn.execute(
      "SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE tutor_id = ?",
      [tutorId]
    );
    await conn.execute(
      "UPDATE tutors SET rating = ?, review_count = ? WHERE uid = ?",
      [parseFloat(stats.avg_rating).toFixed(2), stats.cnt, tutorId]
    );

    await conn.commit();

    const [[row]] = await conn.execute("SELECT * FROM reviews WHERE id = ?", [id]);
    res.json(mapReview(row));
  } catch (e) {
    await conn.rollback();
    console.error("create review error:", e.message);
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// ── GET /api/reviews/tutor/:tutorId  — public list of reviews for a tutor ──
router.get("/tutor/:tutorId", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM reviews WHERE tutor_id = ? ORDER BY created_at DESC",
      [req.params.tutorId]
    );
    res.json(rows.map(mapReview));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/reviews/booking/:bookingId  — check if a booking has been reviewed ──
router.get("/booking/:bookingId", requireAuth, async (req, res) => {
  try {
    const [[row]] = await db.execute(
      "SELECT * FROM reviews WHERE booking_id = ?",
      [req.params.bookingId]
    );
    res.json(row ? mapReview(row) : null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/reviews/admin/all  — admin: all reviews ──
router.get("/admin/all", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT r.*, t.name AS tutor_name
       FROM reviews r
       LEFT JOIN tutors t ON t.uid = r.tutor_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows.map((r) => ({ ...mapReview(r), tutorName: r.tutor_name ?? null })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function mapReview(row) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    tutorId: row.tutor_id,
    studentId: row.student_id,
    studentName: row.student_name,
    rating: parseFloat(row.rating),
    feedback: row.feedback ?? null,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

module.exports = router;
