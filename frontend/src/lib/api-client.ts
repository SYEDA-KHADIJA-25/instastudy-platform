/**
 * API client — replaces firestore-service.ts
 * All data operations go through the Express/MySQL API server.
 * Firebase is used only for authentication (token generation).
 */
import { getFirebaseAuth } from "@/lib/firebase";
import type {
  AcademicMaterial,
  AdminStats,
  AvailabilitySlot,
  Booking,
  DashboardData,
  DashboardStats,
  MaterialRequest,
  MaterialType,
  Review,
  TutorApplicationRow,
  TutorProfile,
  UpdateBookingBodyStatus,
} from "@/lib/types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function getToken(): Promise<string> {
  const auth = getFirebaseAuth();

  // If currentUser is already present, use it immediately
  if (auth.currentUser) {
    return auth.currentUser.getIdToken(false);
  }

  // Wait for Firebase to finish its auth-state restore (happens on page load / after sign-in)
  const user = await new Promise<import("firebase/auth").User | null>((resolve) => {
    // onAuthStateChanged fires synchronously if auth is already initialised,
    // or asynchronously once the SDK has restored the session from storage.
    const unsub = auth.onAuthStateChanged((u) => {
      unsub();
      resolve(u);
    });
    // Safety net: don't hang forever
    setTimeout(() => { unsub(); resolve(null); }, 8000);
  });

  if (!user) throw new Error("Not authenticated");
  return user.getIdToken(false);
}

async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken().catch(() => "");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// ── Users ────────────────────────────────────────────────────

export async function ensureUserDocument(params: {
  uid: string; email: string; name: string; photoURL?: string | null;
}): Promise<void> {
  await api("/users/ensure", {
    method: "POST",
    body: JSON.stringify({ name: params.name, email: params.email, photoURL: params.photoURL ?? null }),
  });
}

export async function getUserDoc(uid: string) {
  return api<{ uid: string; name: string; email: string; role: string; bio: string | null; avatar_url: string | null; created_at: string }>(`/users/${uid}`);
}

export async function updateUserProfile(uid: string, data: { name?: string; bio?: string | null; avatarUrl?: string | null; phone?: string | null }): Promise<void> {
  await api(`/users/${uid}`, { method: "PATCH", body: JSON.stringify(data) });
}

// ── Tutors ───────────────────────────────────────────────────

export async function getTutorDoc(uid: string): Promise<TutorProfile | null> {
  try {
    return await api<TutorProfile>(`/tutors/${uid}`);
  } catch {
    return null;
  }
}

export async function listTutorsFiltered(params: {
  search?: string; subject?: string; maxRate?: number;
}): Promise<TutorProfile[]> {
  const q = new URLSearchParams();
  if (params.search)  q.set("search",  params.search);
  if (params.subject) q.set("subject", params.subject);
  if (params.maxRate) q.set("maxRate", String(params.maxRate));
  const qs = q.toString();
  return api<TutorProfile[]>(`/tutors${qs ? `?${qs}` : ""}`);
}

export async function listApprovedTutors(): Promise<TutorProfile[]> {
  return listTutorsFiltered({});
}

export async function getFeaturedTutors(count = 3): Promise<TutorProfile[]> {
  const all = await listApprovedTutors();
  return all.slice(0, count);
}

export async function submitTutorApplication(params: {
  uid: string; name: string; email: string; subjects: string[];
  experience: string; hourlyRate: number; bio?: string;
  cvUrl?: string; cvFileName?: string;
}): Promise<void> {
  await api("/tutors/apply", { method: "POST", body: JSON.stringify(params) });
}

export async function updateTutorProfile(uid: string, data: {
  subjects?: string[]; experience?: string; hourlyRate?: number; bio?: string;
}): Promise<void> {
  await api(`/tutors/${uid}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function listTutorApplicationsByStatus(status: "pending" | "approved" | "rejected"): Promise<TutorApplicationRow[]> {
  return api<TutorApplicationRow[]>(`/tutors/admin/by-status/${status}`);
}

export async function approveTutorApplication(tutorUid: string): Promise<void> {
  await api(`/tutors/${tutorUid}/approve`, { method: "POST" });
}

export async function rejectTutorApplication(tutorUid: string): Promise<void> {
  await api(`/tutors/${tutorUid}/reject`, { method: "POST" });
}

export async function deleteTutorAccount(tutorUid: string): Promise<void> {
  await api(`/tutors/${tutorUid}`, { method: "DELETE" });
}

// ── Availability ─────────────────────────────────────────────

export async function listAvailabilityForTutor(tutorId: string): Promise<AvailabilitySlot[]> {
  if (!tutorId) return [];
  return api<AvailabilitySlot[]>(`/availability/${tutorId}`);
}

export async function createAvailabilitySlot(params: {
  tutorId: string; startTime: string; endTime: string;
}): Promise<void> {
  await api("/availability", { method: "POST", body: JSON.stringify(params) });
}

export async function deleteAvailabilitySlot(slotId: string): Promise<void> {
  await api(`/availability/${slotId}`, { method: "DELETE" });
}

// ── Bookings ─────────────────────────────────────────────────

export async function listBookingsForUser(uid: string, role: "student" | "tutor"): Promise<Booking[]> {
  return api<Booking[]>(`/bookings/user/${uid}/${role}`);
}

export async function listAllBookings(): Promise<Booking[]> {
  return api<Booking[]>("/bookings/all");
}

export async function createBookingRequest(params: {
  studentId: string; studentName: string; tutorId: string; tutorName: string;
  slotId: string; subject?: string; notes?: string;
}): Promise<void> {
  await api("/bookings", { method: "POST", body: JSON.stringify(params) });
}

export async function updateBookingStatus(
  bookingId: string,
  status: UpdateBookingBodyStatus,
  meetingLink?: string
): Promise<void> {
  await api(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, meetingLink }),
  });
}

// ── Dashboard ────────────────────────────────────────────────

export async function getDashboardData(params: {
  uid: string; isApprovedTutor: boolean;
}): Promise<DashboardData> {
  const studentBookings = await listBookingsForUser(params.uid, "student");
  const tutorBookings   = params.isApprovedTutor ? await listBookingsForUser(params.uid, "tutor") : [];

  const upcoming = (list: Booking[]) =>
    list.filter((b) => (b.status === "pending" || b.status === "confirmed") && b.slot && new Date(b.slot.endTime) >= new Date());

  const pendingTutor = tutorBookings.filter((b) => b.status === "pending");
  const allTutors    = await listApprovedTutors();
  const suggested    = allTutors.filter((t) => t.id !== params.uid).slice(0, 4);
  const tutorProfile = params.isApprovedTutor ? await getTutorDoc(params.uid) : null;

  const completedStudent = studentBookings.filter((b) => b.status === "completed").length;
  const completedTutor   = tutorBookings.filter((b) => b.status === "completed").length;

  const stats: DashboardStats = params.isApprovedTutor
    ? {
        totalBookings:    tutorBookings.length,
        completedSessions: completedTutor,
        pendingBookings:  pendingTutor.length,
        totalEarnings:    tutorBookings.filter((b) => b.status === "completed")
                            .reduce((sum) => sum + (tutorProfile?.hourlyRate ?? 0), 0),
      }
    : {
        totalBookings:    studentBookings.length,
        completedSessions: completedStudent,
        pendingBookings:  studentBookings.filter((b) => b.status === "pending").length,
        totalEarnings:    0,
      };

  return {
    upcomingBookings: upcoming(studentBookings).slice(0, 8),
    pendingRequests:  pendingTutor,
    suggestedTutors:  suggested,
    tutorProfile,
    stats,
  };
}

// ── Admin Stats ──────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  return api<AdminStats>("/admin/stats");
}

// ── Materials ────────────────────────────────────────────────

export async function listAcademicMaterials(): Promise<AcademicMaterial[]> {
  return api<AcademicMaterial[]>("/materials");
}

export async function createAcademicMaterial(params: {
  uploadedBy: string; uploaderName: string; title: string;
  description?: string; course?: string; fileUrl?: string;
  materialType: MaterialType; isPublic: boolean;
}): Promise<void> {
  await api("/materials", { method: "POST", body: JSON.stringify(params) });
}

export async function listMaterialRequests(): Promise<MaterialRequest[]> {
  return api<MaterialRequest[]>("/materials/requests");
}

export async function createMaterialRequest(params: {
  requestedBy: string; requesterName: string; course?: string; description: string;
}): Promise<void> {
  await api("/materials/requests", { method: "POST", body: JSON.stringify(params) });
}

// ── Payments ─────────────────────────────────────────────────

export async function createCheckoutSession(params: {
  tutorId: string;
  tutorName: string;
  slotIds: string[];
  amountPkr: number;
  subject?: string;
  notes?: string;
  studentName: string;
}): Promise<{ url: string; sessionId: string }> {
  const appUrl = window.location.origin;
  return api<{ url: string; sessionId: string }>("/payments/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({ ...params, appUrl }),
  });
}

export async function verifyPayment(sessionId: string): Promise<{
  status: string;
  dbStatus: string;
  bookingId: string | null;
}> {
  return api(`/payments/verify/${sessionId}`);
}

// ── Legacy alias (auth-provider uses this) ───────────────────
export { getTutorDoc as mapTutorDocToProfile };

// ── Reviews ──────────────────────────────────────────────────

export async function submitReview(params: {
  bookingId: string; tutorId: string; rating: number; feedback?: string;
}): Promise<Review> {
  return api<Review>("/reviews", { method: "POST", body: JSON.stringify(params) });
}

export async function listReviewsForTutor(tutorId: string): Promise<Review[]> {
  return api<Review[]>(`/reviews/tutor/${tutorId}`);
}

export async function getReviewForBooking(bookingId: string): Promise<Review | null> {
  return api<Review | null>(`/reviews/booking/${bookingId}`);
}

export async function listAllReviewsAdmin(): Promise<Review[]> {
  return api<Review[]>("/reviews/admin/all");
}
