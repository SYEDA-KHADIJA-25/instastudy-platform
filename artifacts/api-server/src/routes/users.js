const router = require("express").Router();
const db = require("../db");
const { requireAuth } = require("../auth");

// Ensure user row exists — called automatically on every login (email or Google)
router.post("/ensure", requireAuth, async (req, res) => {
  const { name, email, photoURL } = req.body;
  const uid = req.uid; // verified Firebase UID from token

  try {
    // INSERT if not exists; on duplicate update avatar_url only if it's currently NULL
    // (so a manually uploaded avatar is never overwritten by Google's photo)
    await db.execute(
      `INSERT INTO users (uid, name, email, role, avatar_url)
       VALUES (?, ?, ?, 'user', ?)
       ON DUPLICATE KEY UPDATE
         avatar_url = IF(avatar_url IS NULL AND ? IS NOT NULL, ?, avatar_url)`,
      [
        uid,
        name || email?.split("@")[0] || "User",
        email || "",
        photoURL || null,
        photoURL || null,
        photoURL || null,
      ]
    );

    const [[user]] = await db.execute("SELECT * FROM users WHERE uid = ?", [uid]);
    res.json(user);
  } catch (e) {
    console.error("ensure user error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// Get user by uid
router.get("/:uid", requireAuth, async (req, res) => {
  try {
    const [[user]] = await db.execute("SELECT * FROM users WHERE uid = ?", [req.params.uid]);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update user profile (name, bio, avatar_url, phone)
router.patch("/:uid", requireAuth, async (req, res) => {
  const { name, bio, avatarUrl, phone } = req.body;
  try {
    await db.execute(
      `UPDATE users
       SET name       = COALESCE(?, name),
           bio        = ?,
           avatar_url = COALESCE(?, avatar_url),
           phone      = ?
       WHERE uid = ?`,
      [name ?? null, bio ?? null, avatarUrl ?? null, phone ?? null, req.params.uid]
    );
    const [[user]] = await db.execute("SELECT * FROM users WHERE uid = ?", [req.params.uid]);
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
