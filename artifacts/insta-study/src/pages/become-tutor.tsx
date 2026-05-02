import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useApplyTutor, useGetMyTutorProfile, getGetMyTutorProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Clock, CheckCircle, XCircle, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const schema = z.object({
  experience: z.string().min(5, "Please describe your experience"),
  hourlyRate: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Enter a valid hourly rate"),
  bio: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const COMMON_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "History", "Computer Science", "Spanish", "French", "Economics",
];

export default function BecomeTutorPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");

  const { data: myProfile, isLoading: profileLoading } = useGetMyTutorProfile({
    query: { retry: false, queryKey: getGetMyTutorProfileQueryKey() },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { experience: "", hourlyRate: "", bio: "" },
  });

  const applyMutation = useApplyTutor({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyTutorProfileQueryKey() });
        refreshUser();
        toast({ title: "Application submitted!", description: "We'll review your application and get back to you." });
      },
      onError: async (error: any) => {
        let message = "Application failed";
        try {
          const body = await error.json();
          message = body.error || message;
        } catch {}
        toast({ title: "Application failed", description: message, variant: "destructive" });
      },
    },
  });

  const addSubject = (sub: string) => {
    const trimmed = sub.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
    }
    setSubjectInput("");
  };

  const removeSubject = (sub: string) => {
    setSubjects(subjects.filter((s) => s !== sub));
  };

  const onSubmit = (data: FormData) => {
    if (subjects.length === 0) {
      toast({ title: "Please add at least one subject", variant: "destructive" });
      return;
    }
    applyMutation.mutate({
      data: {
        subjects,
        experience: data.experience,
        hourlyRate: parseFloat(data.hourlyRate),
        bio: data.bio || undefined,
      },
    });
  };

  const StatusCard = () => {
    if (!myProfile) return null;
    const config = {
      pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", title: "Application under review", desc: "Your application is being reviewed. We'll notify you once approved." },
      approved: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 border-green-200", title: "You are an approved tutor!", desc: "Your profile is live. Students can find and book sessions with you." },
      rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200", title: "Application not approved", desc: "Your application wasn't approved this time. Please contact support." },
    };
    const cfg = config[myProfile.status as keyof typeof config];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return (
      <Card className={`border ${cfg.bg}`}>
        <CardContent className="flex items-start gap-4 p-5">
          <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${cfg.color}`} />
          <div>
            <p className={`font-semibold ${cfg.color}`}>{cfg.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{cfg.desc}</p>
            {myProfile.status === "approved" && (
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>Subjects: {myProfile.subjects.join(", ")}</span>
                <span>· ${myProfile.hourlyRate}/hr</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Become a tutor</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Share your expertise and earn while helping others learn
            </p>
          </div>

          {profileLoading ? (
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
          ) : myProfile ? (
            <StatusCard />
          ) : (
            <div className="space-y-6">
              {/* Benefits */}
              <Card className="border-card-border bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-semibold text-foreground">Why become a tutor?</h2>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {["Set your own schedule and hourly rate", "Teach subjects you are passionate about", "Build your tutoring reputation over time"].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Application form */}
              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="text-base">Your application</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      {/* Subjects */}
                      <div>
                        <label className="text-sm font-medium text-foreground">Subjects you teach</label>
                        <div className="mt-2 flex flex-wrap gap-1.5 mb-2">
                          {subjects.map((s) => (
                            <Badge key={s} variant="secondary" className="gap-1 pr-1.5 rounded-full">
                              {s}
                              <button type="button" onClick={() => removeSubject(s)} className="ml-0.5">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a subject..."
                            value={subjectInput}
                            onChange={(e) => setSubjectInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(subjectInput); } }}
                            data-testid="input-subject"
                          />
                          <Button type="button" variant="outline" size="sm" onClick={() => addSubject(subjectInput)} className="shrink-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {COMMON_SUBJECTS.filter((s) => !subjects.includes(s)).slice(0, 5).map((s) => (
                            <button
                              key={s}
                              type="button"
                              className="text-xs px-2.5 py-1 rounded-full border border-border hover:bg-muted transition-colors"
                              onClick={() => addSubject(s)}
                            >
                              + {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your experience & qualifications</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g. 3rd year Computer Science student at MIT, tutored high school math for 2 years..."
                                rows={3}
                                data-testid="textarea-experience"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly rate (USD)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                <Input
                                  type="number"
                                  placeholder="25"
                                  className="pl-7"
                                  data-testid="input-hourly-rate"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short bio (optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell students a bit about yourself..."
                                rows={2}
                                data-testid="textarea-bio"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full gap-2 shadow-sm shadow-primary/20"
                        disabled={applyMutation.isPending}
                        data-testid="button-submit-application"
                      >
                        {applyMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                        ) : (
                          "Submit application"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
