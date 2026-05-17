import { Router, type IRouter } from "express";
import { db, usersTable, tutorProfilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import type { Request, Response } from "express";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response): number | null {
  const sessionUserId = (req.session as any).userId;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return sessionUserId;
}

async function checkAdmin(userId: number): Promise<boolean> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return !!(user?.isAdmin);
}

router.get("/admin/stats", async (req: Request, res: Response): Promise<void> => {
  const userId = requireAdmin(req, res);
  if (!userId) return;
  if (!(await checkAdmin(userId))) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const allUsers = await db.select().from(usersTable);
  const allProfiles = await db.select().from(tutorProfilesTable);

  const totalUsers = allUsers.length;
  const activeTutors = allProfiles.filter((p) => p.status === "approved").length;
  const pendingApplications = allProfiles.filter((p) => p.status === "pending").length;
  const rejectedApplications = allProfiles.filter((p) => p.status === "rejected").length;

  res.json({ totalUsers, activeTutors, pendingApplications, rejectedApplications });
});

router.get("/admin/applications", async (req: Request, res: Response): Promise<void> => {
  const userId = requireAdmin(req, res);
  if (!userId) return;
  if (!(await checkAdmin(userId))) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const status = (req.query.status as string) || "pending";

  const profiles = await db
    .select()
    .from(tutorProfilesTable)
    .where(eq(tutorProfilesTable.status, status as "pending" | "approved" | "rejected"));

  const result = await Promise.all(
    profiles.map(async (profile) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, profile.userId));
      if (!user) return null;
      return {
        id: profile.id,
        userId: profile.userId,
        name: user.name,
        email: user.email,
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
    })
  );

  res.json(result.filter(Boolean));
});

router.patch(
  "/admin/applications/:tutorId/approve",
  async (req: Request, res: Response): Promise<void> => {
    const userId = requireAdmin(req, res);
    if (!userId) return;
    if (!(await checkAdmin(userId))) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const tutorId = parseInt(req.params.tutorId, 10);
    if (isNaN(tutorId)) {
      res.status(400).json({ error: "Invalid tutor ID" });
      return;
    }

    const [profile] = await db
      .update(tutorProfilesTable)
      .set({ status: "approved" })
      .where(eq(tutorProfilesTable.id, tutorId))
      .returning();

    if (!profile) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    await db
      .update(usersTable)
      .set({ isTutor: true, tutorStatus: "approved" })
      .where(eq(usersTable.id, profile.userId));

    res.json({ success: true, profile });
  }
);

router.patch(
  "/admin/applications/:tutorId/reject",
  async (req: Request, res: Response): Promise<void> => {
    const userId = requireAdmin(req, res);
    if (!userId) return;
    if (!(await checkAdmin(userId))) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const tutorId = parseInt(req.params.tutorId, 10);
    if (isNaN(tutorId)) {
      res.status(400).json({ error: "Invalid tutor ID" });
      return;
    }

    const [profile] = await db
      .update(tutorProfilesTable)
      .set({ status: "rejected" })
      .where(eq(tutorProfilesTable.id, tutorId))
      .returning();

    if (!profile) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    await db
      .update(usersTable)
      .set({ tutorStatus: "rejected" })
      .where(eq(usersTable.id, profile.userId));

    res.json({ success: true, profile });
  }
);

export default router;
