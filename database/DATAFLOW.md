# InstaStudy — Dataflow Documentation

**Project:** InstaStudy — Peer-to-Peer Tutoring Platform  
**Milestone:** 3 — Dataset Preprocessing  
**Authors:** Syeda Khadija Naqvi · Minahil Faiz · Anusha Afzal  

---

## Overview

InstaStudy connects university students with peer tutors for one-on-one academic sessions. To understand how the database works, it helps to think about what a real user actually does on the platform — and trace where that action lands in the data.

There are three types of users: students looking for help, tutors offering it, and admins managing the platform. Everything that happens between them gets recorded across nine tables.

---

## How Data Flows Through InstaStudy

### Step 1 — Someone signs up

When a new user registers, their basic information goes into the `users` table. That's it for most people. But if they're applying as a tutor, two more things happen: a record is added to `tutors` with details like their hourly rate and CV, and their subjects get listed out in `tutor_subjects` — one row per subject they teach.

```
users          ← name, email, role, bio, phone
tutors         ← experience, hourly_rate, cv_url, status
tutor_subjects ← one row per subject the tutor teaches
```

---

### Step 2 — A tutor sets their availability

Before anyone can book a tutor, the tutor needs to add time slots when they're free. Each slot gets its own row in `availability` with a start and end time. At this point `is_booked` is set to `0` — meaning no one has claimed it yet.

```
availability ← tutor_id, start_time, end_time, is_booked = 0
```

---

### Step 3 — A student books a session

A student finds a tutor they like, picks an open slot, and books it. This creates a row in `bookings` that ties together the student, the tutor, and the specific slot they chose. The moment a booking is created, that slot in `availability` flips to `is_booked = 1` so no one else can take it.

At the same time, a payment record is created in `payments` — capturing how much is owed based on the tutor's rate.

```
bookings     ← student_id, tutor_id, slot_id, status = 'pending'
availability ← is_booked flips from 0 → 1
payments     ← booking_id, amount_pkr, status = 'pending'
```

---

### Step 4 — The session happens

The booking status moves from `pending` to `confirmed` to `in_progress` and finally `completed`. Once it's done, the session timestamps are saved on the booking record and the payment is marked as paid.

After the session, the student can leave a review — a rating, some feedback, and optionally some criticism. That goes into `reviews`, which is linked back to the booking, the tutor, and the student.

```
bookings ← status → 'completed', session_started_at + session_ended_at filled in
payments ← status → 'paid', paid_at recorded
reviews  ← rating, feedback, criticism linked to the booking
```

---

### Step 5 — Sharing study resources

Separately from all the booking activity, any user on the platform can upload study materials — notes, past papers, group projects — into `materials`. If someone needs something they can't find, they can post a request in `material_requests`. These two flows are independent of sessions and can happen at any point.

```
materials         ← uploaded_by, title, course, file_url, material_type
material_requests ← requested_by, course, description, status
```

---

## Table Load Order

Because of foreign key constraints, the tables have to be populated in a specific order — you can't add a booking before the student, tutor, and slot it references all exist.

| Order | Table | Depends On |
|-------|-------|------------|
| 1 | users | — |
| 2 | tutors | users |
| 3 | tutor_subjects | tutors |
| 4 | availability | tutors |
| 5 | bookings | users, tutors, availability |
| 6 | materials | users |
| 7 | material_requests | users |
| 8 | payments | bookings, users |
| 9 | reviews | bookings, tutors, users |

---

## What the Data Produces

Once everything is populated, the database can answer queries like:

| What you want to see | Tables it pulls from |
|----------------------|----------------------|
| List of tutors with their subjects and ratings | `tutors`, `tutor_subjects`, `users`, `reviews` |
| A student's full booking history | `bookings`, `availability`, `tutors`, `users` |
| A tutor's upcoming schedule | `bookings`, `availability`, `users` |
| Payment receipts | `payments`, `bookings` |
| Available study materials by course | `materials`, `users` |
| Unanswered material requests | `material_requests`, `users` |
| Admin view of pending tutor applications | `tutors`, `users` |

---

## About the Synthetic Dataset

All nine CSV files in `database/data/` were generated to simulate realistic activity on InstaStudy. Names, emails, subjects, session times, and amounts are modeled after a Pakistani university context. The data follows the exact column structure of the normalized schema and respects all foreign key relationships.

| Table | Rows |
|-------|------|
| users | 100 |
| tutors | 30 |
| tutor_subjects | 85 |
| availability | 108 |
| bookings | 100 |
| materials | 70 |
| material_requests | 50 |
| payments | 78 |
| reviews | 60 |

**A note on tutor count:** The `tutors` table has 30 rows instead of 50. This was intentional. With 100 total users, having 50 tutors would mean an equal number of students and tutors — which doesn't reflect how a tutoring platform actually works. In reality, there are always far more students seeking help than tutors providing it. Keeping tutors at 30 gives a student-to-tutor ratio of roughly 2.3:1, which feels much more realistic.