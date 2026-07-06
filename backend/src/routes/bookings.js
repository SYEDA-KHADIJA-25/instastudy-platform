const router = require("express").Router();
const { db, uuidv4, FieldValue } = require("../db");
const { requireAuth } = require("../auth");

async function enrichBooking(data, id) {
  const [studentSnap, tutorSnap, slotSnap] = await Promise.all([
    db.collection("users").doc(data.student_id).get(),
    db.collection("users").doc(data.tutor_id).get(),
    data.slot_id ? db.collection("availability").doc(data.slot_id).get() : Promise.resolve(null),
  ]);
  const student = studentSnap.exists ? studentSnap.data() : null;
  const tutor   = tutorSnap.exists   ? tutorSnap.data()   : null;
  const slot    = slotSnap?.exists   ? slotSnap.data()    : null;

  return {
    id,
    studentId:   data.student_id,
    tutorId:     data.tutor_id,
    slotId:      data.slot_id,
    status:      data.status,
    subject:     data.subject ?? null,
    notes:       data.notes ?? null,
    meetingLink: data.meeting_link ?? null,
    createdAt:   data.created_at,
    student: student ? { id: data.student_id, name: student.name, phone: student.phone ?? null } : undefined,
    tutor:   tutor   ? { id: data.tutor_id, userId: data.tutor_id, name: tutor.name,
                         phone: tutor.phone ?? null, subjects: [], hourlyRate: 0,
                         reviewCount: 0, status: "approved", createdAt: "" } : undefined,
    slot: slot ? { id: data.slot_id,
                   startTime: slot.start_time,
                   endTime:   slot.end_time } : undefined,
  };
}

// GET /api/bookings/all — admin
router.get("/all", requireAuth, async (req, res) => {
  try {
    const snap = await db.collection("bookings").orderBy("created_at", "desc").get();
    const bookings = await Promise.all(snap.docs.map(d => enrichBooking(d.data(), d.id)));
    res.json(bookings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/bookings/user/:uid/:role
router.get("/user/:uid/:role", requireAuth, async (req, res) => {
  const field = req.params.role === "tutor" ? "tutor_id" : "student_id";
  try {
    const snap = await db.collection("bookings")
      .where(field, "==", req.params.uid)
      .orderBy("created_at", "desc")
      .get();
    const bookings = await Promise.all(snap.docs.map(d => enrichBooking(d.data(), d.id)));
    res.json(bookings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/bookings — create booking with slot locking
router.post("/", requireAuth, async (req, res) => {
  const { studentId, tutorId, slotId, subject, notes } = req.body;
  const id = uuidv4();
  try {
    const slotRef = db.collection("availability").doc(slotId);
    const bookingRef = db.collection("bookings").doc(id);

    await db.runTransaction(async (t) => {
      const slotSnap = await t.get(slotRef);
      if (!slotSnap.exists) throw new Error("Slot not found");
      const slot = slotSnap.data();
      if (slot.tutor_id !== tutorId) throw new Error("Invalid slot for this tutor");
      if (slot.is_booked) throw new Error("This slot is no longer available");

      const bookingData = {
        student_id:   studentId,
        tutor_id:     tutorId,
        slot_id:      slotId,
        status:       "pending",
        subject:      subject ?? null,
        notes:        notes ?? null,
        meeting_link: null,
        created_at:   new Date().toISOString(),
      };
      t.set(bookingRef, bookingData);
      t.update(slotRef, { is_booked: true });
    });

    const snap = await bookingRef.get();
    res.json(await enrichBooking(snap.data(), id));
  } catch (e) {
    console.error("create booking error:", e.message);
    res.status(400).json({ error: e.message });
  }
});

// PATCH /api/bookings/:id/status
router.patch("/:id/status", requireAuth, async (req, res) => {
  const { status, meetingLink } = req.body;
  const bookingRef = db.collection("bookings").doc(req.params.id);
  try {
    await db.runTransaction(async (t) => {
      const snap = await t.get(bookingRef);
      if (!snap.exists) throw new Error("Booking not found");
      const booking = snap.data();

      const updates = { status };
      if (meetingLink !== undefined && meetingLink?.trim()) {
        updates.meeting_link = meetingLink.trim();
      }
      t.update(bookingRef, updates);

      // Free slot on cancel/reject
      if ((status === "cancelled" || status === "rejected") && booking.slot_id) {
        const slotRef = db.collection("availability").doc(booking.slot_id);
        t.update(slotRef, { is_booked: false });
      }

      // Increment session_count on tutor when completed
      if (status === "completed" && booking.status !== "completed") {
        const tutorRef = db.collection("tutors").doc(booking.tutor_id);
        t.update(tutorRef, { session_count: FieldValue.increment(1) });
      }
    });

    const updated = await bookingRef.get();
    res.json(await enrichBooking(updated.data(), req.params.id));
  } catch (e) {
    console.error("update booking error:", e.message);
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
