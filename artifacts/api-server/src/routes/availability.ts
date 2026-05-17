import { Router, type IRouter } from "express";
import { db, availabilitySlotsTable, tutorProfilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateAvailabilitySlotBody } from "@workspace/api-zod";
import type { Request, Response } from "express";

const router: IRouter = Router();

router.get("/tutors/:tutorId/availability", async (req: Request, res: Response): Promise<void> => {
  const tutorId = parseInt(Array.isArray(req.params.tutorId) ? req.params.tutorId[0] : req.params.tutorId, 10);
  if (isNaN(tutorId)) {
    res.status(400).json({ error: "Invalid tutor ID" });
    return;
  }

  const slots = await db
    .select()
    .from(availabilitySlotsTable)
    .where(eq(availabilitySlotsTable.tutorId, tutorId));

  res.json(slots);
});

router.post("/tutors/:tutorId/availability", async (req: Request, res: Response): Promise<void> => {
  const sessionUserId = (req.session as any).userId;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const tutorId = parseInt(Array.isArray(req.params.tutorId) ? req.params.tutorId[0] : req.params.tutorId, 10);
  if (isNaN(tutorId)) {
    res.status(400).json({ error: "Invalid tutor ID" });
    return;
  }

  const [profile] = await db
    .select()
    .from(tutorProfilesTable)
    .where(and(eq(tutorProfilesTable.id, tutorId), eq(tutorProfilesTable.userId, sessionUserId)));

  if (!profile) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = CreateAvailabilitySlotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [slot] = await db
    .insert(availabilitySlotsTable)
    .values({
      tutorId,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      isBooked: false,
    })
    .returning();

  res.status(201).json(slot);
});

router.delete("/tutors/:tutorId/availability/:slotId", async (req: Request, res: Response): Promise<void> => {
  const sessionUserId = (req.session as any).userId;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const tutorId = parseInt(Array.isArray(req.params.tutorId) ? req.params.tutorId[0] : req.params.tutorId, 10);
  const slotId = parseInt(Array.isArray(req.params.slotId) ? req.params.slotId[0] : req.params.slotId, 10);

  if (isNaN(tutorId) || isNaN(slotId)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [profile] = await db
    .select()
    .from(tutorProfilesTable)
    .where(and(eq(tutorProfilesTable.id, tutorId), eq(tutorProfilesTable.userId, sessionUserId)));

  if (!profile) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db
    .delete(availabilitySlotsTable)
    .where(and(eq(availabilitySlotsTable.id, slotId), eq(availabilitySlotsTable.tutorId, tutorId)));

  res.json({ success: true });
});

export default router;
