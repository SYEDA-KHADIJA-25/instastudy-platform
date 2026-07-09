import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDashboard } from "@/hooks/use-firestore";
import { Search, GraduationCap, BookOpen, Star, Clock, CheckCircle, ChevronRight, DollarSign, Calendar } from "lucide-react";
import { studentPrice, fmt } from "@/lib/commission";
import { motion } from "framer-motion";
import { format } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${variants[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const isTutorHub = location === "/tutor";

  const { data: dashboard, isLoading } = useGetDashboard(user?.uid, !!user?.isTutor);

  const isTutor = !!user?.isTutor;
  const isPending = user?.tutorStatus === "pending";
  const hasPendingRequests = (dashboard?.pendingRequests?.length ?? 0) > 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!user) return;
    if (location !== "/dashboard") return;
    if (user.role === "admin") {
      setLocation("/admin");
      return;
    }
    if (user.isTutor && user.role === "tutor") {
      setLocation("/tutor");
    }
  }, [user, location, setLocation]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl">
        {/* Welcome */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">
            {isTutorHub ? "Tutor hub" : greeting},{" "}
            <span className="text-primary">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {isTutorHub
              ? "Your teaching dashboard — sessions, requests, and availability."
              : isTutor
              ? "You're an approved tutor. Manage your sessions and availability below."
              : isPending
              ? "Your tutor application is under review."
              : "Ready to learn something new today?"}
          </p>
        </motion.div>

        {/* Tutor application pending banner */}
        {isPending && (
          <motion.div
            className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Tutor application pending review</p>
              <p className="text-sm text-amber-700">We'll notify you once your application has been approved.</p>
            </div>
          </motion.div>
        )}

        {/* Pending tutor requests banner */}
        {isTutor && hasPendingRequests && (
          <motion.div
            className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {dashboard?.pendingRequests?.length} new session request{dashboard?.pendingRequests?.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-blue-700">Students are waiting for your response.</p>
              </div>
            </div>
            <Link href="/bookings">
              <Button size="sm" variant="outline" className="shrink-0 border-blue-200 text-blue-700 hover:bg-blue-100">
                Review <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Stats — glass gradient cards */}
        {isLoading ? (
          <div className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : dashboard ? (() => {
          type StatItem = { label: string; value: string | number; icon: React.ElementType; gradient: string; glow: string };
          const stats: StatItem[] = isTutor ? [
            { label: "Total Bookings",   value: dashboard.stats.totalBookings,                  icon: BookOpen,    gradient: "from-[#5B6FD4] to-[#4558b8]", glow: "shadow-[#5B6FD4]/30" },
            { label: "Sessions Taught",  value: dashboard.stats.completedSessions,              icon: CheckCircle, gradient: "from-[#7B8FE8] to-[#5B6FD4]", glow: "shadow-[#7B8FE8]/30" },
            { label: "Pending Requests", value: dashboard.pendingRequests?.length ?? 0,         icon: Clock,       gradient: "from-[#EDBA96] to-[#d9935a]", glow: "shadow-[#EDBA96]/40" },
            { label: "Est. Earnings",    value: `Rs ${Math.round(dashboard.stats.totalEarnings)}`, icon: DollarSign,  gradient: "from-[#1e2d87] to-[#5B6FD4]", glow: "shadow-[#1e2d87]/30" },
          ] : [
            { label: "Total Bookings",   value: dashboard.stats.totalBookings,          icon: BookOpen,    gradient: "from-[#5B6FD4] to-[#4558b8]", glow: "shadow-[#5B6FD4]/30" },
            { label: "Completed",        value: dashboard.stats.completedSessions,      icon: CheckCircle, gradient: "from-[#7B8FE8] to-[#5B6FD4]", glow: "shadow-[#7B8FE8]/30" },
            { label: "Pending",          value: dashboard.stats.pendingBookings,        icon: Clock,       gradient: "from-[#EDBA96] to-[#d9935a]", glow: "shadow-[#EDBA96]/40" },
            { label: "Tutors Available", value: dashboard.suggestedTutors?.length ?? 0, icon: Star,        gradient: "from-[#1e2d87] to-[#5B6FD4]", glow: "shadow-[#1e2d87]/30" },
          ];
          return (
            <div className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-md ${stat.glow} text-white`}
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] rounded-xl" />
                    <div className="absolute -top-3 -right-3 h-14 w-14 rounded-full bg-white/10" />
                    <div className="absolute -bottom-4 -left-2 h-10 w-10 rounded-full bg-white/10" />
                    <div className="relative z-10 flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20">
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div>
                        <div className="text-xl font-black tracking-tight leading-none">{stat.value}</div>
                        <div className="mt-0.5 text-[10px] font-medium text-white/80 leading-tight">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })() : null}

        {/* Quick actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Link href="/tutors">
            <Card className="group cursor-pointer border-card-border hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Find a tutor</p>
                  <p className="text-sm text-muted-foreground">Browse experts by subject</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>

          {isTutor ? (
            <Link href="/bookings?tab=tutor">
              <Card className="group cursor-pointer border-card-border hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-secondary/5 to-transparent">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 group-hover:bg-secondary/15 transition-colors">
                    <BookOpen className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Session requests</p>
                    <p className="text-sm text-muted-foreground">
                      {hasPendingRequests
                        ? `${dashboard?.pendingRequests?.length} pending approval`
                        : "No pending requests"}
                    </p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ) : !isPending ? (
            <Link href="/become-tutor">
              <Card className="group cursor-pointer border-card-border hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-secondary/5 to-transparent">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 group-hover:bg-secondary/15 transition-colors">
                    <GraduationCap className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Become a tutor</p>
                    <p className="text-sm text-muted-foreground">Share your knowledge, earn money</p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card className="border-card-border bg-amber-50/50 border-amber-200/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Application pending</p>
                  <p className="text-sm text-muted-foreground">Under review by our team</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming bookings */}
          <Card className="border-card-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Upcoming sessions</CardTitle>
                <Link href="/bookings">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    View all <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : dashboard?.upcomingBookings?.length ? (
                <div className="space-y-3">
                  {dashboard.upcomingBookings.slice(0, 4).map((booking: any) => (
                    <div key={booking.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {booking.tutor?.name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{booking.tutor?.name || "Unknown tutor"}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.slot ? format(new Date(booking.slot.startTime), "MMM d, h:mm a") : "Time TBD"}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <BookOpen className="mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No upcoming sessions</p>
                  <Link href="/tutors" className="mt-2">
                    <Button variant="link" size="sm" className="text-primary">Find a tutor</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggested tutors */}
          <Card className="border-card-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Suggested tutors</CardTitle>
                <Link href="/tutors">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    Browse all <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : dashboard?.suggestedTutors?.length ? (
                <div className="space-y-3">
                  {dashboard.suggestedTutors.slice(0, 4).map((tutor: any) => (
                    <Link key={tutor.id} href={`/tutors/${tutor.id}`}>
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-bold">
                          {tutor?.name?.charAt(0) || "T"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{tutor.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{tutor.subjects.slice(0, 2).join(", ")}</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-sm font-semibold text-primary">{fmt(studentPrice(tutor.hourlyRate))}/hr</span>
                          {tutor.rating && (
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs text-muted-foreground">{tutor.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <Search className="mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No tutors available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
