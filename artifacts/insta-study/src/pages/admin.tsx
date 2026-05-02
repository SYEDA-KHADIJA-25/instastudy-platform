import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useGetAdminStats,
  useListAdminApplications,
  useApproveApplication,
  useRejectApplication,
  getGetAdminStatsQueryKey,
  getListAdminApplicationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  Clock,
  XCircle,
  CheckCircle2,
  BookOpen,
  DollarSign,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type TabStatus = "pending" | "approved" | "rejected";

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabStatus>("pending");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() },
  });

  const { data: applications, isLoading: appsLoading } = useListAdminApplications(
    { status: activeTab },
    { query: { queryKey: getListAdminApplicationsQueryKey({ status: activeTab }) } }
  );

  const approveMutation = useApproveApplication({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
        toast({ title: "Application approved", description: "The tutor is now active on the platform." });
      },
      onError: () => {
        toast({ title: "Failed to approve", variant: "destructive" });
      },
    },
  });

  const rejectMutation = useRejectApplication({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
        toast({ title: "Application rejected", description: "The applicant has been notified." });
      },
      onError: () => {
        toast({ title: "Failed to reject", variant: "destructive" });
      },
    },
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    setLocation("/dashboard");
    return null;
  }

  const tabs: { key: TabStatus; label: string; count?: number }[] = [
    { key: "pending", label: "Pending", count: stats?.pendingApplications },
    { key: "approved", label: "Approved", count: stats?.activeTutors },
    { key: "rejected", label: "Rejected", count: stats?.rejectedApplications },
  ];

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? "—",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Tutors",
      value: stats?.activeTutors ?? "—",
      icon: GraduationCap,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending Review",
      value: stats?.pendingApplications ?? "—",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Rejected",
      value: stats?.rejectedApplications ?? "—",
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
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
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Review and manage tutor applications</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", card.bg)}>
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {statsLoading ? (
                    <span className="inline-block h-7 w-10 animate-pulse rounded bg-muted" />
                  ) : (
                    card.value
                  )}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{card.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tab Bar */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "border-b-2 border-primary text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                      activeTab === tab.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Application List */}
          <div className="divide-y divide-border">
            {appsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : !applications || applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  {activeTab === "pending" ? (
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  ) : activeTab === "approved" ? (
                    <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <XCircle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <p className="font-medium text-foreground">
                  No {activeTab} applications
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeTab === "pending"
                    ? "All caught up — no applications waiting for review."
                    : `No ${activeTab} applications yet.`}
                </p>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start"
                >
                  {/* Avatar + name */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-lg font-bold">
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-semibold text-foreground">{app.name}</span>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">{app.email}</p>

                      {app.bio && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{app.bio}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {app.subjects.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          >
                            <BookOpen className="h-3 w-3" />
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {app.experience && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {app.experience}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          ${app.hourlyRate}/hr
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {activeTab === "pending" && (
                    <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
                      <Button
                        size="sm"
                        className="gap-1.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                        onClick={() => approveMutation.mutate({ tutorId: app.id })}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        {approveMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
                        onClick={() => rejectMutation.mutate({ tutorId: app.id })}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-xs">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Approved
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 text-xs">
        <XCircle className="h-3 w-3 mr-1" />
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-xs">
      <Clock className="h-3 w-3 mr-1" />
      Pending
    </Badge>
  );
}
