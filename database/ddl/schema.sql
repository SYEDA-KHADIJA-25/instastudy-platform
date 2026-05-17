-- ============================================================
--  InstaStudy MySQL Schema — Normalized to 3NF
--  Normalization changes documented in NORMALIZATION.md
-- ============================================================

CREATE DATABASE IF NOT EXISTS instastudy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE instastudy;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  uid          VARCHAR(128)  NOT NULL PRIMARY KEY,   -- Firebase UID
  name         VARCHAR(255)  NOT NULL,
  email        VARCHAR(255)  NOT NULL UNIQUE,
  role         ENUM('user','tutor','admin') NOT NULL DEFAULT 'user',
  bio          TEXT          NULL,
  avatar_url   TEXT          NULL,
  phone        VARCHAR(20)   NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Tutors ───────────────────────────────────────────────────
-- Removed: name, email, bio, avatar_url (duplicated from users — 3NF)
-- Removed: subjects JSON (non-atomic — 1NF; moved to tutor_subjects)
CREATE TABLE IF NOT EXISTS tutors (
  uid           VARCHAR(128)  NOT NULL PRIMARY KEY,
  experience    TEXT          NULL,
  hourly_rate   DECIMAL(10,2) NOT NULL DEFAULT 0,
  cv_url        LONGTEXT      NULL,
  cv_file_name  VARCHAR(255)  NULL,
  status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  rating        DECIMAL(3,2)  NULL,
  review_count  INT           NOT NULL DEFAULT 0,
  session_count INT           NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- ── Tutor Subjects ───────────────────────────────────────────
-- New table: replaces tutors.subjects JSON array (1NF fix)
CREATE TABLE IF NOT EXISTS tutor_subjects (
  id        VARCHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  tutor_id  VARCHAR(128) NOT NULL,
  subject   VARCHAR(255) NOT NULL,
  FOREIGN KEY (tutor_id) REFERENCES tutors(uid) ON DELETE CASCADE
);

CREATE INDEX idx_tutor_subjects_tutor ON tutor_subjects(tutor_id);
CREATE INDEX idx_tutor_subjects_name  ON tutor_subjects(subject);

-- ── Availability Slots ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS availability (
  id           VARCHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  tutor_id     VARCHAR(128)  NOT NULL,
  start_time   DATETIME      NOT NULL,
  end_time     DATETIME      NOT NULL,
  is_booked    TINYINT(1)    NOT NULL DEFAULT 0,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_id) REFERENCES tutors(uid) ON DELETE CASCADE
);

-- ── Bookings ─────────────────────────────────────────────────
-- Removed: student_name, tutor_name (derivable via JOIN — 3NF)
-- Removed: start_time, end_time (duplicated from availability — 3NF)
CREATE TABLE IF NOT EXISTS bookings (
  id                   VARCHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  student_id           VARCHAR(128) NOT NULL,
  tutor_id             VARCHAR(128) NOT NULL,
  slot_id              VARCHAR(36)  NOT NULL,
  status               ENUM('pending','confirmed','in_progress','completed','cancelled','rejected')
                       NOT NULL DEFAULT 'pending',
  subject              VARCHAR(255) NULL,
  notes                TEXT         NULL,
  meeting_link         TEXT         NULL,
  session_started_at   DATETIME     NULL,
  session_ended_at     DATETIME     NULL,
  is_link_active       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(uid)       ON DELETE CASCADE,
  FOREIGN KEY (tutor_id)   REFERENCES tutors(uid)      ON DELETE CASCADE,
  FOREIGN KEY (slot_id)    REFERENCES availability(id) ON DELETE CASCADE
);

CREATE INDEX idx_bookings_status        ON bookings(status);
CREATE INDEX idx_bookings_session_times ON bookings(session_started_at, session_ended_at);

-- ── Academic Materials ───────────────────────────────────────
-- Removed: uploader_name (derivable via JOIN on users — 3NF)
CREATE TABLE IF NOT EXISTS materials (
  id            VARCHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  uploaded_by   VARCHAR(128)  NOT NULL,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT          NULL,
  course        VARCHAR(255)  NULL,
  file_url      TEXT          NULL,
  material_type ENUM('Notes','Past Paper','Project','Other') NOT NULL DEFAULT 'Notes',
  is_public     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(uid) ON DELETE CASCADE
);

-- ── Material Requests ────────────────────────────────────────
-- Removed: requester_name (derivable via JOIN on users — 3NF)
CREATE TABLE IF NOT EXISTS material_requests (
  id           VARCHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  requested_by VARCHAR(128)  NOT NULL,
  course       VARCHAR(255)  NULL,
  description  TEXT          NOT NULL,
  status       ENUM('Open','Fulfilled','Closed') NOT NULL DEFAULT 'Open',
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES users(uid) ON DELETE CASCADE
);

-- ── Payments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                    VARCHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  booking_id            VARCHAR(36)   NOT NULL,
  student_id            VARCHAR(128)  NOT NULL,
  stripe_session_id     VARCHAR(255)  NOT NULL UNIQUE,
  stripe_payment_intent VARCHAR(255)  NULL,
  amount_pkr            INT           NOT NULL,
  slots_count           INT           NOT NULL DEFAULT 1,
  status                ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at               DATETIME      NULL,
  FOREIGN KEY (student_id) REFERENCES users(uid) ON DELETE CASCADE
);

CREATE INDEX idx_payments_session ON payments(stripe_session_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_student ON payments(student_id);

-- ── Reviews ──────────────────────────────────────────────────
-- Removed: student_name (derivable via JOIN on users — 3NF)
CREATE TABLE IF NOT EXISTS reviews (
  id                    VARCHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  booking_id            VARCHAR(36)   NOT NULL UNIQUE,
  tutor_id              VARCHAR(128)  NOT NULL,
  student_id            VARCHAR(128)  NOT NULL,
  rating                TINYINT       NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback              TEXT          NULL,
  criticism             TEXT          NULL,
  is_visible            TINYINT(1)    NOT NULL DEFAULT 1,
  is_reviewed_by_admin  TINYINT(1)    NOT NULL DEFAULT 0,
  created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id)  REFERENCES bookings(id)  ON DELETE CASCADE,
  FOREIGN KEY (tutor_id)    REFERENCES tutors(uid)   ON DELETE CASCADE,
  FOREIGN KEY (student_id)  REFERENCES users(uid)    ON DELETE CASCADE
);

CREATE INDEX idx_reviews_tutor ON reviews(tutor_id, is_visible);
CREATE INDEX idx_reviews_admin ON reviews(is_reviewed_by_admin);
