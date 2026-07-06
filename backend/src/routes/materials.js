const router = require("express").Router();
const { db, uuidv4 } = require("../db");
const { requireAuth } = require("../auth");

async function mapMaterial(data, id) {
  const userSnap = await db.collection("users").doc(data.uploaded_by).get();
  return {
    id,
    uploadedBy:   data.uploaded_by,
    uploaderName: userSnap.exists ? userSnap.data().name : null,
    course:       data.course ?? null,
    title:        data.title,
    description:  data.description ?? null,
    fileUrl:      data.file_url ?? null,
    materialType: data.material_type,
    isPublic:     !!data.is_public,
    createdAt:    data.created_at,
  };
}

async function mapRequest(data, id) {
  const userSnap = await db.collection("users").doc(data.requested_by).get();
  return {
    id,
    requestedBy:   data.requested_by,
    requesterName: userSnap.exists ? userSnap.data().name : null,
    course:        data.course ?? null,
    description:   data.description,
    status:        data.status,
    createdAt:     data.created_at,
  };
}

// GET /api/materials/requests
router.get("/requests", requireAuth, async (req, res) => {
  try {
    const snap = await db.collection("material_requests")
      .orderBy("created_at", "desc").get();
    const requests = await Promise.all(snap.docs.map(d => mapRequest(d.data(), d.id)));
    res.json(requests);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/materials/requests
router.post("/requests", requireAuth, async (req, res) => {
  const { requestedBy, course, description } = req.body;
  const id = uuidv4();
  try {
    const data = {
      requested_by: requestedBy,
      course:       course ?? null,
      description,
      status:       "Open",
      created_at:   new Date().toISOString(),
    };
    await db.collection("material_requests").doc(id).set(data);
    res.json(await mapRequest(data, id));
  } catch (e) {
    console.error("create material request error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/materials
router.get("/", requireAuth, async (req, res) => {
  try {
    const snap = await db.collection("materials")
      .orderBy("created_at", "desc").get();
    const materials = await Promise.all(snap.docs.map(d => mapMaterial(d.data(), d.id)));
    res.json(materials);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/materials
router.post("/", requireAuth, async (req, res) => {
  const { uploadedBy, title, description, course, fileUrl, materialType, isPublic } = req.body;
  const id = uuidv4();
  try {
    const data = {
      uploaded_by:   uploadedBy,
      title,
      description:   description ?? null,
      course:        course ?? null,
      file_url:      fileUrl ?? null,
      material_type: materialType,
      is_public:     !!isPublic,
      created_at:    new Date().toISOString(),
    };
    await db.collection("materials").doc(id).set(data);
    res.json(await mapMaterial(data, id));
  } catch (e) {
    console.error("create material error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
