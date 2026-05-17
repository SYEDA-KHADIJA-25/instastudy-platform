const router = require("express").Router();
const db = require("../db");
const { requireAuth } = require("../auth");
const { v4: uuidv4 } = require("uuid");

function mapMaterial(row) {
  return {
    id: row.id,
    uploadedBy: row.uploaded_by,
    uploaderName: row.uploader_name ?? null,
    course: row.course ?? null,
    title: row.title,
    description: row.description ?? null,
    fileUrl: row.file_url ?? null,
    materialType: row.material_type,
    isPublic: !!row.is_public,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapRequest(row) {
  return {
    id: row.id,
    requestedBy: row.requested_by,
    requesterName: row.requester_name ?? null,
    course: row.course ?? null,
    description: row.description,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

// ── Specific routes BEFORE wildcards ──────────────────────────

// List material requests
router.get("/requests", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM material_requests ORDER BY created_at DESC"
    );
    res.json(rows.map(mapRequest));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create material request
router.post("/requests", requireAuth, async (req, res) => {
  const { requestedBy, requesterName, course, description } = req.body;
  const id = uuidv4();
  try {
    await db.execute(
      `INSERT INTO material_requests
         (id, requested_by, requester_name, course, description)
       VALUES (?, ?, ?, ?, ?)`,
      [id, requestedBy, requesterName ?? null, course ?? null, description]
    );
    const [[row]] = await db.execute(
      "SELECT * FROM material_requests WHERE id = ?", [id]
    );
    res.json(mapRequest(row));
  } catch (e) {
    console.error("create material request error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// List all materials
router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM materials ORDER BY created_at DESC"
    );
    res.json(rows.map(mapMaterial));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create material
router.post("/", requireAuth, async (req, res) => {
  const { uploadedBy, uploaderName, title, description,
          course, fileUrl, materialType, isPublic } = req.body;
  const id = uuidv4();
  try {
    await db.execute(
      `INSERT INTO materials
         (id, uploaded_by, uploader_name, title, description,
          course, file_url, material_type, is_public)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, uploadedBy, uploaderName ?? null, title,
       description ?? null, course ?? null,
       fileUrl ?? null, materialType, isPublic ? 1 : 0]
    );
    const [[row]] = await db.execute("SELECT * FROM materials WHERE id = ?", [id]);
    res.json(mapMaterial(row));
  } catch (e) {
    console.error("create material error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
