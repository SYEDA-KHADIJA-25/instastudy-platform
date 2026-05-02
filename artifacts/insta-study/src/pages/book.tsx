import { useParams, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useGetTutor,
  useGetTutorAvailability,
  useCreateBooking,
  getListMyBookingsQueryKey,
  getGetDashboardQueryKey,
  getGetTutorQueryKey,
  getGetTutorAvailabilityQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, ChevronLeft, CheckCircle, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { motion } from "framer-motion";

export default function BookPage() {
  const params = useParams<{ tutorId: string }>();
  const tutorId = parseInt(params.tutorId || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");

  const { data: tutor, isLoading: tutorLoading } = useGetTutor(tutorId, {
    query: { enabled: !!tutorId, queryKey: getGetTutorQueryKey(tutorId) },
  });

  const { data: availability, isLoading: slotsLoading } = useGetTutorAvailability(tutorId, {
    query: { enabled: !!tutorId, queryKey: getGetTutorAvailabilityQueryKey(tutorId) },
  });

  const availableSlots = availability?.filter((s) => !s.isBooked) || [];

  const createMutation = useCreateBooking({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMyBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        toast({ title: "Booking confirmed!", description: "Your session request has been sent." });
        setLocation("/bookings");
      },
      onError: async (error: any) => {
        let message = "Failed to create booking";
        try {
          const body = await error.json();
          message = body.error || message;
        } catch {}
        toast({ title: "Booking failed", description: message, variant: "destructive" });
      },
    },
  });

  const handleBook = () => {
    if (!selectedSlotId) return;
    createMutation.mutate({
      data: {
        tutorId,
        slotId: selectedSlotId,
        subject: subject || undefined,
        notes: notes || undefined,
      },
    });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => history.back()}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-foreground">Book a session</h1>

        {tutorLoading ? (
          <Skeleton className="h-24 rounded-xl mb-4" />
        ) : tutor ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Tutor summary */}
            <Card className="border-card-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                  {tutor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-foreground">{tutor.name}</h2>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {tutor.subjects.slice(0, 3).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs rounded-full">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <DollarSign className="h-4 w-4" />
                  {tutor.hourlyRate}/hr
                </div>
              </CardContent>
            </Card>

            {/* Select slot */}
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-primary" /> Select a time slot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {slotsLoading ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No available slots. Check back later.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                          selectedSlotId === slot.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedSlotId(slot.id)}
                        data-testid={`slot-option-${slot.id}`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${selectedSlotId === slot.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          {selectedSlotId === slot.id ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{format(new Date(slot.startTime), "EEE, MMM d")}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(slot.startTime), "h:mm a")} – {format(new Date(slot.endTime), "h:mm a")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subject & notes */}
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="text-base">Session details (optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Subject / topic</label>
                  <Input
                    placeholder="e.g. Calculus - integration by parts"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1"
                    data-testid="input-subject"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Notes for the tutor</label>
                  <Textarea
                    placeholder="Any specific questions or learning goals..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                    rows={3}
                    data-testid="input-notes"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Confirm */}
            <Button
              className="w-full gap-2 shadow-sm shadow-primary/20"
              size="lg"
              disabled={!selectedSlotId || createMutation.isPending}
              onClick={handleBook}
              data-testid="button-confirm-booking"
            >
              {createMutation.isPending ? "Booking..." : "Confirm booking request"}
            </Button>
          </motion.div>
        ) : (
          <p className="text-muted-foreground">Tutor not found.</p>
        )}
      </div>
    </AppLayout>
  );
}
