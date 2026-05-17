import { db, usersTable, tutorProfilesTable, availabilitySlotsTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { addDays, addHours, setHours, setMinutes, startOfDay } from "date-fns";

async function seed() {
  console.log("Seeding database...");

  // Create 4 tutor users
  const tutorData = [
    {
      name: "Sophia Chen",
      email: "sophia@instastudy.dev",
      password: "password123",
      bio: "PhD candidate in Applied Mathematics at MIT. I specialize in making complex math concepts intuitive and accessible. 4+ years tutoring experience.",
      subjects: ["Mathematics", "Calculus", "Statistics", "Linear Algebra"],
      experience: "PhD candidate at MIT, 4 years tutoring",
      hourlyRate: 55,
      rating: 4.9,
      reviewCount: 127,
    },
    {
      name: "James Rivera",
      email: "james@instastudy.dev",
      password: "password123",
      bio: "CS grad student passionate about algorithms and software engineering. I break down programming concepts so anyone can master them.",
      subjects: ["Computer Science", "Python", "Algorithms", "Data Structures"],
      experience: "CS grad student, 3 years tutoring",
      hourlyRate: 48,
      rating: 4.8,
      reviewCount: 93,
    },
    {
      name: "Priya Patel",
      email: "priya@instastudy.dev",
      password: "password123",
      bio: "Pre-med student with a passion for biology and chemistry. I have helped dozens of students ace their pre-med courses.",
      subjects: ["Biology", "Chemistry", "Biochemistry", "Physics"],
      experience: "Pre-med at Johns Hopkins, 2 years tutoring",
      hourlyRate: 42,
      rating: 4.7,
      reviewCount: 58,
    },
    {
      name: "Marcus Thompson",
      email: "marcus@instastudy.dev",
      password: "password123",
      bio: "Language enthusiast fluent in English, Spanish, and French. Native speaker who can help with grammar, writing, and conversation.",
      subjects: ["English", "Spanish", "French", "Essay Writing"],
      experience: "Linguistics major, native English speaker",
      hourlyRate: 38,
      rating: 4.6,
      reviewCount: 44,
    },
  ];

  const tutorUsers: any[] = [];
  for (const t of tutorData) {
    const passwordHash = await bcrypt.hash(t.password, 12);
    const [user] = await db
      .insert(usersTable)
      .values({
        name: t.name,
        email: t.email,
        passwordHash,
        bio: t.bio,
        isTutor: true,
        tutorStatus: "approved",
      })
      .onConflictDoNothing()
      .returning();
    if (user) tutorUsers.push({ user, ...t });
  }

  // Create tutor profiles and availability
  for (const t of tutorUsers) {
    const [profile] = await db
      .insert(tutorProfilesTable)
      .values({
        userId: t.user.id,
        subjects: t.subjects,
        experience: t.experience,
        hourlyRate: t.hourlyRate,
        rating: t.rating,
        reviewCount: t.reviewCount,
        status: "approved",
      })
      .returning();

    // Add availability slots for next 7 days
    const baseDate = startOfDay(addDays(new Date(), 1));
    const slots = [];
    for (let day = 0; day < 7; day++) {
      const dayDate = addDays(baseDate, day);
      // Morning slot: 10am-11am
      slots.push({
        tutorId: profile.id,
        startTime: setMinutes(setHours(dayDate, 10), 0),
        endTime: setMinutes(setHours(dayDate, 11), 0),
        isBooked: false,
      });
      // Afternoon slot: 3pm-4pm
      slots.push({
        tutorId: profile.id,
        startTime: setMinutes(setHours(dayDate, 15), 0),
        endTime: setMinutes(setHours(dayDate, 16), 0),
        isBooked: false,
      });
    }
    await db.insert(availabilitySlotsTable).values(slots).onConflictDoNothing();
  }

  // Create a student user
  const studentHash = await bcrypt.hash("password123", 12);
  await db
    .insert(usersTable)
    .values({
      name: "Alex Johnson",
      email: "alex@instastudy.dev",
      passwordHash: studentHash,
      bio: "Computer Science sophomore looking to improve math skills.",
      isTutor: false,
      tutorStatus: "none",
    })
    .onConflictDoNothing();

  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  await db
    .insert(usersTable)
    .values({
      name: "Admin",
      email: "admin@instastudy.dev",
      passwordHash: adminHash,
      isAdmin: true,
      isTutor: false,
      tutorStatus: "none",
    })
    .onConflictDoNothing();

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
