import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useListTutors, useGetTutorAvailability, useDeleteTutor } from "@/hooks/use-firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  GraduationCap,
  Clock,
  DollarSign,
  Loader2,
  AlertTriangle,
  Trash2,
  Search,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { TutorProfile } from "@/lib/types";

function TutorRow({
  tutor,
  onRemove,
  removing,
}: {
  tutor: TutorProfile;
  onRemove: () => void;
  removing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: slots, isLoading: slotsLoading } = useGetTutorAvailability(expanded ? tutor.id : "");

  const upcomingSlots = slots?.filter((s) => new Date(s.startTime) > new Date()) ?? [];
  const bookedSlots   = slots?.filter((s) => s.isBooked) ?? [];

  return (
    <div className="border-b border-border last:border-0">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm">
            {tutor.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground truncate">{tutor.name}</p>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {tutor.rating != null && (
                <span className="flex items-center gap-0.5 text-xs text-amber-600">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {tutor.rating.toFixed(1)} ({tutor.reviewCount})
                </span>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />Rs {tutor.hourlyRate}/hr
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {tutor.subjects.slice(0, 4).map((s) => (
                <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">{s}</span>
              ))}
              {tutor.subjects.length > 4 && (
                <span className="text-xs text-muted-foreground">+{tutor.subjects.length - 4} more</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="ghost" className="gap-1 text-xs text-muted-foreground"
            onClick={() => setExpanded((v) => !v)}>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Availability
          </Button>
          <Button size="sm" variant="outline"
            className="gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
            onClick={onRemove} disabled={removing}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 bg-muted/30">
          {slotsLoading ? (
            <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading slots…
            </div>
          ) : !slots || slots.length === 0 ? (
            <p className="py-3 text-xs text-muted-foreground">No availability slots added yet.</p>
          ) : (
            <div className="pt-2 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {upcomingSlots.length} upcoming · {bookedSlots.length} booked
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {slots.slice(0, 12).map((slot) => (
                  <div key={slot.id} className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
                    slot.isBooked
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-border bg-background text-foreground"
                  )}>
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{format(new Date(slot.startTime), "MMM d, h:mm a")}</span>
                    {slot.isBooked && <span className="ml-auto font-medium">Booked</span>}
                  </div>
                ))}
                {slots.length > 12 && (
                  <p className="text-xs text-muted-foreground col-span-full pt-1">+{slots.length - 12} more slots</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminTutorsPage() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const { data: tutors, isLoading } = useListTutors({});
  const deleteMutation = useDeleteTutor();

  const filtered = (tutors ?? []).filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.subjects.some((s) => s.toLowerCase().includes(q));
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ title: "Tutor removed", description: `${deleteTarget.name} has been removed from the platform.` });
    } catch {
      toast({ title: "Failed to remove tutor", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <GraduationCap className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Active Tutors</h1>
            <p className="text-sm text-muted-foreground">
              {tutors ? `${tutors.length} approved tutor${tutors.length !== 1 ? "s" : ""} on the platform` : "Manage active tutors and their availability"}
            </p>
          </div>
        </div>

        {/* Search + list */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or subject…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <GraduationCap className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">No tutors found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search term</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((tutor) => (
                <TutorRow
                  key={tutor.id}
                  tutor={tutor}
                  onRemove={() => setDeleteTarget({ id: tutor.id, name: tutor.name })}
                  removing={deleteMutation.isPending && deleteTarget?.id === tutor.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />Remove tutor
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong> from the platform and reset their account to a regular user. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
              onClick={() => void confirmDelete()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Remove tutor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
