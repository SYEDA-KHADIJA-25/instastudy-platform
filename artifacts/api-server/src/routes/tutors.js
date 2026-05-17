const router = require("express").Router();
const db = require("../db");
const { requireAuth } = require("../auth");

function parseSubjects(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

function mapTutor(row) {
  if (!row) return null;
  return {
    id: row.uid,
    userId: row.uid,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    subjects: parseSubjects(row.subjects),
    experience: row.experience ?? null,
    hourlyRate: parseFloat(row.hourly_rate) || 0,
    bio: row.bio ?? null,
    avatarUrl: row.avatar_url ?? null,
    cvUrl: row.cv_url ?? null,
    cvFileName: row.cv_file_name ?? null,
    status: row.status,
    rating: row.rating ? parseFloat(row.rating) : null,
    reviewCount: row.review_count || 0,
    sessionCount: row.session_count || 0,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : "",
  };
}

// ── IMPORTANT: specific routes BEFORE /:uid wildcard ──────────

// Submit tutor application
router.post("/apply", requireAuth, async (req, res) => {
  const { name, email, subjects, experience, hourlyRate, bio, cvUrl, cvFileName } = req.body;
  const uid = req.uid;
  try {
    await db.execute(
      `INSERT INTO tutors (uid, name, email, subjects, experience, hourly_rate, bio, cv_url, cv_file_name, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), subjects = VALUES(subjects),
         experience = VALUES(experience), hourly_rate = VALUES(hourly_rate),
         bio = VALUES(bio), cv_url = VALUES(cv_url), cv_file_name = VALUES(cv_file_name)`,
      [uid, name, email, JSON.stringify(subjects), experience, hourlyRate,
       bio ?? null, cvUrl ?? null, cvFileName ?? null]
    );
    // Also update user role to reflect pending status
    await db.execute(
      "UPDATE users SET role = 'user' WHERE uid = ? AND role = 'user'",
      [uid]
    );
    const [[row]] = await db.execute("SELECT * FROM tutors WHERE uid = ?", [uid]);
    res.json(mapTutor(row));
  } catch (e) {
    console.error("apply tutor error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// Admin: list by status — MUST be before /:uid
router.get("/admin/by-status/:status", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM tutors WHERE status = ? ORDER BY created_at DESC",
      [req.params.status]
    );
    res.json(rows.map(mapTutor));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: approve — MUST be before /:uid
router.post("/:uid/approve", requireAuth, async (req, res) => {
  try {
    await db.execute("UPDATE tutors SET status = 'approved' WHERE uid = ?", [req.params.uid]);
    await db.execute("UPDATE users SET role = 'tutor' WHERE uid = ?", [req.params.uid]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: reject — MUST be before /:uid
router.post("/:uid/reject", requireAuth, async (req, res) => {
  try {
    await db.execute("UPDATE tutors SET status = 'rejected' WHERE uid = ?", [req.params.uid]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: delete tutor
router.delete("/:uid", requireAuth, async (req, res) => {
  try {
    await db.execute("DELETE FROM tutors WHERE uid = ?", [req.params.uid]);
    await db.execute("UPDATE users SET role = 'user' WHERE uid = ?", [req.params.uid]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update tutor profile
router.patch("/:uid", requireAuth, async (req, res) => {
  const { subjects, experience, hourlyRate, bio } = req.body;
  try {
    await db.execute(
      `UPDATE tutors SET
        subjects    = COALESCE(?, subjects),
        experience  = COALESCE(?, experience),
        hourly_rate = COALESCE(?, hourly_rate),
        bio         = COALESCE(?, bio)
       WHERE uid = ?`,
      [
        subjects ? JSON.stringify(subjects) : null,
        experience ?? null,
        hourlyRate ?? null,
        bio ?? null,
        req.params.uid,
      ]
    );
    const [[row]] = await db.execute("SELECT * FROM tutors WHERE uid = ?", [req.params.uid]);
    res.json(mapTutor(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List approved tutors (with optional filters)
router.get("/", async (req, res) => {
  const { search, subject, maxRate } = req.query;
  try {
    let sql = `SELECT t.*, u.phone
               FROM tutors t
               LEFT JOIN users u ON u.uid = t.uid
               WHERE t.status = 'approved'`;
    const params = [];
    if (search) {
      sql += " AND (t.name LIKE ? OR t.bio LIKE ? OR t.subjects LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (maxRate) {
      sql += " AND t.hourly_rate <= ?";
      params.push(parseFloat(maxRate));
    }
    sql += " ORDER BY COALESCE(t.rating, 0) DESC";
    const [rows] = await db.execute(sql, params);
    let tutors = rows.map(mapTutor);
    if (subject) {
      tutors = tutors.filter((t) =>
        t.subjects.some((s) => s.toLowerCase() === subject.toLowerCase())
      );
    }
    res.json(tutors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get single tutor — wildcard LAST
router.get("/:uid", async (req, res) => {
  try {
    const [[row]] = await db.execute(
      `SELECT t.*, u.phone FROM tutors t LEFT JOIN users u ON u.uid = t.uid WHERE t.uid = ?`,
      [req.params.uid]
    );
    if (!row) return res.status(404).json({ error: "Tutor not found" });
    res.json(mapTutor(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
