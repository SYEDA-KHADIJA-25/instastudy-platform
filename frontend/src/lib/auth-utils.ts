import type { AppUser, TutorProfile } from "@/lib/types";

export interface UserRow {
  uid: string;
  name: string;
  email: string;
  role: "user" | "tutor" | "admin";
  bio?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
}

export function buildAppUser(uid: string, data: UserRow, tutor: TutorProfile | null): AppUser {
  const isApprovedTutor = tutor?.status === "approved";
  return {
    uid,
    id: uid,
    name: data.name,
    email: data.email,
    bio: data.bio ?? null,
    avatarUrl: data.avatar_url ?? null,
    role: data.role,
    createdAt: data.created_at ? new Date(data.created_at).toISOString() : undefined,
    isAdmin: data.role === "admin",
    isTutor: isApprovedTutor,
    tutorStatus: tutor ? tutor.status : "none",
  };
}

export function defaultHomePath(user: AppUser | null): string {
  if (!user) return "/login";
  if (user.role === "admin") return "/admin";
  if (user.role === "tutor" && user.isTutor) return "/tutor";
  return "/dashboard";
}
