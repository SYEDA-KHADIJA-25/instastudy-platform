const router = require("express").Router();
const { db } = require("../db");
const { requireAuth } = require("../auth");

// POST /api/users/ensure — upsert user on every login
router.post("/ensure", requireAuth, async (req, res) => {
  const { name, email, photoURL } = req.body;
  const uid = req.uid;
  try {
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        uid,
        name: name || email?.split("@")[0] || "User",
        email: email || "",
        role: "user",
        bio: null,
        avatar_url: photoURL || null,
        phone: null,
        created_at: new Date().toISOString(),
      });
    } else {
      // Only update avatar_url if it's currently null and we have a photoURL
      const data = snap.data();
      if (!data.avatar_url && photoURL) {
        await ref.update({ avatar_url: photoURL });
      }
    }

    const updated = (await ref.get()).data();
    res.json(updated);
  } catch (e) {
    console.error("ensure user error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/users/:uid
router.get("/:uid", requireAuth, async (req, res) => {
  try {
    const snap = await db.collection("users").doc(req.params.uid).get();
    if (!snap.exists) return res.status(404).json({ error: "User not found" });
    res.json(snap.data());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/users/:uid — update name, bio, avatar_url, phone
router.patch("/:uid", requireAuth, async (req, res) => {
  const { name, bio, avatarUrl, phone } = req.body;
  try {
    const updates = {};
    if (name !== undefined)      updates.name       = name;
    if (bio !== undefined)       updates.bio        = bio ?? null;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl ?? null;
    if (phone !== undefined)     updates.phone      = phone ?? null;

    await db.collection("users").doc(req.params.uid).update(updates);
    const snap = await db.collection("users").doc(req.params.uid).get();
    res.json(snap.data());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
