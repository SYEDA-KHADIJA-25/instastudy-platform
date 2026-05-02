import { Link } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDashboard, useGetFeaturedTutors } from "@workspace/api-client-react";
import { Search, GraduationCap, BookOpen, Star, Clock, AlertCircle, CheckCircle, ChevronRight } from "lucide-react";
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
  const { data: dashboard, isLoading } = useGetDashboard();

  const isTutor = user?.isTutor && user?.tutorStatus === "approved";
  const hasPendingApplication = user?.tutorStatus === "pending";

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
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
            <span className="text-primary">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {isTutor ? "You can book sessions and manage your tutoring." : "Ready to learn something new today?"}
          </p>
        </motion.div>

        {/* Tutor application banner */}
        {hasPendingApplication && (
          <motion.div
            className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Tutor application pending review</p>
              <p className="text-sm text-amber-700">We'll notify you once your application is approved.</p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        {isLoading ? (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : dashboard && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Total Bookings", value: dashboard.stats.totalBookings, icon: BookOpen, color: "text-primary" },
              { label: "Completed", value: dashboard.stats.completedSessions, icon: CheckCircle, color: "text-green-600" },
              { label: "Pending", value: dashboard.stats.pendingBookings, icon: Clock, color: "text-amber-600" },
              ...(isTutor ? [{ label: "Earnings", value: `$${dashboard.stats.totalEarnings.toFixed(0)}`, icon: Star, color: "text-secondary" }] : []),
            ].slice(0, 4).map((stat) => (
              <Card key={stat.label} className="border-card-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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

          {!isTutor && !hasPendingApplication && (
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
          )}

          {isTutor && (
            <Link href="/bookings">
              <Card className="group cursor-pointer border-card-border hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-secondary/5 to-transparent">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 group-hover:bg-secondary/15 transition-colors">
                    <BookOpen className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Session requests</p>
                    <p className="text-sm text-muted-foreground">
                      {dashboard?.pendingRequests?.length ?? 0} pending
                    </p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                </CardContent>
              </Card>
            </Link>
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
                    <div
                      key={booking.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                      data-testid={`booking-item-${booking.id}`}
                    >
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
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors cursor-pointer" data-testid={`suggested-tutor-${tutor.id}`}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-bold">
                          {tutor.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{tutor.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{tutor.subjects.slice(0, 2).join(", ")}</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-sm font-semibold text-primary">${tutor.hourlyRate}/hr</span>
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
