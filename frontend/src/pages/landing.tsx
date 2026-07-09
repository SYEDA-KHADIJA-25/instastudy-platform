import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetFeaturedTutors } from "@/hooks/use-firestore";
import {
  Star,
  BookOpen,
  Users,
  Clock,
  ChevronRight,
  Zap,
  Shield,
  ArrowDown,
  CheckCircle2,
  Sparkles,
  Calculator,
  FlaskConical,
  Dna,
  Code2,
  Globe,
  Palette,
  Music,
  TrendingUp,
  Brain,
  BarChart3,
  PenLine,
  Atom,
  Telescope,
  Languages,
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/* ─── Brand tokens ───────────────────────────────────────────────────────── */
const BRAND = {
  deep:       "#5B6FD4",   // cornflower blue — primary
  peach:      "#EDBA96",   // warm peach — accent
  navy:       "#0f1240",   // deep navy — dark text
  lightBg:    "#EEF2FF",   // very light blue-white — tinted sections
  darkBg:     "#1e2d87",   // deep cornflower blue — dark sections / footer
  // legacy aliases kept for references below
  lavender:   "#EDBA96",
  pink:       "#EDBA96",
  purple:     "#7B8FE8",
  btnGrad:    "linear-gradient(135deg, #5B6FD4 0%, #7B8FE8 100%)",
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─── Doodle SVGs ─────────────────────────────────────────────────────────── */
const BookDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 90 70" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M45 14 C45 14, 12 11, 9 56 C9 56, 30 51, 45 58" />
    <path d="M45 14 C45 14, 78 11, 81 56 C81 56, 60 51, 45 58" />
    <line x1="45" y1="14" x2="45" y2="58" />
    <line x1="18" y1="24" x2="36" y2="22" /><line x1="17" y1="33" x2="35" y2="31" />
    <line x1="17" y1="42" x2="35" y2="40" />
    <line x1="54" y1="22" x2="72" y2="24" /><line x1="55" y1="31" x2="73" y2="33" />
    <line x1="55" y1="40" x2="73" y2="42" />
  </svg>
);

const PencilDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 36 110" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22 L8 86 Q8 90 18 90 Q28 90 28 86 L28 22 Z" />
    <path d="M8 22 L18 4 L28 22" />
    <line x1="8" y1="80" x2="28" y2="80" />
    <path d="M8 86 Q13 100 18 106 Q23 100 28 86" />
  </svg>
);

const AtomDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 90 90" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round">
    <circle cx="45" cy="45" r="6" fill="currentColor" fillOpacity="0.35" />
    <ellipse cx="45" cy="45" rx="38" ry="16" />
    <ellipse cx="45" cy="45" rx="38" ry="16" transform="rotate(60 45 45)" />
    <ellipse cx="45" cy="45" rx="38" ry="16" transform="rotate(120 45 45)" />
    <circle cx="83" cy="45" r="3" fill="currentColor" />
    <circle cx="26" cy="12" r="3" fill="currentColor" />
    <circle cx="26" cy="78" r="3" fill="currentColor" />
  </svg>
);

const CapDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 90 78" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="45,10 82,32 45,54 8,32" />
    <path d="M22 40 C22 40, 22 60, 45 68 C68 60, 68 40, 68 40" />
    <line x1="82" y1="32" x2="82" y2="55" />
    <path d="M82 55 Q80 62 74 64" />
    <circle cx="74" cy="67" r="3" fill="currentColor" fillOpacity="0.4" />
  </svg>
);

const BulbDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 70 95" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M35 6 C20 6, 10 18, 10 30 C10 42, 18 50, 22 58 L48 58 C52 50, 60 42, 60 30 C60 18, 50 6, 35 6" />
    <line x1="24" y1="64" x2="46" y2="64" /><line x1="27" y1="71" x2="43" y2="71" />
    <line x1="30" y1="78" x2="40" y2="78" />
    <line x1="6" y1="30" x2="0" y2="30" /><line x1="64" y1="30" x2="70" y2="30" />
    <line x1="16" y1="14" x2="10" y2="8" /><line x1="54" y1="14" x2="60" y2="8" />
    <path d="M27 35 Q35 25 43 35" strokeDasharray="3 2" />
  </svg>
);

const SparkDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 44 44" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round">
    <line x1="22" y1="2" x2="22" y2="42" /><line x1="2" y1="22" x2="42" y2="22" />
    <line x1="7" y1="7" x2="37" y2="37" /><line x1="37" y1="7" x2="7" y2="37" />
  </svg>
);

const FormulaDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 110 44" fill="currentColor">
    <text x="2" y="34" fontSize="30" fontFamily="Georgia, serif" fontStyle="italic">
      f(x) = ∑
    </text>
  </svg>
);

const CompassDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 70 100" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M35 10 L20 60 L35 54 L50 60 Z" />
    <circle cx="35" cy="10" r="5" />
    <path d="M20 60 L10 90" /><path d="M50 60 L60 90" />
    <path d="M10 90 Q12 95 16 93" /><path d="M60 90 Q58 95 54 93" />
    <path d="M24 44 Q35 56 46 44" strokeDasharray="3 3" />
  </svg>
);

const CalculatorDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 88" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="4" width="50" height="80" rx="8" />
    <rect x="14" y="12" width="36" height="18" rx="3" />
    <rect x="14" y="39" width="10" height="10" rx="3" />
    <rect x="27" y="39" width="10" height="10" rx="3" />
    <rect x="40" y="39" width="10" height="10" rx="3" />
    <rect x="14" y="55" width="10" height="10" rx="3" />
    <rect x="27" y="55" width="10" height="10" rx="3" />
    <rect x="40" y="55" width="10" height="10" rx="3" />
    <rect x="14" y="71" width="36" height="10" rx="3" />
  </svg>
);

/* ─── Subjects Marquee ───────────────────────────────────────────────────── */
const SUBJECTS = [
  { icon: Calculator,   label: "Mathematics" },
  { icon: FlaskConical, label: "Chemistry" },
  { icon: Dna,          label: "Biology" },
  { icon: Code2,        label: "Computer Science" },
  { icon: Globe,        label: "History" },
  { icon: BookOpen,     label: "Literature" },
  { icon: Atom,         label: "Physics" },
  { icon: Palette,      label: "Art" },
  { icon: Music,        label: "Music Theory" },
  { icon: TrendingUp,   label: "Economics" },
  { icon: Brain,        label: "Psychology" },
  { icon: Languages,    label: "Languages" },
  { icon: BarChart3,    label: "Statistics" },
  { icon: Telescope,    label: "Astronomy" },
  { icon: PenLine,      label: "Essay Writing" },
  { icon: Zap,          label: "Electrical Eng." },
];

function Marquee() {
  const repeated = [...SUBJECTS, ...SUBJECTS];
  return (
    <div className="overflow-hidden py-3 border-y" style={{ background: BRAND.deep, borderColor: "rgba(91,111,212,0.35)" }}>
      <div className="flex animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
        {repeated.map((s, i) => {
          const Icon = s.icon;
          return (
            <span key={i} className="inline-flex items-center gap-2 mx-7 text-[13px] font-medium tracking-wide"
              style={{ color: "rgba(255,255,255,0.75)" }}>
              <Icon className="h-3.5 w-3.5" style={{ color: BRAND.lavender }} />
              {s.label}
              <span className="ml-3 h-1 w-1 rounded-full inline-block" style={{ background: "rgba(255,255,255,0.3)" }} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Landing Page ────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { data: featuredTutors } = useGetFeaturedTutors();

  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Navbar becomes opaque once user scrolls down
  const navBg = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,0.88)"]);
  const navBorder = useTransform(scrollY, [0, 80], ["rgba(91,111,212,0)", "rgba(91,111,212,0.1)"]);
  const navBlur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(12px)"]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
        style={{ scaleX, background: BRAND.lavender }}
      />

      {/* ── Navbar ── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6 md:px-10"
        style={{
          background: navBg,
          borderBottom: "1px solid",
          borderColor: navBorder,
          backdropFilter: navBlur,
        }}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black tracking-tight" style={{ color: BRAND.deep, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Insta<span style={{ color: BRAND.peach }}>Study</span>
            </span>
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase mt-0.5" style={{ color: "rgba(91,111,212,0.5)" }}>
              Peer Tutoring
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {[{ label: "Features", id: "features" }, { label: "How it Works", id: "how-it-works" }].map((item) => (
            <button key={item.id} onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium transition-colors"
              style={{ color: "rgba(91,111,212,0.6)" }}
              onMouseEnter={e => (e.currentTarget.style.color = BRAND.deep)}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(91,111,212,0.6)")}>
              {item.label}
            </button>
          ))}
          <Link href="/tutors" className="text-sm font-medium transition-colors"
            style={{ color: "rgba(91,111,212,0.6)" }}>
            Browse Tutors
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-medium hidden sm:inline-flex" style={{ color: "rgba(91,111,212,0.7)" }}>
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="border-0 font-semibold bg-primary text-primary-foreground text-xs sm:text-sm px-3 sm:px-4">
              Get started
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-14 sm:pt-16">
        {/* On md+: image is absolute background. On mobile: image flows naturally below content */}
        <div className="flex flex-col md:block md:min-h-screen">

          {/* Text content */}
          <motion.div
            className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 text-center sm:px-6 md:px-14 pt-14 sm:pt-20 md:pt-0 md:min-h-screen pb-8 md:pb-0"
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <div className="flex flex-col items-center w-full max-w-[600px] px-2 sm:px-0">
              {/* Headline */}
              <motion.h1
                className="font-black leading-[1.08] tracking-[-0.03em] w-full"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(28px, 7vw, 68px)", color: "#0f0520" }}
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1 }}
              >
                The smarter way<br />to master{" "}
                <span style={{
                  background: "linear-gradient(120deg, #EDBA96 0%, #E0935A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  any subject.
                </span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                className="mt-5 sm:mt-6 w-full max-w-[460px] text-sm sm:text-base font-normal leading-[1.7] text-gray-500 md:text-[17px]"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25 }}
              >
                Connect with peer tutors who've mastered what you're learning.
                Book a session in minutes — or earn by sharing what you know.
              </motion.p>

              {/* CTA row */}
              <motion.div
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.36 }}
              >
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="h-12 w-full gap-2 px-7 text-[15px]" data-testid="button-cta-get-started">
                    Find a tutor <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-12 w-full gap-2 px-7 text-[15px]"
                    style={{ borderColor: "rgba(91,111,212,0.35)", color: BRAND.deep }}
                    data-testid="button-cta-become-tutor">
                    Become a tutor <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Hero image: full-width natural on mobile, absolute background on md+ */}
          <img
            src="/hero-bg.png"
            alt=""
            aria-hidden="true"
            className="w-full h-auto block md:absolute md:inset-0 md:h-full md:w-full md:object-cover md:object-top md:-z-0 pointer-events-none select-none"
          />
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 sm:flex"
          style={{ color: "rgba(91,111,212,0.5)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
        >
          <span className="text-[9px] tracking-widest uppercase font-semibold">Scroll</span>
          <ArrowDown className="h-3.5 w-3.5 animate-bounce-gentle" />
        </motion.div>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section id="features" className="relative overflow-hidden bg-white py-14 sm:py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">

          {/* Session showcase — two-column */}
          <motion.div className="mb-14 sm:mb-20 grid gap-8 md:grid-cols-2 items-center"
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div>
              <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-4"
                style={{ background: BRAND.lightBg, color: BRAND.deep }}>
                Why Insta-Study
              </span>
              <h2 className="mb-4 sm:mb-5 text-2xl sm:text-3xl font-extrabold leading-tight md:text-5xl" style={{ color: BRAND.deep }}>
                Built for<br />curious minds
              </h2>
              <p className="text-sm leading-relaxed mb-6 sm:mb-8" style={{ color: "#666" }}>
                Everything you need to learn faster, deeper, and on your own terms — from a tutor who's been exactly where you are.
              </p>
              <Link href="/tutors">
                <Button size="lg" className="w-full sm:w-auto gap-2 px-8 py-5 font-bold border-0 bg-primary text-primary-foreground">
                  Browse tutors <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              style={{ boxShadow: "0 32px 80px rgba(91,111,212,0.2)" }}>
              <img
                src="/illus-session.png"
                alt="Live tutoring session"
                className="w-full h-56 sm:h-72 md:h-80 object-cover object-left-top"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5"
                style={{ background: "linear-gradient(to top, rgba(30,45,135,0.75) 0%, transparent 100%)" }}>
                <p className="text-white font-bold text-sm">Live 1-on-1 sessions</p>
                <p className="text-white/65 text-xs mt-0.5">Real-time tutoring from verified peers</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {[
              { icon: Users,    doodle: <CapDoodle className="w-12 h-11" />,        title: "Expert Peer Tutors",     desc: "Every tutor is reviewed before going live. Real people who've mastered what you're learning.", bg: BRAND.lightBg },
              { icon: Clock,    doodle: <CompassDoodle className="w-9 h-12" />,     title: "Flexible Scheduling",    desc: "Tutors set their own hours. Pick what works for you — sessions fit around your life.", bg: "#fff" },
              { icon: Zap,      doodle: <BulbDoodle className="w-9 h-12" />,        title: "Instant Booking",        desc: "Browse profiles, check availability, and lock in your session in under 2 minutes.", bg: BRAND.lightBg },
              { icon: Star,     doodle: <SparkDoodle className="w-10 h-10" />,      title: "Ratings & Reviews",      desc: "Transparent ratings from real students. Every session can be reviewed — no hiding.", bg: "#fff" },
              { icon: Shield,   doodle: <AtomDoodle className="w-12 h-12" />,       title: "Safe & Verified",        desc: "All tutors go through our review process. Your learning environment is protected.", bg: BRAND.lightBg },
              { icon: BookOpen, doodle: <CalculatorDoodle className="w-9 h-12" />,  title: "Earn as a Tutor",        desc: "Set your own rate and hours. Share what you know and get paid for it.", bg: "#fff" },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <div className="group relative h-full rounded-2xl p-5 sm:p-6 overflow-hidden border transition-all hover:shadow-xl hover:-translate-y-1"
                  style={{ background: f.bg, borderColor: `rgba(91,111,212,0.18)` }}>
                  <div className="absolute top-4 right-4 transition-opacity opacity-30 group-hover:opacity-60"
                    style={{ color: BRAND.deep }}>
                    {f.doodle}
                  </div>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: BRAND.lightBg }}>
                    <f.icon className="h-4.5 w-4.5" style={{ color: BRAND.deep }} />
                  </div>
                  <h3 className="font-bold mb-2 text-sm" style={{ color: BRAND.deep }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#666" }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="relative overflow-hidden py-14 sm:py-20 md:py-28"
        style={{ background: BRAND.lightBg }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${BRAND.lavender}, transparent)` }} />

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div className="mb-14 sm:mb-20 grid gap-8 md:grid-cols-2 items-center"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight md:text-5xl" style={{ color: BRAND.deep }}>
                From zero to learning{" "}
                <span style={{ color: BRAND.lavender }}>in minutes</span>
              </h2>
              <p className="mt-3 sm:mt-4 text-sm leading-relaxed" style={{ color: "#666" }}>No friction. No wait. Just knowledge — in three simple steps.</p>
            </div>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 24px 60px rgba(91,111,212,0.15)" }}>
              <img
                src="/illus-connect.png"
                alt="Students connecting with tutors"
                className="w-full h-48 sm:h-56 md:h-64 object-cover object-center"
              />
            </div>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-[52px] left-[16.67%] right-[16.67%] h-px border-t-2 border-dashed"
              style={{ borderColor: `rgba(91,111,212,0.3)` }} />

            <div className="grid gap-10 sm:gap-12 grid-cols-1 sm:grid-cols-3">
              {[
                { step: "01", title: "Create your account",  desc: "Register in seconds. One account for both students and tutors.", doodle: <PencilDoodle className="w-10 h-28" />, color: BRAND.deep },
                { step: "02", title: "Find your tutor",      desc: "Browse by subject, filter by rate and rating. Read real profiles.", doodle: <BookDoodle className="w-28 h-20" />, color: BRAND.deep },
                { step: "03", title: "Book & learn",         desc: "Pick a slot, confirm your booking, show up ready to learn.", doodle: <SparkDoodle className="w-12 h-12" />, color: BRAND.deep },
              ].map((item, i) => (
                <motion.div key={item.step} className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                  <div className="relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-2xl text-white font-black text-lg shadow-md mb-6"
                    style={{ background: item.color }}>
                    {item.step}
                  </div>
                  <div className="h-24 flex items-center justify-center mb-5" style={{ color: item.color, opacity: 0.6 }}>
                    {item.doodle}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: BRAND.deep }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#666" }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div className="mt-10 sm:mt-12 text-center sm:mt-16"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Link href="/register">
              <Button size="lg" className="w-full gap-2 px-6 py-6 text-base font-bold border-0 bg-primary text-primary-foreground sm:w-auto sm:px-10">
                Start for free <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED TUTORS
      ══════════════════════════════════════════ */}
      {Array.isArray(featuredTutors) && featuredTutors.length > 0 && (
        <section className="bg-white py-14 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div className="mb-10 sm:mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div>
                <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ background: BRAND.lightBg, color: BRAND.deep }}>
                  Meet your tutors
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: BRAND.deep }}>Top-rated this week</h2>
              </div>
              <Link href="/tutors">
                <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto"
                  style={{ borderColor: `rgba(91,111,212,0.3)`, color: BRAND.deep }}>
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTutors.slice(0, 3).map((tutor, i) => (
                <motion.div key={tutor.id} initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}>
                  <Card className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
                    style={{ border: `1px solid rgba(91,111,212,0.18)` }}>
                    <div className="h-1.5 w-full" style={{ background: BRAND.deep }} />
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold shadow-sm"
                          style={{ background: BRAND.deep }}>
                          {tutor?.name?.charAt(0) || "T"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold truncate text-sm sm:text-base" style={{ color: BRAND.deep }}>{tutor.name}</h3>
                          <div className="mt-0.5 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-gray-400">
                              {tutor.rating ? tutor.rating.toFixed(1) : "New"} · {tutor.reviewCount} reviews
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-bold" style={{ color: BRAND.deep }}>
                          Rs {tutor.hourlyRate}/hr
                        </span>
                      </div>

                      {tutor.bio && (
                        <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">{tutor.bio}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tutor.subjects.slice(0, 3).map((s) => (
                          <span key={s} className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ background: BRAND.lightBg, color: BRAND.deep }}>
                            {s}
                          </span>
                        ))}
                      </div>

                      <Link href={`/tutors/${tutor.id}`} className="block mt-4">
                        <Button variant="outline" size="sm" className="w-full font-semibold transition-all"
                          style={{ borderColor: `rgba(91,111,212,0.3)`, color: BRAND.deep }}
                          data-testid={`button-view-tutor-${tutor.id}`}>
                          View profile
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-14 sm:py-20 md:py-28" style={{ background: BRAND.deep }}>
        <div className="absolute inset-0 hero-grid-bg opacity-40" />

        <div className="absolute top-8 left-8 pointer-events-none animate-float hidden sm:block"
          style={{ color: BRAND.lavender, opacity: 0.15 }}>
          <SparkDoodle className="w-10 h-10" />
        </div>
        <div className="absolute bottom-8 right-10 pointer-events-none animate-float-slow hidden sm:block"
          style={{ color: BRAND.lavender, opacity: 0.15 }}>
          <SparkDoodle className="w-8 h-8" />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 left-6 pointer-events-none hidden lg:block"
          style={{ color: BRAND.lavender, opacity: 0.12 }}>
          <BookDoodle className="w-28 h-20" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div className="text-center mb-10 sm:mb-14"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white md:text-5xl">
              Real students.{" "}
              <span style={{ color: BRAND.lavender }}>Real results.</span>
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {[
              { name: "Priya S.",  subject: "Calculus",  result: "C → A",         avatar: "P", text: "My tutor explained integration in a way that finally clicked. Went from a C to an A in one month. I actually look forward to math now." },
              { name: "Marcus L.", subject: "Python",    result: "Got internship", avatar: "M", text: "Found an amazing CS tutor who helped me land my first internship. The mock interviews were gold. Couldn't have done it without Insta-Study." },
              { name: "Emma T.",   subject: "Chemistry", result: "Passed finals",  avatar: "E", text: "Flexible scheduling was a lifesaver. Booked late-night sessions before exams — my tutor was always there. Passed with a B+!" },
            ].map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <div className="h-full rounded-2xl p-5 sm:p-6 flex flex-col"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(8px)" }}>
                  <div className="text-4xl font-serif mb-4 leading-none" style={{ color: BRAND.lavender, opacity: 0.5 }}>"</div>
                  <p className="text-sm leading-relaxed flex-1 italic" style={{ color: "rgba(255,255,255,0.65)" }}>{t.text}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-sm"
                      style={{ background: BRAND.lavender, color: BRAND.deep }}>
                      {t.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{t.name}</p>
                      <p className="text-xs" style={{ color: BRAND.lavender, opacity: 0.7 }}>
                        {t.subject} · <span style={{ color: BRAND.lavender }}>{t.result}</span>
                      </p>
                    </div>
                    <div className="ml-auto flex gap-0.5 shrink-0">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: BRAND.lightBg }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div className="grid gap-0 md:grid-cols-2 items-stretch"
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>

            {/* Text + buttons */}
            <div className="flex flex-col justify-center py-14 sm:py-20 md:py-24 md:pr-12">
              <div className="mb-5 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl"
                style={{ background: "white", boxShadow: "0 4px 20px rgba(91,111,212,0.12)" }}>
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: BRAND.deep }} />
              </div>
              <h2 className="mb-4 sm:mb-5 text-2xl sm:text-3xl font-extrabold leading-tight md:text-[52px]" style={{ color: BRAND.deep }}>
                Your next<br />breakthrough<br />starts here.
              </h2>
              <p className="text-sm sm:text-base mb-8 sm:mb-10 max-w-md" style={{ color: "#666" }}>
                Join thousands of students who stopped struggling alone. Find your tutor, book in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2 px-6 py-6 text-base font-bold border-0 bg-primary text-primary-foreground sm:px-10"
                    data-testid="button-final-cta">
                    Create free account
                  </Button>
                </Link>
                <Link href="/tutors" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full gap-2 px-6 py-6 text-base font-semibold sm:px-10"
                    style={{ borderColor: `rgba(91,111,212,0.3)`, color: BRAND.deep }}>
                    Browse tutors
                  </Button>
                </Link>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative hidden md:flex items-end justify-end overflow-hidden">
              <img
                src="/illus-study.png"
                alt="Student studying"
                className="h-full max-h-[520px] w-full object-cover object-left-bottom"
                style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 20%)" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ background: BRAND.darkBg, borderTop: "1px solid rgba(91,111,212,0.2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-5 sm:gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Insta-Study" className="h-14 w-auto" />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight" style={{ color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Insta<span style={{ color: BRAND.peach }}>Study</span>
                </span>
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase mt-0.5" style={{ color: "rgba(237,186,150,0.5)" }}>
                  Peer Tutoring
                </span>
              </div>
            </div>
            <p className="text-xs tracking-wide text-center" style={{ color: "rgba(237,186,150,0.55)" }}>
              Peer-to-peer tutoring, reimagined.
            </p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs" style={{ color: "rgba(237,186,150,0.55)" }}>
              {[{ href: "/", label: "Home" }, { href: "/tutors", label: "Tutors" }, { href: "/login", label: "Sign in" }, { href: "/register", label: "Register" }].map((link) => (
                <Link key={link.href} href={link.href}
                  className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
