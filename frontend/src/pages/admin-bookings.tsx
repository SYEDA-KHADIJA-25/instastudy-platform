import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useListAllBookings } from "@/hooks/use-firestore";
import { Input } from "@/components/ui/input";
import { CalendarDays, Loader2, Search } from "lucide-react";
import { format } from "date-fns";

function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:   "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    rejected:  "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("");
  const { data: allBookings, isLoading } = useListAllBookings();

  const filtered = (allBookings ?? []).filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (b.student?.name ?? "").toLowerCase().includes(q) ||
      (b.tutor?.name  ?? "").toLowerCase().includes(q) ||
      (b.subject       ?? "").toLowerCase().includes(q) ||
      b.status.toLowerCase().includes(q)
    );
  });

  // Group by status for summary counts
  const counts = (allBookings ?? []).reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
            <CalendarDays className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Bookings</h1>
            <p className="text-sm text-muted-foreground">
              {allBookings ? `${allBookings.length} total booking${allBookings.length !== 1 ? "s" : ""} across the platform` : "Platform-wide booking history"}
            </p>
          </div>
        </div>

        {/* Summary pills */}
        {allBookings && allBookings.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {[
              { key: "pending",   label: "Pending",   cls: "bg-amber-100 text-amber-700 border-amber-200" },
              { key: "confirmed", label: "Confirmed", cls: "bg-blue-100 text-blue-700 border-blue-200" },
              { key: "completed", label: "Completed", cls: "bg-green-100 text-green-700 border-green-200" },
              { key: "cancelled", label: "Cancelled", cls: "bg-red-100 text-red-700 border-red-200" },
              { key: "rejected",  label: "Rejected",  cls: "bg-red-100 text-red-700 border-red-200" },
            ].filter((s) => counts[s.key]).map((s) => (
              <span key={s.key} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${s.cls}`}>
                {s.label} <span className="font-bold">{counts[s.key]}</span>
              </span>
            ))}
          </div>
        )}

        {/* Search + table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student, tutor, subject or status…"
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
              <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">No bookings found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search term</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 px-5 py-2.5 bg-muted/40 border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Student</span>
                <span>Tutor</span>
                <span>Subject</span>
                <span>Time</span>
                <span>Status</span>
              </div>

              <div className="divide-y divide-border">
                {filtered.map((b) => (
                  <div key={b.id} className="flex flex-col gap-2 p-4 sm:grid sm:grid-cols-[1fr_1fr_1fr_auto_auto] sm:items-center sm:gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground sm:hidden font-medium mb-0.5">Student</p>
                      <p className="text-sm font-medium text-foreground truncate">{b.student?.name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground sm:hidden font-medium mb-0.5">Tutor</p>
                      <p className="text-sm text-foreground truncate">{b.tutor?.name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground sm:hidden font-medium mb-0.5">Subject</p>
                      <p className="text-sm text-foreground truncate">{b.subject ?? <span className="text-muted-foreground">—</span>}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground sm:hidden font-medium mb-0.5">Time</p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {b.slot
                          ? format(new Date(b.slot.startTime), "MMM d, h:mm a")
                          : format(new Date(b.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <BookingStatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
