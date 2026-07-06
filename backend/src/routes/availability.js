const router = require("express").Router();
const { db, uuidv4 } = require("../db");
const { requireAuth } = require("../auth");

function mapSlot(data, id) {
  return {
    id,
    tutorId: data.tutor_id,
    startTime: data.start_time,
    endTime: data.end_time,
    isBooked: !!data.is_booked,
    createdAt: data.created_at,
  };
}

// GET /api/availability/:tutorId
router.get("/:tutorId", async (req, res) => {
  try {
    const snap = await db.collection("availability")
      .where("tutor_id", "==", req.params.tutorId)
      .orderBy("start_time", "asc")
      .get();
    res.json(snap.docs.map(d => mapSlot(d.data(), d.id)));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/availability
router.post("/", requireAuth, async (req, res) => {
  const { tutorId, startTime, endTime } = req.body;
  const id = uuidv4();
  try {
    const data = {
      tutor_id: tutorId,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      is_booked: false,
      created_at: new Date().toISOString(),
    };
    await db.collection("availability").doc(id).set(data);
    res.json(mapSlot(data, id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/availability/:slotId
router.delete("/:slotId", requireAuth, async (req, res) => {
  try {
    await db.collection("availability").doc(req.params.slotId).delete();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
