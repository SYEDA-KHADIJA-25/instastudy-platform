const router = require("express").Router();
const { db, uuidv4, FieldValue } = require("../db");
const { requireAuth } = require("../auth");

async function mapReview(data, id) {
  const userSnap = await db.collection("users").doc(data.student_id).get();
  const studentName = userSnap.exists ? userSnap.data().name : null;
  return {
    id,
    bookingId:   data.booking_id,
    tutorId:     data.tutor_id,
    studentId:   data.student_id,
    studentName: studentName ?? null,
    rating:      data.rating,
    feedback:    data.feedback ?? null,
    createdAt:   data.created_at,
  };
}

// POST /api/reviews
router.post("/", requireAuth, async (req, res) => {
  const { bookingId, tutorId, rating, feedback } = req.body;
  const studentId = req.uid;

  if (!bookingId || !tutorId || !rating) {
    return res.status(400).json({ error: "bookingId, tutorId and rating are required" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  const id = uuidv4();
  try {
    // Verify booking is completed and belongs to this student
    const bookingSnap = await db.collection("bookings").doc(bookingId).get();
    if (!bookingSnap.exists) throw new Error("Booking not found");
    const booking = bookingSnap.data();
    if (booking.student_id !== studentId) throw new Error("Not your booking");
    if (booking.status !== "completed") throw new Error("Booking not completed");

    // Prevent duplicate
    const existing = await db.collection("reviews").where("booking_id", "==", bookingId).get();
    if (!existing.empty) throw new Error("You have already reviewed this session");

    const reviewData = {
      booking_id: bookingId,
      tutor_id:   tutorId,
      student_id: studentId,
      rating:     parseFloat(rating),
      feedback:   feedback ?? null,
      created_at: new Date().toISOString(),
    };

    const reviewRef = db.collection("reviews").doc(id);
    const tutorRef  = db.collection("tutors").doc(tutorId);

    await db.runTransaction(async (t) => {
      // Get all existing reviews for this tutor to recalculate average
      const allReviewsSnap = await db.collection("reviews")
        .where("tutor_id", "==", tutorId).get();
      const existingRatings = allReviewsSnap.docs.map(d => d.data().rating);
      const newCount = existingRatings.length + 1;
      const newAvg = (existingRatings.reduce((a, b) => a + b, 0) + parseFloat(rating)) / newCount;

      t.set(reviewRef, reviewData);
      t.update(tutorRef, {
        rating:       parseFloat(newAvg.toFixed(2)),
        review_count: newCount,
      });
    });

    const snap = await reviewRef.get();
    res.json(await mapReview(snap.data(), id));
  } catch (e) {
    console.error("create review error:", e.message);
    res.status(400).json({ error: e.message });
  }
});

// GET /api/reviews/tutor/:tutorId
router.get("/tutor/:tutorId", async (req, res) => {
  try {
    const snap = await db.collection("reviews")
      .where("tutor_id", "==", req.params.tutorId)
      .orderBy("created_at", "desc")
      .get();
    const reviews = await Promise.all(snap.docs.map(d => mapReview(d.data(), d.id)));
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/reviews/booking/:bookingId
router.get("/booking/:bookingId", requireAuth, async (req, res) => {
  try {
    const snap = await db.collection("reviews")
      .where("booking_id", "==", req.params.bookingId)
      .limit(1)
      .get();
    if (snap.empty) return res.json(null);
    const doc = snap.docs[0];
    res.json(await mapReview(doc.data(), doc.id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/reviews/admin/all
router.get("/admin/all", requireAuth, async (req, res) => {
  try {
    const snap = await db.collection("reviews").orderBy("created_at", "desc").get();
    const reviews = await Promise.all(snap.docs.map(async (d) => {
      const base = await mapReview(d.data(), d.id);
      const tutorSnap = await db.collection("users").doc(d.data().tutor_id).get();
      return { ...base, tutorName: tutorSnap.exists ? tutorSnap.data().name : null };
    }));
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
