import { useParams, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGetTutor, useGetTutorAvailability } from "@/hooks/use-firestore";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/lib/api-client";
import {
  Calendar, Clock, ChevronLeft, CheckCircle,
  Plus, Minus, Info, CreditCard, Lock,
} from "lucide-react";
import { studentPrice, studentCommission, fmt } from "@/lib/commission";
import { format } from "date-fns";
import { useState } from "react";
import { motion } from "framer-motion";

export default function BookPage() {
  const params = useParams<{ tutorId: string }>();
  const tutorId = params.tutorId || "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const { data: tutor, isLoading: tutorLoading } = useGetTutor(tutorId);
  const { data: availability, isLoading: slotsLoading } = useGetTutorAvailability(tutorId);

  const availableSlots = availability?.filter((s) => !s.isBooked) || [];

  const toggleSlot = (slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const totalAmount = tutor
    ? selectedSlotIds.length * studentPrice(tutor.hourlyRate)
    : 0;

  const handlePay = async () => {
    if (!selectedSlotIds.length || !user || !tutor) return;
    setRedirecting(true);
    try {
      const { url } = await createCheckoutSession({
        tutorId,
        tutorName: tutor.name,
        slotIds: selectedSlotIds,
        amountPkr: totalAmount,
        subject: subject || undefined,
        notes: notes || undefined,
        studentName: user.name,
      });
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not start payment";
      toast({ title: "Payment error", description: msg, variant: "destructive" });
      setRedirecting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            onClick={() => history.back()}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-foreground">Book a session</h1>

        {tutorLoading ? (
          <Skeleton className="h-24 rounded-xl mb-4" />
        ) : tutor ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Tutor summary */}
            <Card className="border-card-border">
              <CardContent className="flex items-center gap-4 p-5">
                {tutor.avatarUrl ? (
                  <img
                    src={tutor.avatarUrl}
                    alt={tutor.name}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                    {tutor?.name?.charAt(0) || "T"}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-semibold text-foreground">{tutor.name}</h2>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {tutor.subjects.slice(0, 3).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs rounded-full">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    Rs {studentPrice(tutor.hourlyRate)}/hr
                  </p>
                  <p className="text-xs text-muted-foreground">incl. platform fee</p>
                </div>
              </CardContent>
            </Card>

            {/* Slot picker */}
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> Select time slots
                  </span>
                  {selectedSlotIds.length > 0 && (
                    <span className="text-xs font-normal text-primary bg-primary/10 rounded-full px-2.5 py-1">
                      {selectedSlotIds.length} slot{selectedSlotIds.length > 1 ? "s" : ""} selected
                    </span>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Each slot is 1 hour. You can select multiple.
                </p>
              </CardHeader>
              <CardContent>
                {slotsLoading ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No available slots. Check back later.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {availableSlots.map((slot) => {
                      const selected = selectedSlotIds.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                            selected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                          onClick={() => toggleSlot(slot.id)}
                          data-testid={`slot-option-${slot.id}`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                              selected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {selected ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {format(new Date(slot.startTime), "EEE, MMM d")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(slot.startTime), "h:mm a")} –{" "}
                              {format(new Date(slot.endTime), "h:mm a")}
                            </p>
                          </div>
                          <div
                            className={`shrink-0 rounded-full p-0.5 transition-colors ${
                              selected ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {selected ? (
                              <Minus className="h-3.5 w-3.5" />
                            ) : (
                              <Plus className="h-3.5 w-3.5" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Cost summary */}
                {selectedSlotIds.length > 0 && (
                  <div className="mt-4 rounded-lg bg-muted/50 border border-border px-4 py-3 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>
                        {selectedSlotIds.length} × tutor rate ({fmt(tutor.hourlyRate)}/hr)
                      </span>
                      <span>{fmt(selectedSlotIds.length * tutor.hourlyRate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Info className="h-3 w-3" /> Platform fee (~13%)
                      </span>
                      <span>
                        + {fmt(selectedSlotIds.length * studentCommission(tutor.hourlyRate))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-foreground border-t border-border pt-1.5 mt-1">
                      <span>Total charged</span>
                      <span className="text-primary">{fmt(totalAmount)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session details */}
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="text-base">
                  Session details{" "}
                  <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Subject / topic</label>
                  <Input
                    placeholder="e.g. Calculus — integration by parts"
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

            {/* Pay button */}
            <div className="space-y-2">
              <Button
                className="w-full gap-2 shadow-sm shadow-primary/20"
                size="lg"
                disabled={!selectedSlotIds.length || redirecting}
                onClick={() => void handlePay()}
                data-testid="button-confirm-booking"
              >
                {redirecting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Redirecting to payment…
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {selectedSlotIds.length > 0
                      ? `Pay ${fmt(totalAmount)} — Proceed to checkout`
                      : "Select a slot to continue"}
                  </>
                )}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secured by Stripe — your card details are never stored on our servers
              </p>
            </div>
          </motion.div>
        ) : (
          <p className="text-muted-foreground">Tutor not found.</p>
        )}
      </div>
    </AppLayout>
  );
}
