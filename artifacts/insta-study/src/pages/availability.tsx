import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetMyTutorProfile,
  useGetTutorAvailability,
  useCreateAvailabilitySlot,
  useDeleteAvailabilitySlot,
  getGetTutorAvailabilityQueryKey,
  getGetMyTutorProfileQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Plus, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

export default function AvailabilityPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: myProfile, isLoading: profileLoading } = useGetMyTutorProfile({
    query: { retry: false, queryKey: getGetMyTutorProfileQueryKey() },
  });

  const { data: slots, isLoading: slotsLoading } = useGetTutorAvailability(
    myProfile?.id ?? 0,
    { query: { enabled: !!myProfile?.id, queryKey: getGetTutorAvailabilityQueryKey(myProfile?.id ?? 0) } }
  );

  const createMutation = useCreateAvailabilitySlot({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTutorAvailabilityQueryKey(myProfile?.id ?? 0) });
        toast({ title: "Slot added" });
        setStartDate(""); setStartTime(""); setEndTime("");
      },
      onError: () => {
        toast({ title: "Failed to add slot", variant: "destructive" });
      },
    },
  });

  const deleteMutation = useDeleteAvailabilitySlot({
    mutation: {
      onSuccess: (_, vars) => {
        queryClient.invalidateQueries({ queryKey: getGetTutorAvailabilityQueryKey(myProfile?.id ?? 0) });
        toast({ title: "Slot removed" });
        setDeletingId(null);
      },
    },
  });

  const handleAdd = () => {
    if (!startDate || !startTime || !endTime || !myProfile) return;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${startDate}T${endTime}`);
    if (end <= start) {
      toast({ title: "End time must be after start time", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      tutorId: myProfile.id,
      data: { startTime: start.toISOString(), endTime: end.toISOString() },
    });
  };

  const handleDelete = (slotId: number) => {
    if (!myProfile) return;
    setDeletingId(slotId);
    deleteMutation.mutate({ tutorId: myProfile.id, slotId });
  };

  const upcomingSlots = slots?.filter((s) => new Date(s.startTime) > new Date()) || [];
  const pastSlots = slots?.filter((s) => new Date(s.startTime) <= new Date()) || [];

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Manage availability</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add or remove the time slots students can book</p>
        </div>

        {profileLoading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : !myProfile || myProfile.status !== "approved" ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">
                  {!myProfile ? "You are not a tutor yet" : "Tutor application pending"}
                </p>
                <p className="mt-0.5 text-sm text-amber-700">
                  {!myProfile
                    ? "Apply to become a tutor to manage availability."
                    : "Once approved, you can manage availability."}
                </p>
                {!myProfile && (
                  <Link href="/become-tutor">
                    <Button size="sm" className="mt-3">Apply now</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Add slot form */}
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plus className="h-4 w-4 text-primary" /> Add a time slot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      data-testid="input-date"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Start time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      data-testid="input-start-time"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">End time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      data-testid="input-end-time"
                    />
                  </div>
                </div>
                <Button
                  className="mt-4 gap-2"
                  onClick={handleAdd}
                  disabled={!startDate || !startTime || !endTime || createMutation.isPending}
                  data-testid="button-add-slot"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add slot
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming slots */}
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-primary" /> Upcoming slots
                  {upcomingSlots.length > 0 && (
                    <span className="ml-auto text-xs font-normal text-muted-foreground">{upcomingSlots.length} slot{upcomingSlots.length !== 1 ? "s" : ""}</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {slotsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                  </div>
                ) : upcomingSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No upcoming slots. Add one above.</p>
                ) : (
                  <AnimatePresence>
                    <div className="space-y-2">
                      {upcomingSlots.map((slot) => (
                        <motion.div
                          key={slot.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-3 rounded-lg border border-border p-3"
                          data-testid={`slot-row-${slot.id}`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{format(new Date(slot.startTime), "EEEE, MMMM d")}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(slot.startTime), "h:mm a")} – {format(new Date(slot.endTime), "h:mm a")}
                              {slot.isBooked && <span className="ml-2 text-amber-600 font-medium">Booked</span>}
                            </p>
                          </div>
                          {!slot.isBooked && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(slot.id)}
                              disabled={deletingId === slot.id}
                              data-testid={`button-delete-slot-${slot.id}`}
                            >
                              {deletingId === slot.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
