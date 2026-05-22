import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useApplyTutor, useGetMyTutorProfile } from "@/hooks/use-firestore";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap, Clock, CheckCircle, XCircle, Loader2,
  Plus, X, Upload, FileText, DollarSign, BookOpen, Star, Calendar,
} from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const schema = z.object({
  experience: z.string().min(5, "Please describe your experience"),
  hourlyRate: z.string().refine(
    (v) => {
      const n = parseFloat(v);
      return !isNaN(n) && n >= 300 && n <= 900;
    },
    "Rate must be between Rs 300 and Rs 900"
  ),
  bio: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const COMMON_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "History", "Computer Science", "Spanish", "French", "Economics",
];

const BENEFITS = [
  { icon: DollarSign, title: "Earn on your terms",    desc: "Set your own hourly rate and get paid for every session." },
  { icon: Calendar,   title: "Flexible schedule",     desc: "Add availability slots that fit around your life." },
  { icon: BookOpen,   title: "Teach what you love",   desc: "Pick the subjects you're passionate about." },
  { icon: Star,       title: "Build your reputation", desc: "Collect reviews and grow your student base over time." },
];

export default function BecomeTutorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvDataUrl, setCvDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: myProfile, isLoading: profileLoading } = useGetMyTutorProfile(user?.uid);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { experience: "", hourlyRate: "", bio: "" },
  });

  const applyMutation = useApplyTutor(user?.uid);

  const addSubject = (sub: string) => {
    const trimmed = sub.trim();
    if (trimmed && !subjects.includes(trimmed)) setSubjects([...subjects, trimmed]);
    setSubjectInput("");
  };

  const removeSubject = (sub: string) => setSubjects(subjects.filter((s) => s !== sub));

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "CV too large", description: "Please upload a file under 2MB.", variant: "destructive" });
      return;
    }
    setCvFile(file);
    const reader = new FileReader();
    reader.onload = () => setCvDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    if (subjects.length === 0) {
      toast({ title: "Please add at least one subject", variant: "destructive" });
      return;
    }
    if (!cvDataUrl) {
      toast({ title: "CV required", description: "Please upload your CV before submitting.", variant: "destructive" });
      return;
    }
    try {
      await applyMutation.mutateAsync({
        uid: user.uid,
        name: user.name,
        email: user.email,
        subjects,
        experience: data.experience,
        hourlyRate: parseFloat(data.hourlyRate),
        bio: data.bio || undefined,
        cvUrl: cvDataUrl,
        cvFileName: cvFile?.name,
      });
      toast({ title: "Application submitted!", description: "We'll review your application and get back to you." });
    } catch {
      toast({ title: "Application failed", description: "Could not submit application.", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Page header */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#5B6FD4] to-[#1e2d87] p-6 sm:p-8 text-white">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 mb-4">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Become a tutor</h1>
              <p className="mt-1.5 text-white/70 text-sm max-w-sm">
                Share your expertise, set your own rate, and help students master any subject.
              </p>
            </div>
          </div>

          {profileLoading ? (
            <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          ) : myProfile ? (
            /* ── Status states ── */
            <>
              {myProfile.status === "pending" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-800">Application under review</p>
                      <p className="mt-1 text-sm text-amber-700">Your application is being reviewed by our team. We'll notify you once it's approved.</p>
                    </div>
                  </div>
                </div>
              )}

              {myProfile.status === "approved" && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">You're an approved tutor!</p>
                      <p className="mt-1 text-sm text-green-700">Your profile is live. Students can find and book sessions with you.</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {myProfile.subjects.map((s) => (
                          <span key={s} className="rounded-full bg-green-100 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-700">{s}</span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-green-700">
                        <span className="font-semibold">Rs {myProfile.hourlyRate}/hr</span>
                      </div>
                    </div>
                    <Link href="/availability">
                      <Button size="sm" variant="outline" className="shrink-0 border-green-300 text-green-700 hover:bg-green-100">
                        <Calendar className="h-3.5 w-3.5 mr-1" /> Manage slots
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {myProfile.status === "rejected" && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-800">Application not approved</p>
                      <p className="mt-1 text-sm text-red-700">Your application wasn't approved this time. Please contact support for more information.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Benefits grid */}
              <div className="grid grid-cols-2 gap-3">
                {BENEFITS.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.title} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 mb-3">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{b.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Application form */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                  <p className="text-sm font-semibold text-foreground">Your application</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Fill in the details below — we review every application carefully.</p>
                </div>

                <div className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                      {/* Subjects */}
                      <div>
                        <label className="text-sm font-medium text-foreground">Subjects you teach</label>
                        <div className="mt-2 flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                          {subjects.map((s) => (
                            <Badge key={s} variant="secondary" className="gap-1 pr-1.5 rounded-full">
                              {s}
                              <button type="button" onClick={() => removeSubject(s)} className="ml-0.5 hover:text-destructive">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a subject and press Enter..."
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
                          {COMMON_SUBJECTS.filter((s) => !subjects.includes(s)).slice(0, 6).map((s) => (
                            <button key={s} type="button"
                              className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors"
                              onClick={() => addSubject(s)}>
                              + {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <FormField control={form.control} name="experience" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience & qualifications</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g. 3rd year Computer Science student at MIT, tutored high school math for 2 years..."
                              rows={3} data-testid="textarea-experience" {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly rate (PKR)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rs</span>
                              <Input
                                type="number"
                                placeholder="300"
                                min={300}
                                max={900}
                                className="pl-9"
                                data-testid="input-hourly-rate"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            Allowed range: Rs 300 – Rs 900 per hour
                          </p>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short bio <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell students a bit about yourself..." rows={2} data-testid="textarea-bio" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* CV Upload */}
                      <div>
                        <label className="text-sm font-medium text-foreground">
                          CV / Resume <span className="text-destructive">*</span>
                        </label>
                        <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                          PDF or Word format, max 2MB. Our team will review it with your application.
                        </p>
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvChange} />
                        {cvFile ? (
                          <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <FileText className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{cvFile.name}</p>
                              <p className="text-xs text-muted-foreground">{(cvFile.size / 1024).toFixed(0)} KB · Ready to submit</p>
                            </div>
                            <Button type="button" variant="ghost" size="sm"
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => { setCvFile(null); setCvDataUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors px-4 py-8 text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                              <Upload className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Click to upload your CV</p>
                              <p className="text-xs text-muted-foreground mt-0.5">PDF, DOC or DOCX · Max 2MB</p>
                            </div>
                          </button>
                        )}
                      </div>

                      <Button type="submit" className="w-full gap-2 h-11 text-base font-semibold shadow-sm shadow-primary/20"
                        disabled={applyMutation.isPending || !user} data-testid="button-submit-application">
                        {applyMutation.isPending
                          ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting application...</>
                          : <><GraduationCap className="h-4 w-4" />Submit application</>}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
