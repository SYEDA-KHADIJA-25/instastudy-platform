const router = require("express").Router();
const db = require("../db");
const { requireAuth } = require("../auth");
const { v4: uuidv4 } = require("uuid");

function mapSlot(row) {
  return {
    id: row.id,
    tutorId: row.tutor_id,
    startTime: new Date(row.start_time).toISOString(),
    endTime: new Date(row.end_time).toISOString(),
    isBooked: !!row.is_booked,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

// Get all slots for a tutor
router.get("/:tutorId", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM availability WHERE tutor_id = ? ORDER BY start_time ASC",
      [req.params.tutorId]
    );
    res.json(rows.map(mapSlot));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create a slot
router.post("/", requireAuth, async (req, res) => {
  const { tutorId, startTime, endTime } = req.body;
  const id = uuidv4();
  try {
    await db.execute(
      "INSERT INTO availability (id, tutor_id, start_time, end_time) VALUES (?, ?, ?, ?)",
      [id, tutorId, new Date(startTime), new Date(endTime)]
    );
    const [[row]] = await db.execute("SELECT * FROM availability WHERE id = ?", [id]);
    res.json(mapSlot(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete a slot
router.delete("/:slotId", requireAuth, async (req, res) => {
  try {
    await db.execute("DELETE FROM availability WHERE id = ?", [req.params.slotId]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
