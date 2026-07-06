const router = require("express").Router();
const { db, uuidv4, FieldValue } = require("../db");
const { requireAuth } = require("../auth");

// Helper: merge tutor doc + user doc into the TutorProfile shape
async function getTutorProfile(uid) {
  const [tutorSnap, userSnap] = await Promise.all([
    db.collection("tutors").doc(uid).get(),
    db.collection("users").doc(uid).get(),
  ]);
  if (!tutorSnap.exists) return null;
  const t = tutorSnap.data();
  const u = userSnap.exists ? userSnap.data() : {};
  return {
    id: uid,
    userId: uid,
    name: u.name ?? null,
    email: u.email ?? null,
    phone: u.phone ?? null,
    bio: u.bio ?? null,
    avatarUrl: u.avatar_url ?? null,
    subjects: t.subjects ?? [],
    experience: t.experience ?? null,
    hourlyRate: t.hourly_rate ?? 0,
    cvUrl: t.cv_url ?? null,
    cvFileName: t.cv_file_name ?? null,
    status: t.status,
    rating: t.rating ?? null,
    reviewCount: t.review_count ?? 0,
    sessionCount: t.session_count ?? 0,
    createdAt: t.created_at ?? "",
  };
}

// POST /api/tutors/apply
router.post("/apply", requireAuth, async (req, res) => {
  const { name, subjects, experience, hourlyRate, bio, cvUrl, cvFileName } = req.body;
  const uid = req.uid;
  try {
    const tutorRef = db.collection("tutors").doc(uid);
    const snap = await tutorRef.get();

    const tutorData = {
      uid,
      experience: experience ?? null,
      hourly_rate: hourlyRate ?? 0,
      cv_url: cvUrl ?? null,
      cv_file_name: cvFileName ?? null,
      status: "pending",
      subjects: subjects ?? [],
      rating: null,
      review_count: 0,
      session_count: 0,
      created_at: snap.exists ? snap.data().created_at : new Date().toISOString(),
    };
    await tutorRef.set(tutorData, { merge: true });

    // Update bio/name on user doc if provided
    const userUpdates = {};
    if (bio !== undefined) userUpdates.bio = bio;
    if (name !== undefined) userUpdates.name = name;
    if (Object.keys(userUpdates).length) {
      await db.collection("users").doc(uid).update(userUpdates);
    }

    const profile = await getTutorProfile(uid);
    res.json(profile);
  } catch (e) {
    console.error("apply tutor error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/tutors/admin/by-status/:status
router.get("/admin/by-status/:status", requireAuth, async (req, res) => {
  try {
    const snap = await db.collection("tutors")
      .where("status", "==", req.params.status)
      .orderBy("created_at", "desc")
      .get();
    const profiles = await Promise.all(snap.docs.map(d => getTutorProfile(d.id)));
    res.json(profiles.filter(Boolean));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/tutors/:uid/approve
router.post("/:uid/approve", requireAuth, async (req, res) => {
  try {
    await db.collection("tutors").doc(req.params.uid).update({ status: "approved" });
    await db.collection("users").doc(req.params.uid).update({ role: "tutor" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/tutors/:uid/reject
router.post("/:uid/reject", requireAuth, async (req, res) => {
  try {
    await db.collection("tutors").doc(req.params.uid).update({ status: "rejected" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/tutors/:uid
router.delete("/:uid", requireAuth, async (req, res) => {
  try {
    await db.collection("tutors").doc(req.params.uid).delete();
    await db.collection("users").doc(req.params.uid).update({ role: "user" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/tutors/:uid
router.patch("/:uid", requireAuth, async (req, res) => {
  const { subjects, experience, hourlyRate, bio } = req.body;
  try {
    const tutorUpdates = {};
    if (subjects !== undefined)    tutorUpdates.subjects    = subjects;
    if (experience !== undefined)  tutorUpdates.experience  = experience;
    if (hourlyRate !== undefined)  tutorUpdates.hourly_rate = hourlyRate;

    if (Object.keys(tutorUpdates).length) {
      await db.collection("tutors").doc(req.params.uid).update(tutorUpdates);
    }
    if (bio !== undefined) {
      await db.collection("users").doc(req.params.uid).update({ bio: bio ?? null });
    }

    const profile = await getTutorProfile(req.params.uid);
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/tutors — list approved tutors with optional filters
router.get("/", async (req, res) => {
  const { search, subject, maxRate } = req.query;
  try {
    let query = db.collection("tutors").where("status", "==", "approved");
    if (maxRate) query = query.where("hourly_rate", "<=", parseFloat(maxRate));

    const snap = await query.get();
    let profiles = await Promise.all(snap.docs.map(d => getTutorProfile(d.id)));
    profiles = profiles.filter(Boolean);

    // Client-side filters (Firestore doesn't support LIKE)
    if (search) {
      const s = search.toLowerCase();
      profiles = profiles.filter(t =>
        (t.name ?? "").toLowerCase().includes(s) ||
        (t.bio ?? "").toLowerCase().includes(s) ||
        t.subjects.some(sub => sub.toLowerCase().includes(s))
      );
    }
    if (subject) {
      profiles = profiles.filter(t =>
        t.subjects.some(s => s.toLowerCase() === subject.toLowerCase())
      );
    }

    // Sort by rating descending
    profiles.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    res.json(profiles);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/tutors/:uid — single tutor
router.get("/:uid", async (req, res) => {
  try {
    const profile = await getTutorProfile(req.params.uid);
    if (!profile) return res.status(404).json({ error: "Tutor not found" });
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
