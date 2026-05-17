import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const tutorProfilesTable = pgTable("tutor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  subjects: text("subjects").array().notNull().default([]),
  experience: text("experience"),
  hourlyRate: real("hourly_rate").notNull().default(0),
  rating: real("rating"),
  reviewCount: integer("review_count").notNull().default(0),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTutorProfileSchema = createInsertSchema(tutorProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTutorProfile = z.infer<typeof insertTutorProfileSchema>;
export type TutorProfile = typeof tutorProfilesTable.$inferSelect;
