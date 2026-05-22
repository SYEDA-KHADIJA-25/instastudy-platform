import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as fs from "@/lib/firestore-service";
import { queryKeys } from "@/lib/query-keys";
import type { MaterialType, UpdateBookingBodyStatus } from "@/lib/types";

export function useListTutors(filters: { search?: string; subject?: string; maxRate?: number }) {
  return useQuery({
    queryKey: queryKeys.tutorsList(filters),
    queryFn: () => fs.listTutorsFiltered(filters),
  });
}

export function useGetTutor(tutorId: string) {
  return useQuery({
    queryKey: queryKeys.tutor(tutorId),
    queryFn: () => fs.getTutorDoc(tutorId),
    enabled: !!tutorId,
  });
}

export function useGetMyTutorProfile(uid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.myTutor(uid),
    queryFn: () => (uid ? fs.getTutorDoc(uid) : null),
    enabled: !!uid,
  });
}

export function useGetTutorAvailability(tutorId: string) {
  return useQuery({
    queryKey: queryKeys.availability(tutorId),
    queryFn: () => fs.listAvailabilityForTutor(tutorId),
    enabled: !!tutorId,
  });
}

export function useGetFeaturedTutors() {
  return useQuery({
    queryKey: queryKeys.featuredTutors(),
    queryFn: () => fs.getFeaturedTutors(3),
  });
}

export function useGetDashboard(uid: string | undefined, isApprovedTutor: boolean) {
  return useQuery({
    queryKey: queryKeys.dashboard(uid, isApprovedTutor),
    queryFn: () => (uid ? fs.getDashboardData({ uid, isApprovedTutor }) : null),
    enabled: !!uid,
  });
}

export function useListMyBookings(uid: string | undefined, role: "student" | "tutor", enabled = true) {
  return useQuery({
    queryKey: queryKeys.bookings(uid, role),
    queryFn: () => (uid ? fs.listBookingsForUser(uid, role) : []),
    enabled: !!uid && enabled,
  });
}

function invalidateBookingRelated(qc: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: ["firebase", "bookings"] }),
    qc.invalidateQueries({ queryKey: ["firebase", "dashboard"] }),
    qc.invalidateQueries({ queryKey: ["firebase", "availability"] }),
  ]);
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fs.createBookingRequest,
    onSuccess: async () => {
      await invalidateBookingRelated(qc);
    },
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, status, meetingLink }: { bookingId: string; status: UpdateBookingBodyStatus; meetingLink?: string }) =>
      fs.updateBookingStatus(bookingId, status, meetingLink),
    onSuccess: async () => {
      await invalidateBookingRelated(qc);
    },
  });
}

export function useApplyTutor(uid: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fs.submitTutorApplication,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.myTutor(uid) });
    },
  });
}

export function useUpdateMyTutorProfile(uid: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tutorUid, data }: { tutorUid: string; data: Parameters<typeof fs.updateTutorProfile>[1] }) =>
      fs.updateTutorProfile(tutorUid, data),
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: queryKeys.myTutor(uid) });
      await qc.invalidateQueries({ queryKey: queryKeys.tutor(vars.tutorUid) });
    },
  });
}

export function useCreateAvailabilitySlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fs.createAvailabilitySlot,
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: queryKeys.availability(vars.tutorId) });
    },
  });
}

export function useDeleteAvailabilitySlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tutorId, slotId }: { tutorId: string; slotId: string }) => {
      await fs.deleteAvailabilitySlot(slotId);
      return tutorId;
    },
    onSuccess: async (tutorId) => {
      await qc.invalidateQueries({ queryKey: queryKeys.availability(tutorId) });
    },
  });
}

export function useUpdateUserProfile() {
  return useMutation({
    mutationFn: ({ targetUid, data }: { targetUid: string; data: { name?: string; bio?: string | null; avatarUrl?: string | null; phone?: string | null } }) =>
      fs.updateUserProfile(targetUid, data),
  });
}

export function useGetAdminStats() {
  return useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: () => fs.getAdminStats(),
  });
}

export function useListAdminApplications(status: "pending" | "approved" | "rejected") {
  return useQuery({
    queryKey: queryKeys.adminApplications(status),
    queryFn: () => fs.listTutorApplicationsByStatus(status),
  });
}

export function useListAllBookings() {
  return useQuery({
    queryKey: queryKeys.adminAllBookings(),
    queryFn: () => fs.listAllBookings(),
  });
}

export function useApproveApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tutorUid: string) => fs.approveTutorApplication(tutorUid),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["firebase", "adminStats"] }),
        qc.invalidateQueries({ queryKey: ["firebase", "adminApplications"] }),
        qc.invalidateQueries({ queryKey: ["firebase", "tutors"] }),
        qc.invalidateQueries({ queryKey: ["firebase", "myTutor"] }),
      ]);
    },
  });
}

export function useRejectApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tutorUid: string) => fs.rejectTutorApplication(tutorUid),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["firebase", "adminStats"] }),
        qc.invalidateQueries({ queryKey: ["firebase", "adminApplications"] }),
        qc.invalidateQueries({ queryKey: ["firebase", "tutors"] }),
      ]);
    },
  });
}

export function useDeleteTutor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tutorUid: string) => fs.deleteTutorAccount(tutorUid),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["firebase", "adminStats"] }),
        qc.invalidateQueries({ queryKey: ["firebase", "adminApplications"] }),
        qc.invalidateQueries({ queryKey: ["firebase", "tutors"] }),
      ]);
    },
  });
}

export function useListAcademicMaterials() {
  return useQuery({
    queryKey: queryKeys.materialsList(),
    queryFn: () => fs.listAcademicMaterials(),
  });
}

export function useCreateAcademicMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      uploadedBy: string;
      uploaderName: string;
      title: string;
      description?: string;
      course?: string;
      fileUrl?: string;
      materialType: MaterialType;
      isPublic: boolean;
    }) => fs.createAcademicMaterial(params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.materialsList() });
    },
  });
}

export function useListMaterialRequests() {
  return useQuery({
    queryKey: queryKeys.materialRequestsList(),
    queryFn: () => fs.listMaterialRequests(),
  });
}

export function useCreateMaterialRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      requestedBy: string;
      requesterName: string;
      course?: string;
      description: string;
    }) => fs.createMaterialRequest(params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.materialRequestsList() });
    },
  });
}

// ── Reviews ──────────────────────────────────────────────────

export function useListReviewsForTutor(tutorId: string) {
  return useQuery({
    queryKey: ["reviews", "tutor", tutorId],
    queryFn: () => fs.listReviewsForTutor(tutorId),
    enabled: !!tutorId,
  });
}

export function useGetReviewForBooking(bookingId: string) {
  return useQuery({
    queryKey: ["reviews", "booking", bookingId],
    queryFn: () => fs.getReviewForBooking(bookingId),
    enabled: !!bookingId,
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { bookingId: string; tutorId: string; rating: number; feedback?: string }) =>
      fs.submitReview(params),
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["reviews", "tutor", vars.tutorId] }),
        qc.invalidateQueries({ queryKey: ["reviews", "booking", vars.bookingId] }),
        qc.invalidateQueries({ queryKey: ["firebase", "tutors"] }),
        qc.invalidateQueries({ queryKey: ["firebase", "bookings"] }),
      ]);
    },
  });
}

export function useListAllReviewsAdmin() {
  return useQuery({
    queryKey: ["reviews", "admin", "all"],
    queryFn: () => fs.listAllReviewsAdmin(),
  });
}
