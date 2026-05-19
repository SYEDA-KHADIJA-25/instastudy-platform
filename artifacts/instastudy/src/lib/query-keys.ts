export const queryKeys = {
  tutorsList: (filters: Record<string, unknown>) => ["firebase", "tutors", filters] as const,
  tutor: (id: string) => ["firebase", "tutor", id] as const,
  myTutor: (uid: string | undefined) => ["firebase", "myTutor", uid] as const,
  availability: (tutorId: string) => ["firebase", "availability", tutorId] as const,
  bookings: (uid: string | undefined, role: string) => ["firebase", "bookings", uid, role] as const,
  dashboard: (uid: string | undefined, isTutor: boolean) => ["firebase", "dashboard", uid, isTutor] as const,
  featuredTutors: () => ["firebase", "featuredTutors"] as const,
  adminStats: () => ["firebase", "adminStats"] as const,
  adminApplications: (status: string) => ["firebase", "adminApplications", status] as const,
  adminAllBookings: () => ["firebase", "adminAllBookings"] as const,
  materialsList: () => ["firebase", "materials"] as const,
  materialRequestsList: () => ["firebase", "materialRequests"] as const,
};
