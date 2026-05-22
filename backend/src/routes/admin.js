const router = require("express").Router();
const db = require("../db");
const { requireAuth } = require("../auth");

// Platform stats
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const [[{ totalUsers }]]          = await db.execute("SELECT COUNT(*) AS totalUsers FROM users");
    const [[{ activeTutors }]]        = await db.execute("SELECT COUNT(*) AS activeTutors FROM tutors WHERE status = 'approved'");
    const [[{ pendingApplications }]] = await db.execute("SELECT COUNT(*) AS pendingApplications FROM tutors WHERE status = 'pending'");
    const [[{ rejectedApplications }]]= await db.execute("SELECT COUNT(*) AS rejectedApplications FROM tutors WHERE status = 'rejected'");
    res.json({ totalUsers, activeTutors, pendingApplications, rejectedApplications });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
