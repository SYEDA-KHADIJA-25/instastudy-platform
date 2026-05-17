-- ============================================================
--  InstaStudy MySQL Schema — Normalized to 3NF
--  Run this in MySQL Workbench to recreate all tables cleanly
-- ============================================================

CREATE DATABASE IF NOT EXISTS instastudy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE instastudy;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE users (
  uid          VARCHAR(128)  NOT NULL PRIMARY KEY,
  name         VARCHAR(255)  NOT NULL,
  email        VARCHAR(255)  NOT NULL UNIQUE,
  role         ENUM('user','tutor','admin') NOT NULL DEFAULT 'user',
  bio          TEXT          NULL,
  avatar_url   TEXT          NULL,
  phone        VARCHAR(20)   NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Tutors ───────────────────────────────────────────────────
-- name, email, bio, avatar_url removed — stored in users (3NF)
-- subjects JSON removed — moved to tutor_subjects table (1NF)
CREATE TABLE tutors (
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
-- Replaces tutors.subjects JSON — one row per subject (1NF fix)
CREATE TABLE tutor_subjects (
  id        VARCHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  tutor_id  VARCHAR(128) NOT NULL,
  subject   VARCHAR(255) NOT NULL,
  INDEX idx_tutor_subjects_tutor (tutor_id),
  INDEX idx_tutor_subjects_name  (subject),
  FOREIGN KEY (tutor_id) REFERENCES tutors(uid) ON DELETE CASCADE
);

-- ── Availability Slots ───────────────────────────────────────
CREATE TABLE availability (
  id           VARCHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  tutor_id     VARCHAR(128) NOT NULL,
  start_time   DATETIME     NOT NULL,
  end_time     DATETIME     NOT NULL,
  is_booked    TINYINT   NOT NULL DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_availability_tutor (tutor_id),
  FOREIGN KEY (tutor_id) REFERENCES tutors(uid) ON DELETE CASCADE
);

-- ── Bookings ─────────────────────────────────────────────────
-- student_name, tutor_name removed — derivable via JOIN (3NF)
-- start_time, end_time removed — duplicated from availability (3NF)
CREATE TABLE bookings (
  id                 VARCHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  student_id         VARCHAR(128) NOT NULL,
  tutor_id           VARCHAR(128) NOT NULL,
  slot_id            VARCHAR(36)  NOT NULL,
  status             ENUM('pending','confirmed','in_progress','completed','cancelled','rejected')
                     NOT NULL DEFAULT 'pending',
  subject            VARCHAR(255) NULL,
  notes              TEXT         NULL,
  meeting_link       TEXT         NULL,
  session_started_at DATETIME     NULL,
  session_ended_at   DATETIME     NULL,
  is_link_active     TINYINT   NOT NULL DEFAULT 0,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bookings_status        (status),
  INDEX idx_bookings_student       (student_id),
  INDEX idx_bookings_tutor         (tutor_id),
  INDEX idx_bookings_session_times (session_started_at, session_ended_at),
  FOREIGN KEY (student_id) REFERENCES users(uid)       ON DELETE CASCADE,
  FOREIGN KEY (tutor_id)   REFERENCES tutors(uid)      ON DELETE CASCADE,
  FOREIGN KEY (slot_id)    REFERENCES availability(id) ON DELETE CASCADE
);

-- ── Academic Materials ───────────────────────────────────────
-- uploader_name removed — derivable via JOIN on users (3NF)
CREATE TABLE materials (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  uploaded_by   VARCHAR(128) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  description   TEXT         NULL,
  course        VARCHAR(255) NULL,
  file_url      TEXT         NULL,
  material_type ENUM('Notes','Past Paper','Project','Other') NOT NULL DEFAULT 'Notes',
  is_public     TINYINT   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_materials_uploader (uploaded_by),
  FOREIGN KEY (uploaded_by) REFERENCES users(uid) ON DELETE CASCADE
);

-- ── Material Requests ────────────────────────────────────────
-- requester_name removed — derivable via JOIN on users (3NF)
CREATE TABLE material_requests (
  id           VARCHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  requested_by VARCHAR(128) NOT NULL,
  course       VARCHAR(255) NULL,
  description  TEXT         NOT NULL,
  status       ENUM('Open','Fulfilled','Closed') NOT NULL DEFAULT 'Open',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_material_requests_user (requested_by),
  FOREIGN KEY (requested_by) REFERENCES users(uid) ON DELETE CASCADE
);

-- ── Payments ─────────────────────────────────────────────────
CREATE TABLE payments (
  id                    VARCHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  booking_id            VARCHAR(36)  NOT NULL DEFAULT '',
  student_id            VARCHAR(128) NOT NULL,
  stripe_session_id     VARCHAR(255) NOT NULL UNIQUE,
  stripe_payment_intent VARCHAR(255) NULL,
  amount_pkr            INT          NOT NULL,
  slots_count           INT          NOT NULL DEFAULT 1,
  status                ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at               DATETIME     NULL,
  INDEX idx_payments_booking (booking_id),
  INDEX idx_payments_student (student_id),
  FOREIGN KEY (student_id) REFERENCES users(uid) ON DELETE CASCADE
);

-- ── Reviews ──────────────────────────────────────────────────
-- student_name removed — derivable via JOIN on users (3NF)
CREATE TABLE reviews (
  id                   VARCHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  booking_id           VARCHAR(36)  NOT NULL UNIQUE,
  tutor_id             VARCHAR(128) NOT NULL,
  student_id           VARCHAR(128) NOT NULL,
  rating               TINYINT      NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback             TEXT         NULL,
  criticism            TEXT         NULL,
  is_visible           TINYINT   NOT NULL DEFAULT 1,
  is_reviewed_by_admin TINYINT   NOT NULL DEFAULT 0,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reviews_tutor (tutor_id, is_visible),
  INDEX idx_reviews_admin (is_reviewed_by_admin),
  FOREIGN KEY (booking_id)  REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id)    REFERENCES tutors(uid)  ON DELETE CASCADE,
  FOREIGN KEY (student_id)  REFERENCES users(uid)   ON DELETE CASCADE
);
