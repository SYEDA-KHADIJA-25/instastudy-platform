import { AppLayout } from "@/components/layout/app-layout";
import {
  useGetAdminStats,
  useListAllBookings,
  useListTutors,
  useListAdminApplications,
  useApproveApplication,
  useRejectApplication,
  useDeleteTutor,
} from "@/hooks/use-firestore";
import {
  Shield,
  GraduationCap,
  Clock,
  CalendarDays,
  Users,
  CheckCircle2,
  XCircle,
  BookOpen,
  DollarSign,
  Loader2,
  AlertTriangle,
  Trash2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

function AppStatusBadge({ status }: { status: string }) {
  if (status === "approved") return (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-xs">
      <CheckCircle2 className="h-3 w-3 mr-1" />Approved
    </Badge>
  );
  if (status === "rejected") return (
    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 text-xs">
      <XCircle className="h-3 w-3 mr-1" />Rejected
    </Badge>
  );
  return (
    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-xs">
      <Clock className="h-3 w-3 mr-1" />Pending
    </Badge>
  );
}

type AppTab = "pending" | "approved" | "rejected";

export default function AdminPage() {
  const [appTab, setAppTab] = useState<AppTab>("pending");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: allBookings } = useListAllBookings();
  const { data: tutors } = useListTutors({});
  const { data: applications, isLoading: appsLoading } = useListAdminApplications(appTab);

  const approveMutation = useApproveApplication();
  const rejectMutation  = useRejectApplication();
  const deleteMutation  = useDeleteTutor();

  const approve = async (uid: string) => {
    try {
      await approveMutation.mutateAsync(uid);
      toast({ title: "Application approved" });
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    }
  };

  const reject = async (uid: string) => {
    try {
      await rejectMutation.mutateAsync(uid);
      toast({ title: "Application rejected" });
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ title: "Tutor removed" });
    } catch {
      toast({ title: "Failed to remove tutor", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? "—",
      icon: Users,
      gradient: "from-[#5B6FD4] to-[#4558b8]",
      glow: "shadow-[#5B6FD4]/30",
    },
    {
      label: "Active Tutors",
      value: tutors?.length ?? stats?.activeTutors ?? "—",
      icon: GraduationCap,
      gradient: "from-[#7B8FE8] to-[#5B6FD4]",
      glow: "shadow-[#7B8FE8]/30",
    },
    {
      label: "Pending Review",
      value: stats?.pendingApplications ?? "—",
      icon: Clock,
      gradient: "from-[#EDBA96] to-[#d9935a]",
      glow: "shadow-[#EDBA96]/40",
    },
    {
      label: "Total Bookings",
      value: allBookings?.length ?? "—",
      icon: CalendarDays,
      gradient: "from-[#1e2d87] to-[#5B6FD4]",
      glow: "shadow-[#1e2d87]/30",
    },
  ];

  const appTabs: { key: AppTab; label: string; count?: number }[] = [
    { key: "pending",  label: "Pending",  count: stats?.pendingApplications },
    { key: "approved", label: "Approved", count: stats?.activeTutors },
    { key: "rejected", label: "Rejected", count: stats?.rejectedApplications },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
            <p className="text-sm text-muted-foreground">Platform summary at a glance</p>
          </div>
        </div>

        {/* Glass stat cards */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.gradient} p-3 shadow-md ${card.glow} text-white`}
              >
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] rounded-xl" />
                {/* Decorative circles */}
                <div className="absolute -top-3 -right-3 h-14 w-14 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-2 h-10 w-10 rounded-full bg-white/10" />

                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-black tracking-tight leading-none">
                      {statsLoading
                        ? <span className="inline-block h-5 w-6 animate-pulse rounded bg-white/30" />
                        : card.value}
                    </div>
                    <div className="mt-0.5 text-[10px] font-medium text-white/80 leading-tight">{card.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Applications section */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground text-sm">Tutor Applications</h2>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex border-b border-border bg-muted/20">
            {appTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setAppTab(tab.key)}
                className={[
                  "flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors",
                  appTab === tab.key
                    ? "border-b-2 border-primary text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                ].join(" ")}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={[
                    "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                    appTab === tab.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  ].join(" ")}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Application list */}
          <div className="divide-y divide-border">
            {appsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !applications || applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {appTab === "pending" ? <Clock className="h-5 w-5 text-muted-foreground" />
                    : appTab === "approved" ? <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    : <XCircle className="h-5 w-5 text-muted-foreground" />}
                </div>
                <p className="text-sm font-medium text-foreground">No {appTab} applications</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {appTab === "pending" ? "All caught up." : `No ${appTab} applications yet.`}
                </p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm">
                      {app?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-semibold text-foreground text-sm">{app.name}</span>
                        <AppStatusBadge status={app.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
                      {app.bio && <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">{app.bio}</p>}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {app.subjects.slice(0, 3).map((s) => (
                          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            <BookOpen className="h-2.5 w-2.5" />{s}
                          </span>
                        ))}
                        {app.subjects.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{app.subjects.length - 3}</span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Rs {app.hourlyRate}/hr</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(app.createdAt).toLocaleDateString()}</span>
                        {app.cvUrl && (
                          <a
                            href={app.cvUrl}
                            download={app.cvFileName ?? "cv"}
                            className="flex items-center gap-1 text-primary hover:underline font-medium"
                          >
                            <FileText className="h-3 w-3" />
                            View CV
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
                    {appTab === "pending" && (
                      <>
                        <Button size="sm" className="gap-1 text-xs bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                          onClick={() => void approve(app.id)} disabled={approveMutation.isPending || rejectMutation.isPending}>
                          {approveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => void reject(app.id)} disabled={approveMutation.isPending || rejectMutation.isPending}>
                          {rejectMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                          Reject
                        </Button>
                      </>
                    )}
                    {appTab !== "pending" && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                        onClick={() => setDeleteTarget({ id: app.id, name: app.name })} disabled={deleteMutation.isPending}>
                        <Trash2 className="h-3 w-3" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Remove confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />Remove tutor
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong> and reset their account to a regular user. This cannot be undone.
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
