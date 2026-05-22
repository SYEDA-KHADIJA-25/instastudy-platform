# InstaStudy — Project Structure & File Summary

A peer tutoring platform where students find tutors, book sessions, pay online, and leave reviews.

---

## Root Level

| File | Purpose |
|------|---------|
| `pnpm-workspace.yaml` | Defines the monorepo — tells pnpm that `frontend/`, `backend/`, are separate packages |
| `pnpm-lock.yaml` | Lockfile — ensures everyone installs the exact same package versions |
| `package.json` | Root workspace config — shared dev tools (TypeScript, Prettier) |
| `tsconfig.base.json` | Shared TypeScript base config inherited by frontend and backend |
| `tsconfig.json` | Root TypeScript config |
| `.gitignore` | Tells Git what not to track (node_modules, .env, dist) |
| `.npmrc` | npm/pnpm configuration settings |
| `.vscode/settings.json` | VS Code editor settings shared across the team |

---

## `frontend/` — React Application

The complete user-facing web app. Built with React + Vite + TypeScript.

### Root Config Files

| File | Purpose |
|------|---------|
| `package.json` | Frontend dependencies — React, Tailwind, Firebase, Stripe, etc. |
| `vite.config.ts` | Vite build tool config — sets up React plugin, host, port |
| `tsconfig.json` | TypeScript config for the frontend |
| `index.html` | HTML entry point — Vite injects the React app here |
| `components.json` | Shadcn/ui config — defines component style and paths |
| `.env` | Environment variables — Firebase keys, API URL, Stripe publishable key |

### `frontend/public/` — Static Assets

Files served directly without processing.

| File | Purpose |
|------|---------|
| `logo.png` | InstaStudy logo used in navbar and login page |
| `hero-bg.png` | Landing page hero background image |
| `hero-doodle.png` | Decorative doodle on landing page |
| `illus-browse.png` | Illustration on login page left panel |
| `illus-connect.png` | Illustration used in landing page features section |
| `illus-session.png` | Illustration for session step in landing page |
| `illus-study.png` | Illustration for study step in landing page |
| `opengraph.jpg` | Social media preview image (og:image) |
| `favicon.svg` | Browser tab icon |
| `images/` | Additional images used in landing page sections |

### `frontend/src/` — Source Code

#### Entry Points

| File | Purpose |
|------|---------|
| `main.tsx` | App entry point — mounts React into `index.html` |
| `App.tsx` | Root component — defines all routes using Wouter router |
| `index.css` | Global CSS — Tailwind base styles and CSS variables |

#### `src/pages/` — All 18 Pages

| File | Purpose |
|------|---------|
| `landing.tsx` | Public homepage — hero, features, testimonials, CTA |
| `login.tsx` | Sign in with email or Google — Firebase authentication |
| `register.tsx` | Create new account — email/password registration |
| `dashboard.tsx` | Home after login — stats, upcoming sessions, suggested tutors |
| `tutors.tsx` | Browse all approved tutors — search by name, filter by subject and rate |
| `tutor-profile.tsx` | Individual tutor page — bio, subjects, rate, availability slots, reviews |
| `book.tsx` | Booking page — select time slots, see pricing, redirect to Stripe checkout |
| `bookings.tsx` | My bookings — active/completed/cancelled tabs, session timer, review modal |
| `profile.tsx` | User profile — edit name, bio, phone, avatar; tutor stats and subjects |
| `availability.tsx` | Tutor availability manager — add and delete time slots |
| `become-tutor.tsx` | Tutor application form — subjects, rate, experience, CV upload |
| `academic-materials.tsx` | Browse and upload study materials (notes, past papers, projects) |
| `material-requests.tsx` | Students request specific study materials |
| `admin.tsx` | Admin overview — platform stats (users, tutors, bookings) |
| `admin-tutors.tsx` | Admin manages tutor applications — approve or reject |
| `admin-bookings.tsx` | Admin views all bookings across the platform |
| `payment-success.tsx` | Stripe redirect landing — polls API to confirm payment, shows result |
| `not-found.tsx` | 404 page |

#### `src/components/` — Reusable Components

| File | Purpose |
|------|---------|
| `auth-provider.tsx` | Global auth state — listens to Firebase, fetches user from API, provides `useAuth()` hook |
| `protected-route.tsx` | Route guard — redirects to login if not authenticated; checks admin/tutor roles |
| `layout/app-layout.tsx` | Main app shell — sidebar navigation, mobile menu, user avatar |
| `layout/public-navbar.tsx` | Navbar for public pages (landing, tutor profile when logged out) |
| `ui/*.tsx` | 50+ Shadcn/Radix UI components — Button, Input, Card, Dialog, Select, Toast, etc. |

#### `src/hooks/` — Custom React Hooks

| File | Purpose |
|------|---------|
| `use-firestore.ts` | All React Query hooks — `useListTutors`, `useCreateBooking`, `useSubmitReview`, etc. Each hook calls the API and caches the result |
| `use-toast.ts` | Toast notification hook — shows success/error messages |
| `use-mobile.tsx` | Detects if screen is mobile width |
| `use-layout.tsx` | Returns the correct layout (AppLayout or PublicNavbar) based on auth state |

#### `src/lib/` — Utilities and Services

| File | Purpose |
|------|---------|
| `api-client.ts` | All HTTP calls to the backend API — every function maps to one API endpoint. Gets Firebase token and attaches it to every request |
| `firebase.ts` | Firebase initialization — creates the Firebase app and auth instance |
| `firestore-service.ts` | Re-exports everything from `api-client.ts` — kept for backward compatibility |
| `auth-utils.ts` | Helper to build `AppUser` from raw API response; `defaultHomePath()` decides where to redirect after login |
| `types.ts` | All TypeScript interfaces — `AppUser`, `Booking`, `TutorProfile`, `Review`, `Payment`, etc. |
| `commission.ts` | PKR pricing logic — calculates student price, tutor payout, platform fee (13.33% per side) |
| `query-keys.ts` | React Query cache key factory — ensures consistent cache invalidation |
| `utils.ts` | `cn()` utility — merges Tailwind class names |
| `firestore-utils.ts` | Legacy utility file |

---

## `backend/` — Express API Server

The REST API server. Handles all data operations, authentication verification, and payment processing.

### Root Config Files

| File | Purpose |
|------|---------|
| `package.json` | Backend dependencies — Express, MySQL2, Firebase Admin, Stripe, UUID |
| `tsconfig.json` | TypeScript config (not actively used — server runs as plain JS) |
| `schema.sql` | Complete MySQL database schema — all 9 tables with indexes and foreign keys |
| `.env` | Secret environment variables — DB credentials, Firebase service account, Stripe secret key |

### `backend/src/` — Source Code

#### Entry & Core

| File | Purpose |
|------|---------|
| `server.js` | **Main entry point** — creates Express app, registers all routes, starts server on port 4000, tests DB connection on startup |
| `auth.js` | Firebase Admin middleware — `requireAuth()` verifies the JWT token on every protected request. Decodes the token and sets `req.uid` |
| `db.js` | MySQL connection pool — creates a pool of 10 reusable connections to MySQL using credentials from `.env` |

#### `src/routes/` — API Route Handlers

Each file handles one resource. All routes use `db.js` for MySQL queries and `auth.js` for token verification.

| File | Endpoints | Purpose |
|------|-----------|---------|
| `users.js` | `POST /ensure`, `GET /:uid`, `PATCH /:uid` | Create user on first login (upsert), get user profile, update name/bio/phone/avatar |
| `tutors.js` | `GET /`, `GET /:uid`, `POST /apply`, `PATCH /:uid`, `POST /:uid/approve`, `POST /:uid/reject`, `DELETE /:uid` | List approved tutors with search/filter, get single tutor, submit application, update profile, admin approve/reject/delete |
| `bookings.js` | `GET /all`, `GET /user/:uid/:role`, `POST /`, `PATCH /:id/status` | Admin list all bookings, list bookings for a user, create booking with slot locking transaction, update status (confirm/cancel/complete) |
| `availability.js` | `GET /:tutorId`, `POST /`, `DELETE /:id` | Get tutor's time slots, create a slot, delete a slot |
| `materials.js` | `GET /`, `POST /`, `GET /requests`, `POST /requests` | List academic materials, upload material, list material requests, create request |
| `reviews.js` | `POST /`, `GET /tutor/:id`, `GET /booking/:id`, `GET /admin/all` | Submit review, get reviews for a tutor, get review for a booking, admin view all reviews |
| `payments.js` | `POST /create-checkout-session`, `POST /webhook`, `GET /verify/:sessionId` | Create Stripe Checkout session (PKR→USD conversion), handle Stripe webhook to create bookings after payment, verify payment status |
| `admin.js` | `GET /stats` | Platform statistics — total users, active tutors, pending applications |

---

## Database — `backend/schema.sql`

9 tables normalized to 3NF.

| Table | Rows store | Key relationships |
|-------|-----------|-------------------|
| `users` | All registered users (students, tutors, admins) | Root table — all others reference it |
| `tutors` | Tutor-specific data (rate, CV, status, rating) | FK → users.uid (1:1) |
| `tutor_subjects` | One row per subject per tutor (1NF fix) | FK → tutors.uid |
| `availability` | Tutor time slots | FK → tutors.uid |
| `bookings` | Session bookings between student and tutor | FK → users, tutors, availability |
| `materials` | Uploaded study files | FK → users.uid |
| `material_requests` | Student requests for materials | FK → users.uid |
| `payments` | Stripe payment records | FK → users.uid |
| `reviews` | Post-session ratings and feedback | FK → bookings, tutors, users |

---

## External Services

| Service | Used for | Keys |
|---------|---------|------|
| **Firebase Auth** | User login, signup, Google OAuth, JWT token generation | `VITE_FIREBASE_API_KEY`, `FIREBASE_SERVICE_ACCOUNT` |
| **Stripe** | Card payment processing for booking sessions | `VITE_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY` |
| **MySQL** | Persistent data storage | `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` |

---

## How to Run

```bash
# Start backend (from backend/)
node src/server.js

# Start frontend (from frontend/)
npm run dev
```

Frontend runs on `http://localhost:5173`
Backend API runs on `http://localhost:4000`
