import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useUpdateUserProfile,
  useGetMyTutorProfile,
  useUpdateMyTutorProfile,
} from "@/hooks/use-firestore";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  GraduationCap,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  Pencil,
  Calendar,
  Shield,
  X,
  Plus,
  Star,
  BookOpen,
  DollarSign,
  AlertCircle,
  Camera,
  Phone,
  LogOut,
  BarChart3,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  fmt,
  studentPrice,
  tutorPayout,
  MIN_RATE,
  MAX_RATE,
} from "@/lib/commission";
import { cn } from "@/lib/utils";

// ── Schemas ──────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  phone: z
    .string()
    .regex(/^[+\d\s\-()]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

const tutorSchema = z.object({
  hourlyRate: z.string().refine(
    (v) => {
      const n = parseFloat(v);
      return !isNaN(n) && n >= MIN_RATE && n <= MAX_RATE;
    },
    `Rate must be between Rs ${MIN_RATE} and Rs ${MAX_RATE}`
  ),
  experience: z.string().min(5, "Please describe your experience"),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type TutorFormData = z.infer<typeof tutorSchema>;
type NavSection = "personal" | "tutor" | "availability" | "account";

// ── Avatar ────────────────────────────────────────────────────

function Avatar({
  name,
  src,
  size = "lg",
  onUpload,
}: {
  name?: string | null;
  src?: string | null;
  size?: "sm" | "lg";
  onUpload?: (dataUrl: string) => void;
}) {
  const letter = name?.charAt(0)?.toUpperCase() || "?";
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 256;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        onUpload?.(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const avatarBase =
    "flex items-center justify-center bg-gradient-to-br from-[#5B6FD4] to-[#EDBA96] text-white font-bold select-none";

  if (size === "lg") {
    return (
      <div className="relative group">
        {src ? (
          <img
            src={src}
            alt={name ?? "avatar"}
            className="h-16 w-16 rounded-2xl object-cover border-[3px] border-background shadow"
          />
        ) : (
          <div
            className={cn(
              avatarBase,
              "h-16 w-16 rounded-2xl text-2xl border-[3px] border-background shadow"
            )}
          >
            {letter}
          </div>
        )}
        {onUpload && (
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Change photo"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </>
        )}
      </div>
    );
  }

  return src ? (
    <img src={src} alt={name ?? "avatar"} className="h-9 w-9 rounded-xl object-cover" />
  ) : (
    <div className={cn(avatarBase, "h-9 w-9 rounded-xl text-sm")}>{letter}</div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────

function Sidebar({
  active,
  onNavigate,
  user,
  currentAvatar,
  avatarUploading,
  onAvatarUpload,
  onSignOut,
}: {
  active: NavSection;
  onNavigate: (s: NavSection) => void;
  user: any;
  currentAvatar: string | null;
  avatarUploading: boolean;
  onAvatarUpload: (url: string) => void;
  onSignOut: () => void;
}) {
  const roleLabel = user?.isAdmin ? "Admin" : user?.isTutor ? "Tutor" : "Student";
  const roleCls = user?.isAdmin
    ? "bg-purple-100 text-purple-700 border-purple-200"
    : user?.isTutor
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-blue-100 text-blue-700 border-blue-200";

  const navItems: { id: NavSection; icon: React.ElementType; label: string }[] = [
    { id: "personal", icon: User, label: "Personal info" },
    { id: "tutor", icon: GraduationCap, label: "Tutor profile" },
    { id: "availability", icon: Calendar, label: "Availability" },
    { id: "account", icon: Shield, label: "Account & security" },
  ];

  return (
    <aside className="flex flex-col bg-card border-r border-border h-full overflow-y-auto">
      {/* Hero */}
      <div className="relative">
        <div className="h-28 bg-gradient-to-r from-[#5B6FD4] via-[#7B8FE8] to-[#EDBA96]" />
        <div className="px-5 flex items-end justify-between -mt-8 relative z-10">
          <div className="relative">
            <Avatar
              name={user?.name}
              src={currentAvatar}
              size="lg"
              onUpload={onAvatarUpload}
            />
            {avatarUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              </div>
            )}
          </div>
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
              roleCls
            )}
          >
            {user?.isTutor ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <User className="h-3 w-3" />
            )}
            {roleLabel}
          </span>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 pt-3 pb-4 border-b border-border">
        <h2 className="text-[17px] font-semibold text-foreground leading-tight">{user?.name}</h2>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <Mail className="h-3 w-3 shrink-0" /> {user?.email}
        </p>
        {user?.phone && (
          <a
            href={`tel:${user.phone}`}
            className="flex items-center gap-1.5 text-xs text-[#5B6FD4] mt-0.5 hover:underline"
          >
            <Phone className="h-3 w-3 shrink-0" /> {user.phone}
          </a>
        )}
        {user?.bio && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed italic">{user.bio}</p>
        )}
        {user?.isTutor && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-green-100 border border-green-200 px-2.5 py-1 text-[11px] font-medium text-green-700">
            <CheckCircle className="h-3 w-3" /> Approved tutor
          </div>
        )}
        <p className="text-[10px] text-muted-foreground/50 mt-2">Hover avatar to change photo</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Profile
        </p>
        {navItems.slice(0, 2).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all text-left",
              active === id
                ? "bg-[#5B6FD4]/10 text-[#5B6FD4] font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
            {active === id && <ChevronRight className="h-3 w-3 ml-auto" />}
          </button>
        ))}

        <p className="px-2 mb-1.5 mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Manage
        </p>
        {navItems.slice(2).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all text-left",
              active === id
                ? "bg-[#5B6FD4]/10 text-[#5B6FD4] font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
            {active === id && <ChevronRight className="h-3 w-3 ml-auto" />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-sm text-destructive hover:opacity-70 transition-opacity"
          data-testid="button-sign-out"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}

// ── Section card ──────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B6FD4]/10 text-[#5B6FD4]">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EditToggleButton({
  open,
  onToggle,
  testId,
}: {
  open: boolean;
  onToggle: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      data-testid={testId}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
    >
      {open ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
      {open ? "Cancel" : "Edit"}
    </button>
  );
}

// ── Field row (read view) ─────────────────────────────────────

function FieldRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

// ── Personal info ─────────────────────────────────────────────

function PersonalSection() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "", bio: user?.bio || "", phone: user?.phone || "" },
  });

  useEffect(() => {
    if (user) form.reset({ name: user.name, bio: user.bio || "", phone: user.phone || "" });
  }, [user?.uid]);

  const updateMutation = useUpdateUserProfile();

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    try {
      await updateMutation.mutateAsync({
        targetUid: user.uid,
        data: { name: data.name, bio: data.bio || null, phone: data.phone || null },
      });
      await refreshUser();
      toast({ title: "Profile updated" });
      setOpen(false);
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  return (
    <SectionCard
      title="Basic details"
      subtitle="Visible to others on the platform"
      icon={User}
      action={
        <EditToggleButton
          open={open}
          onToggle={() => { setOpen((v) => !v); if (open) form.reset(); }}
          testId="button-toggle-edit-profile"
        />
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <FieldRow icon={User} label="Full name">{user?.name}</FieldRow>
            <FieldRow icon={Mail} label="Email address">
              <span className="text-muted-foreground font-normal">{user?.email}</span>
            </FieldRow>
            {user?.phone && (
              <FieldRow icon={Phone} label="Phone number">
                <a href={`tel:${user.phone}`} className="text-[#5B6FD4] hover:underline">
                  {user.phone}
                </a>
              </FieldRow>
            )}
            <FieldRow icon={BookOpen} label="Bio">
              {user?.bio ? (
                <span className="font-normal italic text-muted-foreground">{user.bio}</span>
              ) : (
                <span className="font-normal italic text-muted-foreground/50 text-xs">No bio added yet</span>
              )}
            </FieldRow>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground">Full name</FormLabel>
                        <FormControl>
                          <Input data-testid="input-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input value={user?.email || ""} disabled className="pl-9 bg-muted text-muted-foreground text-sm" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Cannot be changed</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground">
                          Phone <span className="font-normal text-muted-foreground/60">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="+92 300 1234567"
                              className="pl-9"
                              data-testid="input-phone"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Shared only on confirmed bookings
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs font-medium text-muted-foreground">
                          Bio <span className="font-normal text-muted-foreground/60">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell others a bit about yourself..."
                            rows={3}
                            data-testid="textarea-bio"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="gap-2 bg-[#5B6FD4] hover:bg-[#5B6FD4]/90"
                    data-testid="button-save-profile"
                  >
                    {updateMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setOpen(false); form.reset(); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ── Tutor stats ───────────────────────────────────────────────

function TutorStatsCard({ tutorProfile }: { tutorProfile: any }) {
  if (!tutorProfile?.rating) return null;
  return (
    <SectionCard title="Performance overview" subtitle="Based on completed sessions" icon={BarChart3}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { num: tutorProfile.rating?.toFixed(1), label: "Avg rating" },
          { num: tutorProfile.reviewCount ?? 0, label: "Reviews" },
          { num: tutorProfile.sessionCount ?? 0, label: "Sessions" },
        ].map(({ num, label }) => (
          <div key={label} className="rounded-xl bg-muted/50 border border-border p-3 text-center">
            <p className="text-xl font-semibold text-foreground">{num}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < Math.floor(tutorProfile.rating)
                ? "text-amber-400 fill-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          {tutorProfile.rating?.toFixed(1)} from {tutorProfile.reviewCount} reviews
        </span>
      </div>
    </SectionCard>
  );
}

// ── Tutor details ─────────────────────────────────────────────

function TutorSection({ uid }: { uid: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");

  const { data: tutorProfile, isLoading } = useGetMyTutorProfile(uid);
  const updateTutorMutation = useUpdateMyTutorProfile(uid);

  const form = useForm<TutorFormData>({
    resolver: zodResolver(tutorSchema),
    defaultValues: { hourlyRate: "", experience: "", bio: "" },
  });

  useEffect(() => {
    if (tutorProfile) {
      form.reset({
        hourlyRate: String(tutorProfile.hourlyRate),
        experience: tutorProfile.experience || "",
        bio: tutorProfile.bio || "",
      });
      setSubjects(tutorProfile.subjects || []);
    }
  }, [tutorProfile?.hourlyRate, tutorProfile?.experience]);

  const addSubject = (s: string) => {
    const t = s.trim();
    if (t && !subjects.includes(t)) setSubjects((prev) => [...prev, t]);
    setSubjectInput("");
  };

  const removeSubject = (s: string) => setSubjects((prev) => prev.filter((x) => x !== s));

  const onSubmit = async (data: TutorFormData) => {
    if (subjects.length === 0) {
      toast({ title: "Add at least one subject", variant: "destructive" });
      return;
    }
    try {
      await updateTutorMutation.mutateAsync({
        tutorUid: uid,
        data: {
          subjects,
          experience: data.experience,
          hourlyRate: parseFloat(data.hourlyRate),
          bio: data.bio || undefined,
        },
      });
      toast({ title: "Tutor profile updated" });
      setOpen(false);
    } catch {
      toast({ title: "Failed to update tutor profile", variant: "destructive" });
    }
  };

  if (isLoading || !tutorProfile) return null;

  const rate = tutorProfile.hourlyRate;

  return (
    <>
      <TutorStatsCard tutorProfile={tutorProfile} />

      <SectionCard
        title="Subjects & rate"
        subtitle="What you teach and what you charge"
        icon={GraduationCap}
        action={
          <EditToggleButton
            open={open}
            onToggle={() => setOpen((v) => !v)}
            testId="button-toggle-edit-tutor"
          />
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {!open ? (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Rate block */}
              <div className="flex items-center justify-between rounded-xl bg-muted/50 border border-border p-4 mb-4">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Your hourly rate</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-foreground">
                      {fmt(rate)}
                    </span>
                    <span className="text-sm text-muted-foreground">/hr</span>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground space-y-0.5">
                  <p>Student pays <span className="font-semibold text-foreground">{fmt(studentPrice(rate))}</span></p>
                  <p>You receive <span className="font-semibold text-foreground">{fmt(tutorPayout(rate))}</span></p>
                </div>
              </div>

              {/* Subjects */}
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Subjects
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tutorProfile.subjects.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="rounded-full text-xs bg-[#5B6FD4]/10 text-[#5B6FD4] border border-[#5B6FD4]/20"
                  >
                    {s}
                  </Badge>
                ))}
              </div>

              {/* Experience */}
              {tutorProfile.experience && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {tutorProfile.experience}
                </p>
              )}

              {/* Quick links */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-border mt-3">
                <Link href="/availability">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    data-testid="button-manage-availability"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Manage availability
                  </Button>
                </Link>
                <Link href={`/tutors/${uid}`}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" /> View public profile
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {/* Subjects */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Subjects</label>
                    <div className="flex flex-wrap gap-1.5 mt-2 mb-2 min-h-[28px]">
                      {subjects.map((s) => (
                        <Badge
                          key={s}
                          variant="secondary"
                          className="gap-1 pr-1.5 rounded-full bg-[#5B6FD4]/10 text-[#5B6FD4] border border-[#5B6FD4]/20"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => removeSubject(s)}
                            className="ml-0.5 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a subject and press Enter..."
                        value={subjectInput}
                        onChange={(e) => setSubjectInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSubject(subjectInput);
                          }
                        }}
                        data-testid="input-subject"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSubject(subjectInput)}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Rate */}
                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-muted-foreground">
                            Hourly rate (PKR)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                                Rs
                              </span>
                              <Input
                                type="number"
                                min={MIN_RATE}
                                max={MAX_RATE}
                                className="pl-9"
                                data-testid="input-hourly-rate"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Rs {MIN_RATE}–{MAX_RATE}/hr
                            {field.value &&
                              !isNaN(parseFloat(field.value)) &&
                              parseFloat(field.value) >= MIN_RATE
                              ? ` · student pays ${fmt(studentPrice(parseFloat(field.value)))}`
                              : ""}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Experience */}
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-muted-foreground">
                            Experience & qualifications
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g. 3rd year CS student, 2 years tutoring..."
                              rows={3}
                              data-testid="textarea-experience"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Bio */}
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs font-medium text-muted-foreground">
                            Tutor bio{" "}
                            <span className="font-normal text-muted-foreground/60">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell students about your teaching style..."
                              rows={2}
                              data-testid="textarea-tutor-bio"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="submit"
                      disabled={updateTutorMutation.isPending}
                      className="gap-2 bg-[#5B6FD4] hover:bg-[#5B6FD4]/90"
                      data-testid="button-save-tutor-profile"
                    >
                      {updateTutorMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                      ) : (
                        "Save tutor profile"
                      )}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>
    </>
  );
}

// ── Tutor status (non-approved) ───────────────────────────────

function TutorStatusSection() {
  const { user } = useAuth();
  if (user?.isTutor) return null;

  return (
    <SectionCard
      title="Tutor status"
      subtitle="Your tutoring account details"
      icon={GraduationCap}
    >
      {(!user?.tutorStatus || user.tutorStatus === "none") && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Not a tutor yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Apply to share your knowledge and earn money.
              </p>
            </div>
          </div>
          <Link href="/become-tutor">
            <Button
              size="sm"
              className="gap-1.5 shrink-0 bg-[#5B6FD4] hover:bg-[#5B6FD4]/90"
              data-testid="button-apply-tutor"
            >
              <GraduationCap className="h-3.5 w-3.5" /> Apply now
            </Button>
          </Link>
        </div>
      )}

      {user?.tutorStatus === "pending" && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Application under review</p>
            <p className="text-xs text-amber-700 mt-0.5">
              We'll notify you once your application has been reviewed.
            </p>
          </div>
        </div>
      )}

      {user?.tutorStatus === "rejected" && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Application not approved</p>
            <p className="text-xs text-red-600 mt-0.5">
              Your application wasn't approved this time. Please contact support.
            </p>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ── Account section ───────────────────────────────────────────

function AccountSection() {
  const { user, signOutUser } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch {
      toast({ title: "Sign out failed", variant: "destructive" });
    }
  };

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-foreground">Account & security</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account type and session</p>
      </div>

      <SectionCard title="Account details" subtitle="Your membership information" icon={Shield}>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-muted/50 border border-border p-3.5">
            <p className="text-[11px] text-muted-foreground mb-1">Account type</p>
            <p className="text-sm font-semibold text-foreground capitalize">
              {user?.isAdmin ? "Administrator" : user?.isTutor ? "Tutor" : "Student"}
            </p>
          </div>
          {joined && (
            <div className="rounded-xl bg-muted/50 border border-border p-3.5">
              <p className="text-[11px] text-muted-foreground mb-1">Member since</p>
              <p className="text-sm font-semibold text-foreground">{joined}</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50"
            onClick={handleSignOut}
            data-testid="button-sign-out"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </SectionCard>
    </>
  );
}

// ── Availability placeholder ──────────────────────────────────

function AvailabilitySection() {
  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-foreground">Availability</h2>
        <p className="text-sm text-muted-foreground mt-1">Set when you're open to take sessions</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-10 flex flex-col items-center justify-center text-center gap-3">
        <Calendar className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Manage your weekly availability from the dedicated schedule page.
        </p>
        <Link href="/availability">
          <Button
            size="sm"
            className="gap-1.5 bg-[#5B6FD4] hover:bg-[#5B6FD4]/90"
            data-testid="button-manage-availability"
          >
            <Calendar className="h-3.5 w-3.5" /> Open availability settings
          </Button>
        </Link>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isLoading, refreshUser, signOutUser } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<NavSection>("personal");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const updateMutation = useUpdateUserProfile();

  const handleAvatarUpload = async (dataUrl: string) => {
    if (!user) return;
    setAvatarPreview(dataUrl);
    setAvatarUploading(true);
    try {
      await updateMutation.mutateAsync({
        targetUid: user.uid,
        data: { avatarUrl: dataUrl },
      });
      await refreshUser();
      toast({ title: "Profile photo updated" });
    } catch {
      toast({ title: "Failed to update photo", variant: "destructive" });
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch {
      toast({ title: "Sign out failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-64px)]">
          <div className="w-72 animate-pulse bg-muted/40 border-r border-border" />
          <div className="flex-1 p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentAvatar = avatarPreview ?? user?.avatarUrl ?? null;

  return (
    <AppLayout>
      {/* Two-column layout: sidebar + main */}
      <div
        className="flex"
        style={{ height: "calc(100vh - 64px)" }} // adjust offset to match your AppLayout header height
      >
        {/* ── Sidebar ── */}
        <div className="w-72 shrink-0 h-full overflow-y-auto">
          <Sidebar
            active={activeSection}
            onNavigate={setActiveSection}
            user={user}
            currentAvatar={currentAvatar}
            avatarUploading={avatarUploading}
            onAvatarUpload={handleAvatarUpload}
            onSignOut={handleSignOut}
          />
        </div>

        {/* ── Main content ── */}
        <main className="flex-1 h-full overflow-y-auto bg-muted/20 px-8 py-7">
          <AnimatePresence mode="wait">
            {activeSection === "personal" && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl space-y-5"
              >
                <div className="mb-1">
                  <h2 className="text-xl font-semibold text-foreground">Personal info</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your name, bio, and contact details
                  </p>
                </div>
                <PersonalSection />
              </motion.div>
            )}

            {activeSection === "tutor" && (
              <motion.div
                key="tutor"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl space-y-5"
              >
                <div className="mb-1">
                  <h2 className="text-xl font-semibold text-foreground">Tutor profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your public tutoring page — what students see when browsing
                  </p>
                </div>
                {user?.isTutor && user.uid ? (
                  <TutorSection uid={user.uid} />
                ) : (
                  !user?.isAdmin && <TutorStatusSection />
                )}
              </motion.div>
            )}

            {activeSection === "availability" && (
              <motion.div
                key="availability"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl"
              >
                <AvailabilitySection />
              </motion.div>
            )}

            {activeSection === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl space-y-5"
              >
                <AccountSection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </AppLayout>
  );
}