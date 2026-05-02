import { useLocation, useParams } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTutor, useGetMyTutorProfile, useGetTutorAvailability, useUpdateMyTutorProfile, getGetMyTutorProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Star, Clock, DollarSign, BookOpen, Calendar, ChevronLeft, Edit3 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <AppLayout>{children}</AppLayout>;
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-16 px-6 py-8 mx-auto max-w-4xl">{children}</div>
    </div>
  );
}

export default function TutorProfilePage() {
  const params = useParams<{ tutorId: string }>();
  const tutorId = parseInt(params.tutorId || "0", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [editing, setEditing] = useState(false);
  const [editRate, setEditRate] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editExperience, setEditExperience] = useState("");

  const { data: tutor, isLoading } = useGetTutor(tutorId, {
    query: { enabled: !!tutorId },
  });

  const { data: myTutorProfile } = useGetMyTutorProfile({
    query: { enabled: !!user, retry: 0 },
  });

  const { data: availability } = useGetTutorAvailability(tutorId, {
    query: { enabled: !!tutorId },
  });

  const updateMutation = useUpdateMyTutorProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyTutorProfileQueryKey() });
        toast({ title: "Profile updated" });
        setEditing(false);
      },
    },
  });

  const isOwner = myTutorProfile?.id === tutorId;
  const availableSlots = availability?.filter((s) => !s.isBooked) || [];

  const startEdit = () => {
    setEditRate(tutor?.hourlyRate?.toString() || "");
    setEditBio(tutor?.bio || "");
    setEditExperience(tutor?.experience || "");
    setEditing(true);
  };

  const saveEdit = () => {
    updateMutation.mutate({
      data: {
        hourlyRate: editRate ? parseFloat(editRate) : undefined,
        bio: editBio || undefined,
        experience: editExperience || undefined,
      },
    });
  };

  const Layout = user ? AppLayout : ({ children }: any) => (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-16 px-6 py-8 mx-auto max-w-4xl">{children}</div>
    </div>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => history.back()}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : tutor ? (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Profile header */}
            <Card className="border-card-border overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/20 via-secondary/15 to-primary/10" />
              <CardContent className="relative px-6 pb-6 pt-0">
                <div className="-mt-10 mb-4 flex items-end justify-between">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold shadow-lg border-4 border-background">
                    {tutor.name.charAt(0)}
                  </div>
                  <div className="flex gap-2 pb-1">
                    {isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={startEdit}
                        data-testid="button-edit-profile"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit profile
                      </Button>
                    )}
                    {!isOwner && user && availableSlots.length > 0 && (
                      <Link href={`/book/${tutor.id}`}>
                        <Button size="sm" className="gap-1.5 shadow-sm shadow-primary/20" data-testid="button-book-session">
                          <Calendar className="h-3.5 w-3.5" /> Book a session
                        </Button>
                      </Link>
                    )}
                    {!user && (
                      <Link href="/register">
                        <Button size="sm" className="shadow-sm shadow-primary/20">
                          Sign up to book
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Hourly rate ($)</label>
                      <Input
                        type="number"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        className="mt-1"
                        data-testid="input-edit-rate"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Bio</label>
                      <Textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="mt-1"
                        rows={3}
                        data-testid="input-edit-bio"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Experience</label>
                      <Input
                        value={editExperience}
                        onChange={(e) => setEditExperience(e.target.value)}
                        className="mt-1"
                        data-testid="input-edit-experience"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending} data-testid="button-save-profile">
                        Save changes
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-foreground">{tutor.name}</h1>
                    {tutor.bio && <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{tutor.bio}</p>}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-semibold">${tutor.hourlyRate}/hr</span>
                      </div>
                      {tutor.rating && (
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{tutor.rating.toFixed(1)} ({tutor.reviewCount} reviews)</span>
                        </div>
                      )}
                      {tutor.experience && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>{tutor.experience}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {tutor.subjects.map((s) => (
                        <Badge key={s} variant="secondary" className="rounded-full">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            {!isOwner && (
              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-primary" /> Available slots
                    {availableSlots.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">{availableSlots.length} open</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No available slots at the moment.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {availableSlots.slice(0, 6).map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"
                          data-testid={`slot-${slot.id}`}
                        >
                          <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{format(new Date(slot.startTime), "MMM d")}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(slot.startTime), "h:mm a")} – {format(new Date(slot.endTime), "h:mm a")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {user && availableSlots.length > 0 && (
                    <Link href={`/book/${tutor.id}`}>
                      <Button className="mt-4 gap-1.5 shadow-sm shadow-primary/20" data-testid="button-book-now">
                        <Calendar className="h-4 w-4" /> Book a session
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Owner: manage availability link */}
            {isOwner && (
              <Card className="border-card-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Manage availability</p>
                      <p className="text-sm text-muted-foreground">Add or remove your available time slots</p>
                    </div>
                    <Link href="/availability">
                      <Button variant="outline" size="sm" data-testid="button-manage-availability">
                        Manage slots
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-muted-foreground">Tutor not found.</p>
            <Link href="/tutors">
              <Button variant="link" className="mt-2">Browse tutors</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
