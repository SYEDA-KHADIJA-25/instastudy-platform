import { Router, type IRouter } from "express";
import { db, usersTable, tutorProfilesTable } from "@workspace/db";
import { eq, ilike, or, gte, lte } from "drizzle-orm";
import {
  ApplyTutorBody,
  UpdateMyTutorProfileBody,
  ListTutorsQueryParams,
} from "@workspace/api-zod";
import type { Request, Response } from "express";

const router: IRouter = Router();

function formatTutor(profile: any, user: any) {
  return {
    id: profile.id,
    userId: profile.userId,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    subjects: profile.subjects,
    experience: profile.experience,
    hourlyRate: profile.hourlyRate,
    rating: profile.rating,
    reviewCount: profile.reviewCount,
    status: profile.status,
    createdAt: profile.createdAt,
  };
}

router.get("/tutors/featured", async (_req: Request, res: Response): Promise<void> => {
  const profiles = await db
    .select()
    .from(tutorProfilesTable)
    .where(eq(tutorProfilesTable.status, "approved"))
    .limit(6);

  const result = await Promise.all(
    profiles.map(async (profile) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, profile.userId));
      return user ? formatTutor(profile, user) : null;
    })
  );

  res.json(result.filter(Boolean));
});

router.get("/tutors", async (req: Request, res: Response): Promise<void> => {
  const queryParsed = ListTutorsQueryParams.safeParse(req.query);
  const params = queryParsed.success ? queryParsed.data : {};

  const profiles = await db
    .select()
    .from(tutorProfilesTable)
    .where(eq(tutorProfilesTable.status, "approved"));

  const result = await Promise.all(
    profiles.map(async (profile) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, profile.userId));
      return user ? formatTutor(profile, user) : null;
    })
  );

  let tutors = result.filter(Boolean) as ReturnType<typeof formatTutor>[];

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    tutors = tutors.filter(
      (t) =>
        t.name.toLowerCase().includes(searchLower) ||
        t.subjects.some((s) => s.toLowerCase().includes(searchLower)) ||
        (t.bio && t.bio.toLowerCase().includes(searchLower))
    );
  }

  if (params.subject) {
    const subjectLower = params.subject.toLowerCase();
    tutors = tutors.filter((t) =>
      t.subjects.some((s) => s.toLowerCase().includes(subjectLower))
    );
  }

  if (params.minRating !== undefined) {
    tutors = tutors.filter((t) => t.rating != null && t.rating >= params.minRating!);
  }

  if (params.maxRate !== undefined) {
    tutors = tutors.filter((t) => t.hourlyRate <= params.maxRate!);
  }

  res.json(tutors);
});

router.post("/tutors/apply", async (req: Request, res: Response): Promise<void> => {
  const sessionUserId = (req.session as any).userId;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = ApplyTutorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(tutorProfilesTable)
    .where(eq(tutorProfilesTable.userId, sessionUserId));

  if (existing.length > 0) {
    res.status(400).json({ error: "You have already applied to become a tutor" });
    return;
  }

  const [profile] = await db
    .insert(tutorProfilesTable)
    .values({
      userId: sessionUserId,
      subjects: parsed.data.subjects,
      experience: parsed.data.experience,
      hourlyRate: parsed.data.hourlyRate,
      status: "pending",
    })
    .returning();

  await db
    .update(usersTable)
    .set({ tutorStatus: "pending" })
    .where(eq(usersTable.id, sessionUserId));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sessionUserId));
  res.status(201).json(formatTutor(profile, user));
});

router.get("/tutors/my-profile", async (req: Request, res: Response): Promise<void> => {
  const sessionUserId = (req.session as any).userId;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [profile] = await db
    .select()
    .from(tutorProfilesTable)
    .where(eq(tutorProfilesTable.userId, sessionUserId));

  if (!profile) {
    res.status(404).json({ error: "No tutor profile found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sessionUserId));
  res.json(formatTutor(profile, user));
});

router.patch("/tutors/my-profile", async (req: Request, res: Response): Promise<void> => {
  const sessionUserId = (req.session as any).userId;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = UpdateMyTutorProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [profile] = await db
    .select()
    .from(tutorProfilesTable)
    .where(eq(tutorProfilesTable.userId, sessionUserId));

  if (!profile) {
    res.status(404).json({ error: "No tutor profile found" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.subjects !== undefined) updateData.subjects = parsed.data.subjects;
  if (parsed.data.experience !== undefined) updateData.experience = parsed.data.experience;
  if (parsed.data.hourlyRate !== undefined) updateData.hourlyRate = parsed.data.hourlyRate;
  if (parsed.data.bio !== undefined) {
    await db.update(usersTable).set({ bio: parsed.data.bio }).where(eq(usersTable.id, sessionUserId));
  }

  const [updated] = await db
    .update(tutorProfilesTable)
    .set(updateData)
    .where(eq(tutorProfilesTable.userId, sessionUserId))
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sessionUserId));
  res.json(formatTutor(updated, user));
});

router.get("/tutors/:tutorId", async (req: Request, res: Response): Promise<void> => {
  const tutorId = parseInt(Array.isArray(req.params.tutorId) ? req.params.tutorId[0] : req.params.tutorId, 10);
  if (isNaN(tutorId)) {
    res.status(400).json({ error: "Invalid tutor ID" });
    return;
  }

  const [profile] = await db
    .select()
    .from(tutorProfilesTable)
    .where(eq(tutorProfilesTable.id, tutorId));

  if (!profile) {
    res.status(404).json({ error: "Tutor not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, profile.userId));
  res.json(formatTutor(profile, user));
});

export default router;
