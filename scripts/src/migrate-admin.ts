import { db, usersTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function migrate() {
  console.log("Running admin migration...");

  await db.execute(sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE
  `);
  console.log("Added is_admin column");

  const hash = await bcrypt.hash("admin123", 12);
  await db.execute(sql`
    INSERT INTO users (name, email, password_hash, is_admin, is_tutor, tutor_status)
    VALUES ('Admin', 'admin@instastudy.dev', ${hash}, true, false, 'none')
    ON CONFLICT (email) DO UPDATE SET is_admin = true, password_hash = EXCLUDED.password_hash
  `);
  console.log("Admin user created: admin@instastudy.dev / admin123");

  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
