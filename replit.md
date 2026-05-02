# Insta-Study

## Overview

Insta-Study is a full-stack peer-to-peer tutoring platform. Users register, search tutors, book sessions, apply to become tutors, and manage bookings and availability — all from a single adaptive dashboard.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (session-based auth with `express-session` + `connect-pg-simple`)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4, Wouter (routing), TanStack Query
- **UI library**: shadcn/ui components with custom purple/pink gradient theme
- **Animations**: Framer Motion

## Theme

- Primary: `hsl(275 85% 55%)` — purple
- Secondary: `hsl(320 85% 60%)` — pink/magenta
- Background: light neutral with radial gradient accents

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed database with sample tutors and users

## Project Structure

```
artifacts/
  api-server/       — Express API server (port 8080, proxied at /api)
  insta-study/      — React + Vite frontend (port 22451, proxied at /)
lib/
  api-spec/         — OpenAPI spec (openapi.yaml) + Orval codegen config
  api-client-react/ — Generated React Query hooks + custom fetch with credentials:include
  api-zod/          — Generated Zod schemas
  db/               — Drizzle ORM schema, migrations, database pool
scripts/
  src/seed.ts       — Database seeding script
```

## Database Schema

- `users` — id, name, email, passwordHash, bio, avatarUrl, isTutor, tutorStatus (none/pending/approved/rejected)
- `tutor_profiles` — id, userId, subjects[], experience, hourlyRate, rating, reviewCount, status
- `availability_slots` — id, tutorId, startTime, endTime, isBooked
- `bookings` — id, studentId, tutorId, slotId, status, subject, notes

## Auth

Session-based (cookies). `SESSION_SECRET` env var required. Sessions stored in `user_sessions` PostgreSQL table.

## Seed Data

Demo accounts (password: `password123`):
- `sophia@instastudy.dev` — approved tutor (Mathematics, Calculus, Statistics, Linear Algebra)
- `james@instastudy.dev` — approved tutor (Computer Science, Python, Algorithms)
- `priya@instastudy.dev` — approved tutor (Biology, Chemistry, Biochemistry)
- `marcus@instastudy.dev` — approved tutor (English, Spanish, French)
- `alex@instastudy.dev` — student user

## Pages

- `/` — Landing page (public)
- `/login`, `/register` — Auth pages
- `/dashboard` — Single adaptive dashboard (stats, upcoming sessions, suggested tutors)
- `/tutors` — Browse/search tutors with filters
- `/tutors/:tutorId` — Tutor profile with availability slots
- `/book/:tutorId` — Book a session (auth required)
- `/bookings` — Manage all bookings (as student and as tutor)
- `/become-tutor` — Apply to become a tutor
- `/availability` — Manage availability slots (approved tutors only)
- `/profile` — Edit personal profile
