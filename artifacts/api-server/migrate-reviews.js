require("dotenv").config();
const mysql = require("mysql2/promise");

(async () => {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || "127.0.0.1",
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME     || "instastudy",
  });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS reviews (
      id           VARCHAR(36)   NOT NULL PRIMARY KEY,
      booking_id   VARCHAR(36)   NOT NULL UNIQUE,
      tutor_id     VARCHAR(128)  NOT NULL,
      student_id   VARCHAR(128)  NOT NULL,
      student_name VARCHAR(255)  NOT NULL,
      rating       TINYINT       NOT NULL,
      feedback     TEXT          NULL,
      created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id)  REFERENCES bookings(id)   ON DELETE CASCADE,
      FOREIGN KEY (tutor_id)    REFERENCES tutors(uid)    ON DELETE CASCADE,
      FOREIGN KEY (student_id)  REFERENCES users(uid)     ON DELETE CASCADE
    )
  `);

  console.log("✅ reviews table ready");
  await db.end();
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
