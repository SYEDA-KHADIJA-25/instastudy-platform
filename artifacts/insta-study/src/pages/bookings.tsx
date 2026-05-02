import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListMyBookings,
  useUpdateBooking,
  getListMyBookingsQueryKey,
  getGetDashboardQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Clock, CheckCircle, XCircle, BookOpen, ChevronRight, Flag } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] || "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}

function BookingCard({ booking, asTutor, onAction, isUpdating }: {
  booking: any;
  asTutor?: boolean;
  onAction?: (id: number, status: string) => void;
  isUpdating?: boolean;
}) {
  const otherName = asTutor ? booking.student?.name : booking.tutor?.name;
  return (
    <Card className="border-card-border" data-testid={`booking-card-${booking.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 text-primary-foreground text-sm font-bold">
            {otherName?.charAt(0) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-medium text-foreground truncate">{otherName || "Unknown"}</h3>
              <StatusBadge status={booking.status} />
            </div>
            {booking.subject && (
              <p className="mt-0.5 text-sm text-muted-foreground">{booking.subject}</p>
            )}
            {booking.slot && (
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(booking.slot.startTime), "EEE, MMM d")}
                <Clock className="ml-1 h-3.5 w-3.5" />
                {format(new Date(booking.slot.startTime), "h:mm a")} – {format(new Date(booking.slot.endTime), "h:mm a")}
              </div>
            )}
            {booking.notes && (
              <p className="mt-1.5 text-xs text-muted-foreground italic">"{booking.notes}"</p>
            )}
          </div>
        </div>

        {asTutor && onAction && (
          <>
            {booking.status === "pending" && (
              <div className="mt-3 flex gap-2 pt-3 border-t border-border">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => onAction(booking.id, "confirmed")}
                  disabled={isUpdating}
                  data-testid={`button-accept-booking-${booking.id}`}
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1.5 text-red-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                  onClick={() => onAction(booking.id, "rejected")}
                  disabled={isUpdating}
                  data-testid={`button-reject-booking-${booking.id}`}
                >
                  <XCircle className="h-3.5 w-3.5" /> Decline
                </Button>
              </div>
            )}
            {booking.status === "confirmed" && (
              <div className="mt-3 pt-3 border-t border-border">
                <Button
                  size="sm"
                  className="gap-1.5 bg-green-600 hover:bg-green-700"
                  onClick={() => onAction(booking.id, "completed")}
                  disabled={isUpdating}
                  data-testid={`button-complete-booking-${booking.id}`}
                >
                  <Flag className="h-3.5 w-3.5" /> Mark as completed
                </Button>
              </div>
            )}
          </>
        )}

        {!asTutor && booking.status === "pending" && onAction && (
          <div className="mt-3 pt-3 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
              onClick={() => onAction(booking.id, "cancelled")}
              disabled={isUpdating}
              data-testid={`button-cancel-booking-${booking.id}`}
            >
              Cancel request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isTutor = user?.isTutor && user?.tutorStatus === "approved";
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data: studentBookings, isLoading: loadingStudent } = useListMyBookings(
    { role: "student" },
    { query: { queryKey: getListMyBookingsQueryKey({ role: "student" }) } }
  );

  const { data: tutorBookings, isLoading: loadingTutor } = useListMyBookings(
    { role: "tutor" },
    { query: { enabled: !!isTutor, queryKey: getListMyBookingsQueryKey({ role: "tutor" }) } }
  );

  const updateMutation = useUpdateBooking({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMyBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        setUpdatingId(null);
        toast({ title: "Booking updated" });
      },
      onError: () => {
        setUpdatingId(null);
        toast({ title: "Failed to update booking", variant: "destructive" });
      },
    },
  });

  const handleAction = (bookingId: number, status: string) => {
    setUpdatingId(bookingId);
    updateMutation.mutate({ bookingId, data: { status: status as any } });
  };

  const pendingStudent = studentBookings?.filter((b) => b.status === "pending") || [];
  const activeStudent = studentBookings?.filter((b) => b.status === "confirmed") || [];
  const pastStudent = studentBookings?.filter((b) => ["completed", "cancelled", "rejected"].includes(b.status)) || [];

  const pendingTutor = tutorBookings?.filter((b) => b.status === "pending") || [];
  const activeTutor = tutorBookings?.filter((b) => b.status === "confirmed") || [];
  const pastTutor = tutorBookings?.filter((b) => ["completed", "rejected", "cancelled"].includes(b.status)) || [];

  const renderEmpty = (label: string) => (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <BookOpen className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium text-foreground">{label}</h3>
      <p className="mt-1 text-sm text-muted-foreground">Your booking history will appear here</p>
      <Link href="/tutors">
        <Button className="mt-4 gap-1.5" size="sm">Find a tutor <ChevronRight className="h-3.5 w-3.5" /></Button>
      </Link>
    </div>
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage all your tutoring sessions</p>
        </div>

        <Tabs defaultValue="student">
          <TabsList className="mb-6">
            <TabsTrigger value="student" data-testid="tab-student-bookings">
              As student
              {studentBookings && studentBookings.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary font-medium">
                  {studentBookings.length}
                </span>
              )}
            </TabsTrigger>
            {isTutor && (
              <TabsTrigger value="tutor" data-testid="tab-tutor-bookings">
                As tutor
                {pendingTutor.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 font-medium">
                    {pendingTutor.length}
                  </span>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Student tab */}
          <TabsContent value="student">
            {loadingStudent ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : studentBookings && studentBookings.length > 0 ? (
              <motion.div
                className="space-y-6"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06 } } }}
              >
                {pendingStudent.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Pending requests ({pendingStudent.length})</h3>
                    <div className="space-y-3">
                      {pendingStudent.map((b) => (
                        <motion.div key={b.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                          <BookingCard booking={b} onAction={handleAction} isUpdating={updatingId === b.id} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeStudent.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Confirmed sessions</h3>
                    <div className="space-y-3">
                      {activeStudent.map((b) => (
                        <motion.div key={b.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                          <BookingCard booking={b} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {pastStudent.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Past sessions</h3>
                    <div className="space-y-3">
                      {pastStudent.map((b) => (
                        <motion.div key={b.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                          <BookingCard booking={b} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              renderEmpty("No bookings yet")
            )}
          </TabsContent>

          {/* Tutor tab */}
          {isTutor && (
            <TabsContent value="tutor">
              {loadingTutor ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingTutor.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-foreground">Pending requests ({pendingTutor.length})</h3>
                      <div className="space-y-3">
                        {pendingTutor.map((b) => (
                          <BookingCard key={b.id} booking={b} asTutor onAction={handleAction} isUpdating={updatingId === b.id} />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTutor.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-foreground">Confirmed sessions</h3>
                      <div className="space-y-3">
                        {activeTutor.map((b) => (
                          <BookingCard key={b.id} booking={b} asTutor onAction={handleAction} isUpdating={updatingId === b.id} />
                        ))}
                      </div>
                    </div>
                  )}

                  {pastTutor.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-foreground">Past sessions</h3>
                      <div className="space-y-3">
                        {pastTutor.map((b) => (
                          <BookingCard key={b.id} booking={b} asTutor />
                        ))}
                      </div>
                    </div>
                  )}

                  {!pendingTutor.length && !activeTutor.length && !pastTutor.length && (
                    <div className="flex flex-col items-center py-16 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <BookOpen className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No session requests yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Students will appear here once they book with you</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
