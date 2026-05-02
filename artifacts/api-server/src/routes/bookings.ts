import { Router, type IRouter } from "express";
import { db, bookingsTable, usersTable, tutorProfilesTable, availabilitySlotsTable } from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import {
  CreateBookingBody,
  UpdateBookingBody,
  ListMyBookingsQueryParams,
} from "@workspace/api-zod";
import type { Request, Response } from "express";

const router: IRouter = Router();

async function formatBooking(booking: any) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, booking.studentId));
  const [tutorProfile] = await db.select().from(tutorProfilesTable).where(eq(tutorProfilesTable.id, booking.tutorId));
  const [slot] = await db.select().from(availabilitySlotsTable).where(eq(availabilitySlotsTable.id, booking.slotId));
  const [tutorUser] = tutorProfile ? await db.select().from(usersTable).where(eq(usersTable.id, tutorProfile.userId)) : [null];

  const { passwordHash: _1, ...safeStudent } = student || {};
  const { passwordHash: _2, ...safeTutorUser } = tutorUser || {};

  return {
    ...booking,
    student: safeStudent,
    tutor: tutorProfile && tutorUser ? {
      id: tutorProfile.id,
      userId: tutorProfile.userId,
      name: tutorUser.name,
      avatarUrl: tutorUser.avatarUrl,
      bio: tutorUser.bio,
      subjects: tutorProfile.subjects,
      experience: tutorProfile.experience,
      hourlyRate: tutorProfile.hourlyRate,
      rating: tutorProfile.rating,
      reviewCount: tutorProfile.reviewCount,
      status: tutorProfile.status,
      createdAt: tutorProfile.createdAt,
    } : null,
    slot: slot || null,
  };
}

router.get("/bookings", async (req: Request, res: Response): Promise<void> => {
  const sessionUserId = (req.session as any).userId;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const queryParsed = ListMyBookingsQueryParams.safeParse(req.query);
  const params = queryParsed.success ? queryParsed.data : {};

  const [myTutorProfile] = await db
    .select()
    .from(tutorProfilesTable)
    .where(eq(tutorProfilesTable.userId, sessionUserId));

  let allBookings: any[] = [];

  if (params.role === "student" || !params.role) {
    const studentBookings = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.studentId, sessionUserId));
    allBookings = [...allBookings, ...studentBookings];
  }

  if ((params.role === "tutor" || !params.role) && myTutorProfile) {
    const tutorBookings = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.tutorId, myTutorProfile.id));
    const newBookings = tutorBookings.filter(
      (tb) => !allBookings.find((ab) => ab.id === tb.id)
    );
    allBookings = [...allBookings, ...newBookings];
  }

  if (params.status) {
    allBookings = allBookings.filter((b) => b.status === params.status);
  }

  const formatted = await Promise.all(allBookings.map(formatBooking));
  res.json(formatted);
});

router.post("/bookings", async (req: Request, res: Response): Promise<void> => {
  const sessionUserId = (req.session as any).userId;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tutorId, slotId, subject, notes } = parsed.data;

  const [slot] = await db
    .select()
    .from(availabilitySlotsTable)
    .where(and(eq(availabilitySlotsTable.id, slotId), eq(availabilitySlotsTable.tutorId, tutorId)));

  if (!slot) {
    res.status(404).json({ error: "Slot not found" });
    return;
  }

  if (slot.isBooked) {
    res.status(400).json({ error: "Slot is already booked" });
    return;
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      studentId: sessionUserId,
      tutorId,
      slotId,
      status: "pending",
      subject: subject ?? null,
      notes: notes ?? null,
    })
    .returning();

  await db
    .update(availabilitySlotsTable)
    .set({ isBooked: true })
    .where(eq(availabilitySlotsTable.id, slotId));

  const formatted = await formatBooking(booking);
  res.status(201).json(formatted);
});

router.get("/bookings/:bookingId", async (req: Request, res: Response): Promise<void> => {
  const sessionUserId = (req.session as any).userId;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const bookingId = parseInt(Array.isArray(req.params.bookingId) ? req.params.bookingId[0] : req.params.bookingId, 10);
  if (isNaN(bookingId)) {
    res.status(400).json({ error: "Invalid booking ID" });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const formatted = await formatBooking(booking);
  res.json(formatted);
});

router.patch("/bookings/:bookingId", async (req: Request, res: Response): Promise<void> => {
  const sessionUserId = (req.session as any).userId;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const bookingId = parseInt(Array.isArray(req.params.bookingId) ? req.params.bookingId[0] : req.params.bookingId, 10);
  if (isNaN(bookingId)) {
    res.status(400).json({ error: "Invalid booking ID" });
    return;
  }

  const parsed = UpdateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const [myTutorProfile] = await db
    .select()
    .from(tutorProfilesTable)
    .where(eq(tutorProfilesTable.userId, sessionUserId));

  const isStudent = booking.studentId === sessionUserId;
  const isTutor = myTutorProfile && booking.tutorId === myTutorProfile.id;

  if (!isStudent && !isTutor) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status: parsed.data.status })
    .where(eq(bookingsTable.id, bookingId))
    .returning();

  if (parsed.data.status === "cancelled" || parsed.data.status === "rejected") {
    await db
      .update(availabilitySlotsTable)
      .set({ isBooked: false })
      .where(eq(availabilitySlotsTable.id, booking.slotId));
  }

  const formatted = await formatBooking(updated);
  res.json(formatted);
});

export default router;
