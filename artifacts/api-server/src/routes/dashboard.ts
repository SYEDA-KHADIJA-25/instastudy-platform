import { Router, type IRouter } from "express";
import { db, bookingsTable, tutorProfilesTable, usersTable, availabilitySlotsTable } from "@workspace/db";
import { eq, and, or, ne } from "drizzle-orm";
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

async function formatBooking(booking: any) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, booking.studentId));
  const [tutorProfile] = await db.select().from(tutorProfilesTable).where(eq(tutorProfilesTable.id, booking.tutorId));
  const [slot] = await db.select().from(availabilitySlotsTable).where(eq(availabilitySlotsTable.id, booking.slotId));
  const [tutorUser] = tutorProfile ? await db.select().from(usersTable).where(eq(usersTable.id, tutorProfile.userId)) : [null];

  const { passwordHash: _1, ...safeStudent } = student || {};

  return {
    ...booking,
    student: safeStudent,
    tutor: tutorProfile && tutorUser ? formatTutor(tutorProfile, tutorUser) : null,
    slot: slot || null,
  };
}

router.get("/dashboard", async (req: Request, res: Response): Promise<void> => {
  const sessionUserId = (req.session as any).userId;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [myTutorProfile] = await db
    .select()
    .from(tutorProfilesTable)
    .where(eq(tutorProfilesTable.userId, sessionUserId));

  const studentBookings = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.studentId, sessionUserId));

  const upcomingBookings = studentBookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  );
  const completedBookings = studentBookings.filter((b) => b.status === "completed");

  let pendingRequests: any[] = [];
  if (myTutorProfile) {
    pendingRequests = await db
      .select()
      .from(bookingsTable)
      .where(and(eq(bookingsTable.tutorId, myTutorProfile.id), eq(bookingsTable.status, "pending")));
  }

  const allTutorProfiles = await db
    .select()
    .from(tutorProfilesTable)
    .where(eq(tutorProfilesTable.status, "approved"))
    .limit(4);

  const suggestedTutors = await Promise.all(
    allTutorProfiles.map(async (profile) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, profile.userId));
      return user ? formatTutor(profile, user) : null;
    })
  );

  const formattedUpcoming = await Promise.all(upcomingBookings.slice(0, 5).map(formatBooking));
  const formattedPending = await Promise.all(pendingRequests.slice(0, 10).map(formatBooking));

  let totalEarnings = 0;
  if (myTutorProfile) {
    const completedTutorBookings = await db
      .select()
      .from(bookingsTable)
      .where(and(eq(bookingsTable.tutorId, myTutorProfile.id), eq(bookingsTable.status, "completed")));
    totalEarnings = completedTutorBookings.length * myTutorProfile.hourlyRate;
  }

  res.json({
    upcomingBookings: formattedUpcoming,
    pendingRequests: formattedPending,
    suggestedTutors: suggestedTutors.filter(Boolean),
    tutorProfile: myTutorProfile && (await (async () => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, myTutorProfile.userId));
      return user ? formatTutor(myTutorProfile, user) : null;
    })()),
    stats: {
      totalBookings: studentBookings.length,
      completedSessions: completedBookings.length,
      pendingBookings: studentBookings.filter((b) => b.status === "pending").length,
      totalEarnings,
    },
  });
});

export default router;
