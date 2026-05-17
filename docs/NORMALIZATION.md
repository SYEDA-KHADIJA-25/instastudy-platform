# InstaStudy — Database Normalization Document

**Milestone 2 | Applied 1NF → 2NF → 3NF normalization, removed duplicates, updated ERD and schema**

---

## Table of Contents

1. [Overview of Original Schema](#overview-of-original-schema)
2. [Step 1 — First Normal Form (1NF)](#step-1--first-normal-form-1nf)
3. [Step 2 — Second Normal Form (2NF)](#step-2--second-normal-form-2nf)
4. [Step 3 — Third Normal Form (3NF)](#step-3--third-normal-form-3nf)
5. [Step 4 — Remove Duplicates](#step-4--remove-duplicates)
6. [Final Normalized Schema (DDL)](#final-normalized-schema-ddl)
7. [ERD Notes](#erd-notes)

---

## Overview of Original Schema

The original schema contained 8 tables:

| Table | Purpose |
|---|---|
| `users` | All registered users (students, tutors, admins) |
| `tutors` | Extended tutor profile; FK → users |
| `availability` | Time slots a tutor offers; FK → tutors |
| `bookings` | Session bookings between student and tutor |
| `materials` | Uploaded academic files |
| `material_requests` | Student requests for materials |
| `payments` | Stripe payment records for bookings |
| `reviews` | Post-session ratings and feedback |

Issues found: one **1NF violation** (non-atomic JSON column in `tutors.subjects`), several **3NF transitive dependencies** (denormalized name columns carried across multiple tables), and **duplicate columns** between `users` and `tutors`.

---

## Step 1 — First Normal Form (1NF)

> **Rule:** Every column must hold a single atomic value. There must be no repeating groups or arrays stored in a single cell. Each row must be uniquely identifiable.

---

### `tutors` — **VIOLATION FOUND: `subjects` column**

**Issue:**
The `subjects` column is declared as `JSON` and stores an array of strings, for example `["Math", "Physics", "Chemistry"]`. This violates 1NF because a single cell holds multiple values. You cannot filter, index, or join on individual subject values without parsing JSON inside queries — which defeats the purpose of a relational database.

```sql
-- Original (violates 1NF)
subjects  JSON  NOT NULL   -- stores ["Math","Physics"]
```

**Change Made:**
Extract `subjects` into a dedicated junction table `tutor_subjects`. Each row represents one subject for one tutor.

```sql
-- New table
CREATE TABLE tutor_subjects (
  id        VARCHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  tutor_id  VARCHAR(128) NOT NULL,
  subject   VARCHAR(255) NOT NULL,
  FOREIGN KEY (tutor_id) REFERENCES tutors(uid) ON DELETE CASCADE
);

-- Drop the JSON column from tutors
ALTER TABLE tutors DROP COLUMN subjects;
```

**Why:** A relational schema must store one fact per cell. With `tutor_subjects`, you can now query `WHERE subject = 'Math'` directly, build indexes on subject names, and add new subjects without touching the tutor row itself.

---

### `users` — Already in 1NF

**Justification:** Every column (`uid`, `name`, `email`, `role`, `bio`, `avatar_url`, `phone`, `created_at`) holds a single, indivisible value. `role` uses an ENUM which is still a single scalar value per row — not a set. There are no arrays, no comma-separated lists, and no repeating column groups (e.g., no `subject1`, `subject2`). The primary key `uid` uniquely identifies each row. No change needed.

---

### `availability` — Already in 1NF

**Justification:** Each row represents exactly one time slot with atomic `start_time` and `end_time` values, a single `tutor_id`, and a single boolean `is_booked` flag. No multi-valued attributes. No change needed.

---

### `bookings` — Already in 1NF

**Justification:** All columns hold single atomic values. `status` is a single ENUM value. Date/time columns each hold one timestamp. There are no JSON fields or arrays. The denormalized name columns (`student_name`, `tutor_name`) are atomic strings — they are a 3NF issue (addressed in Step 3), not a 1NF issue. No change needed for 1NF.

---

### `materials` — Already in 1NF

**Justification:** Every attribute (`id`, `uploaded_by`, `title`, `description`, `course`, `file_url`, `material_type`, `is_public`, `created_at`) is a single atomic value. `material_type` is a single ENUM. No arrays or repeating groups. No change needed.

---

### `material_requests` — Already in 1NF

**Justification:** All columns are single-valued. `status` is a single ENUM. The `description` column is a long text value but it is still one atomic attribute (a description is not a list of separate facts). No change needed.

---

### `payments` — Already in 1NF

**Justification:** All payment attributes are atomic scalars — single IDs, a single integer amount, a single integer slot count, a single ENUM status, and single timestamps. No repeating groups. No change needed.

---

### `reviews` — Already in 1NF

**Justification:** `rating` is a single `TINYINT`, `feedback` and `criticism` are two separate text columns (correctly separated, not combined), and all remaining columns are single-valued. No arrays or multi-valued attributes. No change needed.

---

## Step 2 — Second Normal Form (2NF)

> **Rule:** The schema must already be in 1NF. Additionally, every non-key column must depend on the **whole** primary key — not just part of it. Partial dependencies can only occur when the primary key is composite (made of two or more columns).

---

### Assessment

After 1NF normalization, every table in this schema uses a single-column primary key — either a `VARCHAR(128)` Firebase UID or a `VARCHAR(36)` UUID. Since **no table has a composite primary key**, partial dependencies are structurally impossible. 2NF is therefore automatically satisfied by all tables once 1NF is achieved.

**Table-by-table confirmation:**

| Table | Primary Key | Composite? | Partial Dependency Risk |
|---|---|---|---|
| `users` | `uid` (single) | No | None |
| `tutors` | `uid` (single) | No | None |
| `tutor_subjects` | `id` (single UUID) | No | None |
| `availability` | `id` (single UUID) | No | None |
| `bookings` | `id` (single UUID) | No | None |
| `materials` | `id` (single UUID) | No | None |
| `material_requests` | `id` (single UUID) | No | None |
| `payments` | `id` (single UUID) | No | None |
| `reviews` | `id` (single UUID) | No | None |

**No changes required for 2NF.** The design decision to use surrogate UUID primary keys throughout (rather than natural composite keys) is precisely what makes the schema cleanly 2NF-compliant. If, for example, `tutor_subjects` had used `(tutor_id, subject)` as a composite PK, we would need to verify that any additional columns depended on the whole pair — but since a surrogate `id` is used, this question does not arise.

---

## Step 3 — Third Normal Form (3NF)

> **Rule:** The schema must already be in 2NF. Additionally, every non-key column must depend **directly** on the primary key — not on another non-key column. A column B that depends on non-key column A, which in turn depends on the PK, is a transitive dependency and must be extracted.

---

### `tutors` — **VIOLATION: `name`, `email`, `bio`, `avatar_url` transitively depend on `users.uid`**

**Issue:**
The `tutors` table duplicates `name`, `email`, `bio`, and `avatar_url` from the `users` table. Both tables share the same `uid` primary key (tutors.uid is a FK to users.uid). This means:

```
tutors.uid → users.uid → name, email, bio, avatar_url
```

These four values are facts about the *user*, not additional facts about the *tutor profile*. Storing them in both places creates a transitive dependency path and a maintenance hazard: if a user changes their name, it must be updated in two places, or the data becomes inconsistent.

**Change Made:**
Remove `name`, `email`, `bio`, and `avatar_url` from `tutors`. All queries that need tutor name or email should JOIN to `users`.

```sql
ALTER TABLE tutors
  DROP COLUMN name,
  DROP COLUMN email,
  DROP COLUMN bio,
  DROP COLUMN avatar_url;
```

**Why:** In a properly normalized schema, each fact is stored exactly once. Name, email, bio, and avatar all describe a user — they belong solely in `users`. The `tutors` table should only hold tutor-specific attributes: `hourly_rate`, `experience`, `cv_url`, `cv_file_name`, `status`, `rating`, `review_count`, `session_count`.

---

### `bookings` — **VIOLATION: `student_name`, `tutor_name`, `start_time`, `end_time` are transitive**

**Issue 1 — Denormalized names:**
`student_name` and `tutor_name` are derived from non-key columns in other tables:

```
bookings.student_id → users.name      (student_name is just users.name)
bookings.tutor_id   → users.name      (tutor_name is just users.name)
```

Storing names in `bookings` means a name change in `users` leaves stale data in every booking row for that user.

**Issue 2 — Duplicated slot times:**
`start_time` and `end_time` in `bookings` duplicate the exact same columns in `availability`:

```
bookings.slot_id → availability.start_time, availability.end_time
```

The booking already has a FK to `slot_id`, so the times are fully recoverable via a JOIN. Copying them into `bookings` is a transitive dependency: `bookings.id → slot_id → start_time, end_time`.

**Change Made:**
Remove all four columns from `bookings`.

```sql
ALTER TABLE bookings
  DROP COLUMN student_name,
  DROP COLUMN tutor_name,
  DROP COLUMN start_time,
  DROP COLUMN end_time;
```

Queries that need these values use JOINs:

```sql
-- Get booking details with names and times
SELECT
  b.id,
  b.status,
  us.name  AS student_name,
  ut.name  AS tutor_name,
  a.start_time,
  a.end_time
FROM bookings b
JOIN users       us ON us.uid = b.student_id
JOIN users       ut ON ut.uid = b.tutor_id
JOIN availability a ON a.id  = b.slot_id;
```

**Why:** Every piece of data should have exactly one authoritative source. Names live in `users`; slot times live in `availability`. Carrying copies into `bookings` creates update anomalies and wastes storage.

---

### `materials` — **Possible transitive: `uploader_name`**

**Issue:**
`uploader_name` is derivable from `uploaded_by → users.name`. Storing it in `materials` repeats a fact already owned by `users`.

**Change Made:**
Remove `uploader_name` from `materials`.

```sql
ALTER TABLE materials DROP COLUMN uploader_name;
```

**Why:** Same reasoning as above — uploader identity is a fact about the user, retrievable via JOIN on `uploaded_by`.

---

### `material_requests` — **Violation: `requester_name`**

**Issue:**
`requester_name` is derivable via `requested_by → users.name`. Transitive dependency identical to the pattern above.

**Change Made:**
Remove `requester_name` from `material_requests`.

```sql
ALTER TABLE material_requests DROP COLUMN requester_name;
```

---

### `reviews` — **Violation: `student_name`**

**Issue:**
`student_name` is derivable via `student_id → users.name`. Same transitive pattern.

**Change Made:**
Remove `student_name` from `reviews`.

```sql
ALTER TABLE reviews DROP COLUMN student_name;
```

---

### `payments` — Already in 3NF

**Justification:** All columns depend directly and solely on `payments.id`. `booking_id` and `student_id` are foreign keys — they are references, not derived values. `amount_pkr` is a recorded payment amount (not calculable from other columns without business logic), `slots_count` is a snapshot at time of payment, `stripe_session_id` and `stripe_payment_intent` are external identifiers owned by this table. No transitive dependencies exist. No change needed.

---

### `availability` — Already in 3NF

**Justification:** `tutor_id`, `start_time`, `end_time`, `is_booked`, and `created_at` all depend directly on `id`. There is no column that depends on another non-key column. No change needed.

---

### `users` — Already in 3NF

**Justification:** `name`, `email`, `role`, `bio`, `avatar_url`, `phone`, and `created_at` all describe properties of the user identified by `uid`. None of these derives from another — knowing a user's `email` does not determine their `name` or `role` in any functional dependency sense within this schema. No transitive dependencies. No change needed.

---

### `tutor_subjects` (new) — Already in 3NF

**Justification:** `tutor_id` and `subject` both depend directly on the surrogate `id` PK. There are only two non-key attributes and neither derives from the other. No change needed.

---

## Step 4 — Remove Duplicates

Beyond the transitive dependency removals already documented in 3NF, the following structural overlaps existed between `users` and `tutors`:

| Column | In `users` | In `tutors` (original) | Verdict |
|---|---|---|---|
| `name` | ✅ | ✅ (duplicate) | Remove from `tutors` |
| `email` | ✅ | ✅ (duplicate) | Remove from `tutors` |
| `bio` | ✅ | ✅ (duplicate) | Remove from `tutors` |
| `avatar_url` | ✅ | ✅ (duplicate) | Remove from `tutors` |
| `uid` (PK/FK) | ✅ | ✅ (intentional FK) | Keep — structural link |

The `uid` overlap is intentional and correct — `tutors.uid` is a FK to `users.uid` implementing a 1:1 relationship. All other overlapping columns are pure redundancy and have been removed.

**Summary of all columns removed across all tables:**

| Table | Columns Removed | Reason |
|---|---|---|
| `tutors` | `subjects` | 1NF — non-atomic JSON array |
| `tutors` | `name`, `email`, `bio`, `avatar_url` | 3NF + duplicate — already in `users` |
| `bookings` | `student_name`, `tutor_name` | 3NF — derivable via JOIN on `users` |
| `bookings` | `start_time`, `end_time` | 3NF — derivable via JOIN on `availability` |
| `materials` | `uploader_name` | 3NF — derivable via JOIN on `users` |
| `material_requests` | `requester_name` | 3NF — derivable via JOIN on `users` |
| `reviews` | `student_name` | 3NF — derivable via JOIN on `users` |

**New table added:**

| Table | Purpose |
|---|---|
| `tutor_subjects` | Replaces `tutors.subjects` JSON array with atomic rows (1NF fix) |

---

# Final Updated ERD Diagram

![InstaStudy Updated ERD](ERD.jpg)

