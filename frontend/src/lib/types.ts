export type AppRole = "user" | "tutor" | "admin";

export type TutorDocStatus = "pending" | "approved" | "rejected";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rejected";

export type UpdateBookingBodyStatus = "confirmed" | "completed" | "cancelled" | "rejected";

export interface AppUser {
  uid: string;
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  role: AppRole;
  createdAt?: string;
  isAdmin: boolean;
  isTutor: boolean;
  tutorStatus: "none" | TutorDocStatus;
}

/** Shape returned by MySQL users table */
export interface UserDoc {
  uid: string;
  name: string;
  email: string;
  role: AppRole;
  bio?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  created_at?: string | null;
}

/** Shape stored in MySQL tutors table (internal) */
export interface TutorDoc {
  userId: string;
  name: string;
  email: string;
  subjects: string[];
  experience?: string | null;
  hourlyRate: number;
  bio?: string | null;
  avatarUrl?: string | null;
  cvUrl?: string | null;
  cvFileName?: string | null;
  status: TutorDocStatus;
  rating?: number | null;
  reviewCount: number;
  createdAt?: string | null;
}

/** Public tutor card / profile shape */
export interface TutorProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
  subjects: string[];
  experience?: string | null;
  hourlyRate: number;
  rating?: number | null;
  reviewCount: number;
  sessionCount: number;
  status: TutorDocStatus;
  cvUrl?: string | null;
  cvFileName?: string | null;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  tutorId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  slotId: string;
  status: BookingStatus;
  subject?: string | null;
  notes?: string | null;
  meetingLink?: string | null;
  student?: { id: string; name: string; email?: string; phone?: string | null };
  tutor?: TutorProfile;
  slot?: { id: string; startTime: string; endTime: string };
  createdAt: string;
}

export interface DashboardStats {
  totalBookings: number;
  completedSessions: number;
  pendingBookings: number;
  totalEarnings: number;
}

export interface DashboardData {
  upcomingBookings: Booking[];
  pendingRequests: Booking[];
  suggestedTutors: TutorProfile[];
  tutorProfile?: TutorProfile | null;
  stats: DashboardStats;
}

export interface AdminStats {
  totalUsers: number;
  activeTutors: number;
  pendingApplications: number;
  rejectedApplications: number;
}

export interface TutorApplicationRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  subjects: string[];
  experience?: string | null;
  hourlyRate: number;
  status: TutorDocStatus;
  cvUrl?: string | null;
  cvFileName?: string | null;
  createdAt: string;
}

export type MaterialType = "Notes" | "Past Paper" | "Project" | "Other";

export interface AcademicMaterial {
  id: string;
  uploadedBy: string;
  uploaderName?: string | null;
  course?: string | null;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  materialType: MaterialType;
  isPublic: boolean;
  createdAt: string;
}

export type MaterialRequestStatus = "Open" | "Fulfilled" | "Closed";

export interface MaterialRequest {
  id: string;
  requestedBy: string;
  requesterName?: string | null;
  course?: string | null;
  description: string;
  status: MaterialRequestStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  tutorId: string;
  studentId: string;
  studentName: string;
  rating: number;
  feedback?: string | null;
  createdAt: string;
  tutorName?: string | null; // admin view only
}
