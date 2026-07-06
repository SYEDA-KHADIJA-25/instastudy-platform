import { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useListMyBookings, useUpdateBooking, useSubmitReview, useGetReviewForBooking } from "@/hooks/use-firestore";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Clock, CheckCircle, XCircle, BookOpen, ChevronRight, Flag, Link2, ExternalLink, Star, MessageSquare, Timer, Phone } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import type { Booking, UpdateBookingBodyStatus } from "@/lib/types";

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

// ── Session Timer ─────────────────────────────────────────────
function useSessionTimer(booking: Booking, onExpire: () => void) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiredRef = useRef(false);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    setSessionStarted(true);
    const endMs = Date.now() + 60 * 60 * 1000; // 1 hour from now
    localStorage.setItem(`session_end_${booking.id}`, String(endMs));

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(timerRef.current!);
        timerRef.current = null;
        onExpire();
      }
    }, 1000);
  }, [booking.id, onExpire]);

  // Restore timer from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`session_end_${booking.id}`);
    if (stored) {
      const endMs = parseInt(stored, 10);
      const remaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      if (remaining > 0) {
        setSessionStarted(true);
        setSecondsLeft(remaining);
        timerRef.current = setInterval(() => {
          const r = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
          setSecondsLeft(r);
          if (r === 0 && !expiredRef.current) {
            expiredRef.current = true;
            clearInterval(timerRef.current!);
            timerRef.current = null;
            onExpire();
          }
        }, 1000);
      } else if (remaining === 0) {
        // Already expired
        setSessionStarted(true);
        setSecondsLeft(0);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [booking.id, onExpire]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return { secondsLeft, sessionStarted, startTimer, formatTime };
}

// ── Review Modal ──────────────────────────────────────────────
function ReviewModal({
  booking,
  onClose,
  onSubmitted,
}: {
  booking: Booking;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [criticism, setCriticism] = useState("");
  const submitReview = useSubmitReview();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a star rating", variant: "destructive" });
      return;
    }
    const fullFeedback = [feedback.trim(), criticism.trim()].filter(Boolean).join("\n\nCriticism: ");
    try {
      await submitReview.mutateAsync({
        bookingId: booking.id,
        tutorId: booking.tutorId,
        rating,
        feedback: fullFeedback || undefined,
      });
      localStorage.removeItem(`session_end_${booking.id}`);
      toast({ title: "Review submitted — thank you!" });
      onSubmitted();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to submit review";
      toast({ title: msg, variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Rate your session</h2>
              <p className="text-sm text-muted-foreground">
                How was your session with {booking.tutor?.name ?? "the tutor"}?
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Star rating */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Overall rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      star <= (hovered || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              Feedback <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="What did you like about this session?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* Criticism */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
              Criticism / suggestions <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="What could be improved?"
              value={criticism}
              onChange={(e) => setCriticism(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              className="flex-1 gap-1.5"
              onClick={() => void handleSubmit()}
              disabled={submitReview.isPending}
            >
              {submitReview.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Star className="h-4 w-4" />
              )}
              Submit review
            </Button>
            <Button variant="outline" onClick={onClose} disabled={submitReview.isPending}>
              Skip
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Student Join Link with Timer ──────────────────────────────
function StudentJoinLink({
  booking,
  onAutoComplete,
}: {
  booking: Booking;
  onAutoComplete: (id: string) => void;
}) {
  const [showReview, setShowReview] = useState(false);
  const [reviewDismissed, setReviewDismissed] = useState(false);
  const { data: existingReview } = useGetReviewForBooking(booking.id);

  const handleExpire = useCallback(() => {
    onAutoComplete(booking.id);
    setShowReview(true);
  }, [booking.id, onAutoComplete]);

  const { secondsLeft, sessionStarted, startTimer, formatTime } = useSessionTimer(booking, handleExpire);

  // Check if slot time has started
  const now = Date.now();
  const slotStart = booking.slot ? new Date(booking.slot.startTime).getTime() : 0;
  const slotEnd = booking.slot ? new Date(booking.slot.endTime).getTime() : 0;
  const isWithinSlot = now >= slotStart && now <= slotEnd + 5 * 60 * 1000; // 5 min grace
  const isBeforeSlot = now < slotStart;

  if (!booking.meetingLink) return null;

  const handleJoin = () => {
    window.open(booking.meetingLink!, "_blank", "noopener,noreferrer");
    startTimer();
  };

  return (
    <>
      <div className="mt-2 space-y-2">
        {/* Join button — only active during slot time */}
        {isBeforeSlot ? (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted border border-border px-3 py-1.5 text-xs text-muted-foreground cursor-not-allowed select-none">
            <Link2 className="h-3.5 w-3.5" />
            Join session
            <span className="ml-1 text-[10px] opacity-70">
              (available at {format(new Date(booking.slot!.startTime), "h:mm a")})
            </span>
          </div>
        ) : isWithinSlot ? (
          <button
            onClick={handleJoin}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Link2 className="h-3.5 w-3.5" />
            Join session
            <ExternalLink className="h-3 w-3 opacity-60" />
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted border border-border px-3 py-1.5 text-xs text-muted-foreground cursor-not-allowed select-none">
            <Link2 className="h-3.5 w-3.5" />
            Session ended
          </div>
        )}

        {/* Timer display */}
        {sessionStarted && secondsLeft !== null && secondsLeft > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700">
            <Timer className="h-3.5 w-3.5 animate-pulse" />
            Session time remaining: {formatTime(secondsLeft)}
          </div>
        )}
        {sessionStarted && secondsLeft === 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700">
            <Timer className="h-3.5 w-3.5" />
            Session time ended
          </div>
        )}
      </div>

      {/* Review modal — shown after session ends, if not already reviewed */}
      <AnimatePresence>
        {showReview && !reviewDismissed && !existingReview && (
          <ReviewModal
            booking={booking}
            onClose={() => { setShowReview(false); setReviewDismissed(true); }}
            onSubmitted={() => { setShowReview(false); setReviewDismissed(true); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Booking Card ──────────────────────────────────────────────
function BookingCard({
  booking,
  role,
  onAction,
  onAutoComplete,
}: {
  booking: Booking;
  role: "student" | "tutor";
  onAction: (id: string, status: UpdateBookingBodyStatus, meetingLink?: string) => void;
  onAutoComplete: (id: string) => void;
}) {
  const [meetingLinkInput, setMeetingLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const { data: existingReview } = useGetReviewForBooking(booking.id);

  const slotLabel = booking.slot
    ? `${format(new Date(booking.slot.startTime), "EEE, MMM d · h:mm a")} – ${format(new Date(booking.slot.endTime), "h:mm a")}`
    : "Slot not available";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Card className="overflow-hidden border border-border hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            {/* Left info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <StatusBadge status={booking.status} />
                {booking.subject && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/50 px-2 py-0.5 text-xs text-secondary-foreground">
                    <BookOpen className="h-3 w-3" />
                    {booking.subject}
                  </span>
                )}
              </div>

              <p className="font-semibold text-foreground truncate">
                {role === "student"
                  ? booking.tutor?.name ?? "Tutor"
                  : booking.student?.name ?? "Student"}
              </p>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{slotLabel}</span>
              </div>

              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>Booked {format(new Date(booking.createdAt), "MMM d, yyyy")}</span>
              </div>

              {booking.notes && (
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 italic">
                  "{booking.notes}"
                </p>
              )}

              {/* Join link — student only, confirmed bookings */}
              {role === "student" && booking.status === "confirmed" && (
                <StudentJoinLink booking={booking} onAutoComplete={onAutoComplete} />
              )}

              {/* Tutor meeting link display */}
              {role === "tutor" && booking.meetingLink && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
                  <Link2 className="h-3.5 w-3.5" />
                  <a
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-blue-800 truncate max-w-[220px]"
                  >
                    {booking.meetingLink}
                  </a>
                </div>
              )}

              {/* Phone numbers — visible on confirmed/in_progress/completed bookings */}
              {(booking.status === "confirmed" || booking.status === "completed") && (
                <div className="mt-2 space-y-1">
                  {/* Student sees tutor's phone */}
                  {role === "student" && booking.tutor?.phone && (
                    <a
                      href={`tel:${booking.tutor.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call tutor: {booking.tutor.phone}
                    </a>
                  )}
                  {/* Tutor sees student's phone */}
                  {role === "tutor" && booking.student?.phone && (
                    <a
                      href={`tel:${booking.student.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call student: {booking.student.phone}
                    </a>
                  )}
                </div>
              )}

              {/* Review badge */}
              {booking.status === "completed" && existingReview && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-700">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  Reviewed · {existingReview.rating}/5
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              {/* Tutor actions */}
              {role === "tutor" && booking.status === "pending" && (
                <>
                  {showLinkInput ? (
                    <div className="flex flex-col gap-1.5">
                      <Input
                        placeholder="Meeting link (optional)"
                        value={meetingLinkInput}
                        onChange={(e) => setMeetingLinkInput(e.target.value)}
                        className="h-7 text-xs w-48"
                      />
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 text-xs flex-1"
                          onClick={() => {
                            onAction(booking.id, "confirmed", meetingLinkInput || undefined);
                            setShowLinkInput(false);
                          }}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => setShowLinkInput(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setShowLinkInput(true)}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Accept
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                    onClick={() => onAction(booking.id, "rejected")}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Reject
                  </Button>
                </>
              )}

              {/* Student cancel */}
              {role === "student" && (booking.status === "pending" || booking.status === "confirmed") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => onAction(booking.id, "cancelled")}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
              )}

              {/* View tutor profile */}
              {role === "student" && booking.tutorId && (
                <Link href={`/tutors/${booking.tutorId}`}>
                  <Button size="sm" variant="ghost" className="h-7 text-xs w-full">
                    View profile
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function BookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const updateBooking = useUpdateBooking();

  const isApprovedTutor = user?.role === "tutor";
  const role: "student" | "tutor" = isApprovedTutor ? "tutor" : "student";

  const { data: bookings = [], isLoading } = useListMyBookings(user?.uid, role);

  const handleAction = useCallback(
    (bookingId: string, status: UpdateBookingBodyStatus, meetingLink?: string) => {
      updateBooking.mutate(
        { bookingId, status, meetingLink },
        {
          onSuccess: () => {
            toast({ title: `Booking ${status}` });
          },
          onError: (e: unknown) => {
            const msg = e instanceof Error ? e.message : "Action failed";
            toast({ title: msg, variant: "destructive" });
          },
        }
      );
    },
    [updateBooking, toast]
  );

  const handleAutoComplete = useCallback(
    (bookingId: string) => {
      updateBooking.mutate({ bookingId, status: "completed" });
    },
    [updateBooking]
  );

  // Split bookings by status
  const active = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const completed = bookings.filter((b) => b.status === "completed");
  const cancelled = bookings.filter((b) => b.status === "cancelled" || b.status === "rejected");

  const renderList = (list: Booking[]) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-3">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No bookings here yet</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {list.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              role={role}
              onAction={handleAction}
              onAutoComplete={handleAutoComplete}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Flag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
            <p className="text-sm text-muted-foreground">
              {role === "tutor" ? "Manage your student sessions" : "Track your tutoring sessions"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-4 w-full sm:w-auto">
              <TabsTrigger value="active" className="flex-1 sm:flex-none">
                Active
                {active.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {active.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1 sm:flex-none">
                Completed
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1 sm:flex-none">
                Cancelled
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">{renderList(active)}</TabsContent>
            <TabsContent value="completed">{renderList(completed)}</TabsContent>
            <TabsContent value="cancelled">{renderList(cancelled)}</TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
