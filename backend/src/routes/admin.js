const router = require("express").Router();
const { db } = require("../db");
const { requireAuth } = require("../auth");

// GET /api/admin/stats
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const [usersSnap, tutorsSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("tutors").get(),
    ]);

    const totalUsers         = usersSnap.size;
    const tutors             = tutorsSnap.docs.map(d => d.data());
    const activeTutors       = tutors.filter(t => t.status === "approved").length;
    const pendingApplications  = tutors.filter(t => t.status === "pending").length;
    const rejectedApplications = tutors.filter(t => t.status === "rejected").length;

    res.json({ totalUsers, activeTutors, pendingApplications, rejectedApplications });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
