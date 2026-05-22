const router = require("express").Router();
const db = require("../db");
const { requireAuth } = require("../auth");
const { v4: uuidv4 } = require("uuid");

function mapBooking(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    tutorId: row.tutor_id,
    slotId: row.slot_id,
    status: row.status,
    subject: row.subject ?? null,
    notes: row.notes ?? null,
    meetingLink: row.meeting_link ?? null,
    student: row.student_name
      ? { id: row.student_id, name: row.student_name, phone: row.student_phone ?? null }
      : undefined,
    tutor: row.tutor_name
      ? { id: row.tutor_id, userId: row.tutor_id, name: row.tutor_name,
          phone: row.tutor_phone ?? null,
          subjects: [], hourlyRate: 0, reviewCount: 0, status: "approved", createdAt: "" }
      : undefined,
    slot: row.start_time && row.end_time
      ? { id: row.slot_id,
          startTime: new Date(row.start_time).toISOString(),
          endTime:   new Date(row.end_time).toISOString() }
      : undefined,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

// ── Specific routes BEFORE wildcards ──────────────────────────

// Admin: list ALL bookings
router.get("/all", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT b.*,
             su.phone AS student_phone,
             tu.phone AS tutor_phone
      FROM bookings b
      LEFT JOIN users su ON su.uid = b.student_id
      LEFT JOIN users tu ON tu.uid = b.tutor_id
      ORDER BY b.created_at DESC
    `);
    res.json(rows.map(mapBooking));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List bookings for a user (as student or tutor)
router.get("/user/:uid/:role", requireAuth, async (req, res) => {
  const field = req.params.role === "tutor" ? "b.tutor_id" : "b.student_id";
  try {
    const [rows] = await db.execute(
      `SELECT b.*,
              su.phone AS student_phone,
              tu.phone AS tutor_phone
       FROM bookings b
       LEFT JOIN users su ON su.uid = b.student_id
       LEFT JOIN users tu ON tu.uid = b.tutor_id
       WHERE ${field} = ?
       ORDER BY b.created_at DESC`,
      [req.params.uid]
    );
    res.json(rows.map(mapBooking));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create booking (with transaction to lock slot)
router.post("/", requireAuth, async (req, res) => {
  const { studentId, studentName, tutorId, tutorName, slotId, subject, notes } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[slot]] = await conn.execute(
      "SELECT * FROM availability WHERE id = ? FOR UPDATE",
      [slotId]
    );
    if (!slot) throw new Error("Slot not found");
    if (slot.tutor_id !== tutorId) throw new Error("Invalid slot for this tutor");
    if (slot.is_booked) throw new Error("This slot is no longer available");

    const id = uuidv4();
    await conn.execute(
      `INSERT INTO bookings
         (id, student_id, tutor_id, slot_id, status, subject, notes,
          student_name, tutor_name, start_time, end_time)
       VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
      [id, studentId, tutorId, slotId,
       subject ?? null, notes ?? null,
       studentName, tutorName,
       slot.start_time, slot.end_time]
    );
    await conn.execute("UPDATE availability SET is_booked = 1 WHERE id = ?", [slotId]);

    await conn.commit();
    const [[row]] = await conn.execute("SELECT * FROM bookings WHERE id = ?", [id]);
    res.json(mapBooking(row));
  } catch (e) {
    await conn.rollback();
    console.error("create booking error:", e.message);
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// Update booking status + optional meeting link
router.patch("/:id/status", requireAuth, async (req, res) => {
  const { status, meetingLink } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[booking]] = await conn.execute(
      "SELECT * FROM bookings WHERE id = ?", [req.params.id]
    );
    if (!booking) throw new Error("Booking not found");

    const linkVal = meetingLink !== undefined
      ? (meetingLink.trim() || null)
      : null;

    await conn.execute(
      `UPDATE bookings
       SET status = ?,
           meeting_link = CASE WHEN ? IS NOT NULL THEN ? ELSE meeting_link END
       WHERE id = ?`,
      [status, linkVal, linkVal, req.params.id]
    );

    // Free slot on cancel/reject
    if ((status === "cancelled" || status === "rejected") && booking.slot_id) {
      await conn.execute(
        "UPDATE availability SET is_booked = 0 WHERE id = ?",
        [booking.slot_id]
      );
    }

    // Increment tutor session_count when a booking is completed
    if (status === "completed" && booking.status !== "completed") {
      await conn.execute(
        "UPDATE tutors SET session_count = session_count + 1 WHERE uid = ?",
        [booking.tutor_id]
      );
    }

    await conn.commit();
    const [[row]] = await conn.execute("SELECT * FROM bookings WHERE id = ?", [req.params.id]);
    res.json(mapBooking(row));
  } catch (e) {
    await conn.rollback();
    console.error("update booking error:", e.message);
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
