import { useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetFeaturedTutors,
  getGetFeaturedTutorsQueryKey,
} from "@workspace/api-client-react";
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
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─── Doodle SVG Components ─────────────────────────────────────────────── */

const BookDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 90 70" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M45 14 C45 14, 12 11, 9 56 C9 56, 30 51, 45 58" />
    <path d="M45 14 C45 14, 78 11, 81 56 C81 56, 60 51, 45 58" />
    <line x1="45" y1="14" x2="45" y2="58" />
    <line x1="18" y1="24" x2="36" y2="22" />
    <line x1="17" y1="33" x2="35" y2="31" />
    <line x1="17" y1="42" x2="35" y2="40" />
    <line x1="54" y1="22" x2="72" y2="24" />
    <line x1="55" y1="31" x2="73" y2="33" />
    <line x1="55" y1="40" x2="73" y2="42" />
  </svg>
);

const PencilDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 36 110" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22 L8 86 Q8 90 18 90 Q28 90 28 86 L28 22 Z" />
    <path d="M8 22 L18 4 L28 22" />
    <path d="M18 4 L18 0" />
    <line x1="8" y1="80" x2="28" y2="80" />
    <path d="M8 86 Q13 100 18 106 Q23 100 28 86" />
  </svg>
);

const AtomDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 90 90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="45" cy="45" r="6" fill="currentColor" fillOpacity="0.4" />
    <ellipse cx="45" cy="45" rx="38" ry="16" />
    <ellipse cx="45" cy="45" rx="38" ry="16" transform="rotate(60 45 45)" />
    <ellipse cx="45" cy="45" rx="38" ry="16" transform="rotate(120 45 45)" />
    <circle cx="83" cy="45" r="3" fill="currentColor" />
    <circle cx="26" cy="12" r="3" fill="currentColor" />
    <circle cx="26" cy="78" r="3" fill="currentColor" />
  </svg>
);

const CapDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 90 78" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="45,10 82,32 45,54 8,32" />
    <path d="M22 40 C22 40, 22 60, 45 68 C68 60, 68 40, 68 40" />
    <line x1="82" y1="32" x2="82" y2="55" />
    <path d="M82 55 Q80 62 74 64" />
    <circle cx="74" cy="67" r="3" fill="currentColor" fillOpacity="0.5" />
  </svg>
);

const BulbDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 70 95" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M35 6 C20 6, 10 18, 10 30 C10 42, 18 50, 22 58 L48 58 C52 50, 60 42, 60 30 C60 18, 50 6, 35 6" />
    <line x1="24" y1="64" x2="46" y2="64" />
    <line x1="27" y1="71" x2="43" y2="71" />
    <line x1="30" y1="78" x2="40" y2="78" />
    <line x1="35" y1="2" x2="35" y2="-4" />
    <line x1="16" y1="14" x2="10" y2="8" />
    <line x1="54" y1="14" x2="60" y2="8" />
    <line x1="6" y1="30" x2="0" y2="30" />
    <line x1="64" y1="30" x2="70" y2="30" />
    <path d="M27 35 Q35 25 43 35" strokeDasharray="3 2" />
  </svg>
);

const SparkDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="22" y1="2" x2="22" y2="42" />
    <line x1="2" y1="22" x2="42" y2="22" />
    <line x1="7" y1="7" x2="37" y2="37" />
    <line x1="37" y1="7" x2="7" y2="37" />
  </svg>
);

const FormulaDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 110 44" fill="currentColor">
    <text x="2" y="34" fontSize="32" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" letterSpacing="-1">
      f(x) = ∑
    </text>
  </svg>
);

const CalculatorDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 88" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

const CompassDoodle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 70 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M35 10 L20 60 L35 54 L50 60 Z" />
    <circle cx="35" cy="10" r="5" />
    <line x1="35" y1="15" x2="35" y2="10" />
    <path d="M20 60 L10 90" />
    <path d="M50 60 L60 90" />
    <path d="M10 90 Q12 95 16 93" />
    <path d="M60 90 Q58 95 54 93" />
    <path d="M24 44 Q35 56 46 44" strokeDasharray="3 3" />
  </svg>
);

/* ─── Subjects Marquee ───────────────────────────────────────────────────── */
const SUBJECTS = [
  "📐 Mathematics",
  "⚗️ Chemistry",
  "🧬 Biology",
  "💻 Computer Science",
  "🌍 History",
  "📖 Literature",
  "⚡ Physics",
  "🎨 Art",
  "🎵 Music Theory",
  "💰 Economics",
  "🧠 Psychology",
  "🌐 Languages",
  "📊 Statistics",
  "🧮 Calculus",
  "🔭 Astronomy",
  "✍️ Essay Writing",
];

function Marquee() {
  const repeated = [...SUBJECTS, ...SUBJECTS];
  return (
    <div className="overflow-hidden py-5" style={{ background: "linear-gradient(135deg, hsl(275,85%,55%), hsl(320,85%,60%))" }}>
      <div className="flex animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
        {repeated.map((s, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 mx-5 text-white/90 font-semibold text-sm tracking-wide"
          >
            {s}
            <span className="text-white/40 text-xs">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { data: featuredTutors } = useGetFeaturedTutors({
    query: { queryKey: getGetFeaturedTutorsQueryKey() },
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const d1Y = useTransform(scrollYProgress, [0, 0.4], [0, -180]);
  const d2Y = useTransform(scrollYProgress, [0, 0.4], [0, -130]);
  const d3Y = useTransform(scrollYProgress, [0, 0.4], [0, -220]);
  const d4Y = useTransform(scrollYProgress, [0, 0.4], [0, -100]);
  const d5Y = useTransform(scrollYProgress, [0, 0.4], [0, -160]);
  const d6Y = useTransform(scrollYProgress, [0, 0.4], [0, -90]);
  const d7Y = useTransform(scrollYProgress, [0, 0.4], [0, -200]);
  const d8Y = useTransform(scrollYProgress, [0, 0.4], [0, -150]);

  const heroTextY = useTransform(scrollYProgress, [0, 0.3], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <div className="relative min-h-screen">
      {/* ── Scroll progress bar ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
        style={{
          scaleX,
          background: "linear-gradient(to right, hsl(275,85%,65%), hsl(320,85%,65%))",
        }}
      />

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 md:px-10 backdrop-blur-md"
        style={{ background: "rgba(5,2,16,0.7)", borderBottom: "1px solid rgba(167,139,250,0.12)" }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-pink-500">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Insta-Study</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {[
            { label: "Features", id: "features" },
            { label: "How it Works", id: "how-it-works" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
          <Link href="/tutors" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Browse Tutors
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 border-0 text-white shadow-lg shadow-violet-900/40">
              Get started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #050210 0%, #0d0520 50%, #100318 100%)" }}
      >
        {/* Dot grid texture */}
        <div className="absolute inset-0 hero-grid-bg opacity-100" />
        <div className="absolute inset-0 noise-overlay" />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] rounded-full animate-pulse-glow pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(275,85%,55%,0.22) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full animate-pulse-glow pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(320,85%,60%,0.18) 0%, transparent 70%)", filter: "blur(40px)", animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(260,70%,30%,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />

        {/* ── Floating doodles ── */}
        <motion.div className="absolute top-[12%] left-[6%] animate-float text-violet-400/30 pointer-events-none" style={{ y: d1Y }}>
          <BookDoodle className="w-28 h-20" />
        </motion.div>

        <motion.div className="absolute top-[8%] right-[8%] animate-spin-slow text-pink-400/25 pointer-events-none" style={{ y: d2Y }}>
          <AtomDoodle className="w-32 h-32" />
        </motion.div>

        <motion.div className="absolute bottom-[22%] left-[10%] animate-float-slow text-violet-300/30 pointer-events-none" style={{ y: d3Y }}>
          <BulbDoodle className="w-20 h-28" />
        </motion.div>

        <motion.div className="absolute bottom-[15%] right-[7%] animate-float-drift text-pink-300/30 pointer-events-none" style={{ y: d4Y }}>
          <CapDoodle className="w-28 h-24" />
        </motion.div>

        <motion.div className="absolute top-[30%] right-[12%] animate-float-bob text-violet-400/20 pointer-events-none" style={{ y: d5Y }}>
          <PencilDoodle className="w-10 h-28" />
        </motion.div>

        <motion.div className="absolute top-[55%] left-[14%] animate-float text-pink-300/25 pointer-events-none" style={{ y: d6Y, animationDelay: "1s" }}>
          <FormulaDoodle className="w-32 h-12" />
        </motion.div>

        <motion.div className="absolute top-[18%] left-[35%] animate-float-slow text-violet-300/20 pointer-events-none" style={{ y: d7Y }}>
          <SparkDoodle className="w-8 h-8" />
        </motion.div>

        <motion.div className="absolute bottom-[30%] right-[22%] animate-float text-pink-400/25 pointer-events-none" style={{ y: d8Y, animationDelay: "2s" }}>
          <SparkDoodle className="w-6 h-6" />
        </motion.div>

        <motion.div className="absolute top-[42%] right-[28%] animate-float-drift text-violet-400/20 pointer-events-none" style={{ y: d2Y }}>
          <CompassDoodle className="w-16 h-24" />
        </motion.div>

        <motion.div className="absolute bottom-[40%] left-[28%] animate-float-bob text-pink-300/20 pointer-events-none" style={{ y: d5Y, animationDelay: "3s" }}>
          <CalculatorDoodle className="w-12 h-16" />
        </motion.div>

        {/* ── Hero content ── */}
        <motion.div
          className="relative z-10 mx-auto max-w-5xl px-6 text-center"
          style={{ y: heroTextY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase mb-8"
              style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", color: "rgb(196,181,253)" }}>
              <Sparkles className="h-3 w-3" />
              Peer-to-peer tutoring — reimagined
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl leading-[0.95]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Learn from people
            <br />
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, hsl(280,100%,75%) 0%, hsl(320,100%,75%) 60%, hsl(340,100%,80%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              who actually get it.
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-7 max-w-xl text-lg text-white/55 leading-relaxed"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Connect with verified peer tutors across any subject. Book sessions, grow
            your knowledge — or share what you know and earn.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 px-9 py-6 text-base font-semibold border-0 text-white shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, hsl(275,85%,60%), hsl(320,85%,62%))",
                  boxShadow: "0 0 40px rgba(139,92,246,0.5), 0 4px 24px rgba(0,0,0,0.4)",
                }}
                data-testid="button-cta-get-started"
              >
                Find a tutor
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-9 py-6 text-base font-semibold text-white/80 hover:text-white hover:bg-white/10"
                style={{ borderColor: "rgba(167,139,250,0.4)", background: "rgba(255,255,255,0.04)" }}
                data-testid="button-cta-become-tutor"
              >
                Become a tutor
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            {["No subscription required", "Verified tutors only", "Flexible scheduling"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-violet-400/70" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce-gentle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ArrowDown className="h-4 w-4" />
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #050210)" }} />
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section style={{ background: "#050210" }}>
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "500+", label: "Active tutors", color: "text-violet-400" },
              { value: "10k+", label: "Sessions completed", color: "text-pink-400" },
              { value: "4.8★", label: "Average rating", color: "text-violet-400" },
              { value: "20+", label: "Subjects covered", color: "text-pink-400" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="mt-1 text-sm text-white/40">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Transition band */}
        <div className="h-16" style={{ background: "linear-gradient(to bottom, #050210, #ffffff)" }} />
      </section>

      {/* ══════════════════════════════════════════
          SUBJECTS MARQUEE
      ══════════════════════════════════════════ */}
      <Marquee />

      {/* ══════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════ */}
      <section id="features" className="relative bg-white py-24 overflow-hidden">
        {/* Background doodle accents */}
        <div className="absolute top-8 right-8 text-violet-100 pointer-events-none">
          <AtomDoodle className="w-40 h-40" />
        </div>
        <div className="absolute bottom-8 left-8 text-pink-100 pointer-events-none">
          <BookDoodle className="w-44 h-32" />
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-4"
              style={{ background: "hsl(275,85%,96%)", color: "hsl(275,85%,50%)" }}>
              Why Insta-Study
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 md:text-5xl">
              Built for{" "}
              <span style={{ background: "linear-gradient(135deg, hsl(275,85%,55%), hsl(320,85%,60%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                curious minds
              </span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Everything you need to learn faster, deeper, and on your own terms.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Users,
                doodle: <CapDoodle className="w-14 h-12 text-violet-400" />,
                title: "Expert Peer Tutors",
                desc: "Every tutor is reviewed before going live. Real people who've mastered what you're learning.",
                accent: "from-violet-50 to-violet-100/50",
                border: "border-violet-100",
                iconColor: "text-violet-600",
                iconBg: "bg-violet-100",
              },
              {
                icon: Clock,
                doodle: <CompassDoodle className="w-10 h-14 text-pink-400" />,
                title: "Flexible Scheduling",
                desc: "Tutors set their own hours. You pick what works. Sessions fit around your life, not the other way.",
                accent: "from-pink-50 to-pink-100/50",
                border: "border-pink-100",
                iconColor: "text-pink-600",
                iconBg: "bg-pink-100",
              },
              {
                icon: Zap,
                doodle: <BulbDoodle className="w-10 h-14 text-amber-400" />,
                title: "Instant Booking",
                desc: "Browse profiles, check availability, and lock in your session in under 2 minutes.",
                accent: "from-amber-50 to-yellow-50",
                border: "border-amber-100",
                iconColor: "text-amber-600",
                iconBg: "bg-amber-100",
              },
              {
                icon: Star,
                doodle: <SparkDoodle className="w-10 h-10 text-violet-400" />,
                title: "Ratings & Reviews",
                desc: "Transparent ratings from real students. Every session can be reviewed — no hiding.",
                accent: "from-violet-50 to-purple-50",
                border: "border-violet-100",
                iconColor: "text-violet-600",
                iconBg: "bg-violet-100",
              },
              {
                icon: Shield,
                doodle: <AtomDoodle className="w-14 h-14 text-pink-400" />,
                title: "Safe & Verified",
                desc: "All tutors go through our review process before being approved. Your learning is protected.",
                accent: "from-pink-50 to-rose-50",
                border: "border-pink-100",
                iconColor: "text-pink-600",
                iconBg: "bg-pink-100",
              },
              {
                icon: BookOpen,
                doodle: <CalculatorDoodle className="w-10 h-14 text-emerald-400" />,
                title: "Earn as a Tutor",
                desc: "Set your own rate, set your own hours. Share what you know and get paid for it.",
                accent: "from-emerald-50 to-teal-50",
                border: "border-emerald-100",
                iconColor: "text-emerald-600",
                iconBg: "bg-emerald-100",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className={`group relative h-full rounded-2xl border ${f.border} bg-gradient-to-br ${f.accent} p-6 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1`}>
                  <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-70 transition-opacity">
                    {f.doodle}
                  </div>
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.iconBg}`}>
                    <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-28 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #fdf2f8 50%, #f0fdf4 100%)" }}>

        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, hsl(275,85%,80%), transparent)" }} />

        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold text-gray-900 md:text-5xl">
              From zero to{" "}
              <span style={{ background: "linear-gradient(135deg, hsl(275,85%,55%), hsl(320,85%,60%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                learning in minutes
              </span>
            </h2>
            <p className="mt-4 text-gray-500">No friction. No wait. Just knowledge.</p>
          </motion.div>

          <div className="relative">
            {/* Connecting dashed line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px border-t-2 border-dashed"
              style={{ borderColor: "hsl(275,85%,70%,0.4)" }} />

            <div className="grid gap-12 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Create your account",
                  desc: "Register in seconds. One account for everything — whether you're a student, tutor, or both.",
                  doodle: <PencilDoodle className="w-12 h-32 text-violet-400" />,
                  color: "from-violet-600 to-violet-700",
                },
                {
                  step: "02",
                  title: "Find your tutor",
                  desc: "Browse by subject, filter by rate and rating. Read bios, check real availability.",
                  doodle: <BookDoodle className="w-28 h-20 text-pink-400" />,
                  color: "from-pink-500 to-rose-600",
                },
                {
                  step: "03",
                  title: "Book & learn",
                  desc: "Pick a slot, confirm your booking, and start your session. It really is that simple.",
                  doodle: <SparkDoodle className="w-12 h-12 text-emerald-400" />,
                  color: "from-emerald-500 to-teal-600",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  className="relative flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl text-white font-black text-lg shadow-lg mb-6 bg-gradient-to-br ${item.color}`}>
                    {item.step}
                  </div>
                  <div className="mb-5 h-24 flex items-center justify-center">
                    {item.doodle}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 px-10 py-6 text-base font-semibold text-white border-0 shadow-xl"
                style={{
                  background: "linear-gradient(135deg, hsl(275,85%,55%), hsl(320,85%,60%))",
                  boxShadow: "0 8px 32px rgba(139,92,246,0.4)",
                }}
              >
                Start for free <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED TUTORS
      ══════════════════════════════════════════ */}
      {featuredTutors && featuredTutors.length > 0 && (
        <section className="bg-white py-24">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              className="mb-12 flex items-end justify-between"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div>
                <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ background: "hsl(320,85%,96%)", color: "hsl(320,85%,50%)" }}>
                  Meet your tutors
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900">Top-rated this week</h2>
              </div>
              <Link href="/tutors">
                <Button variant="outline" size="sm" className="gap-1 hidden md:flex">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTutors.slice(0, 3).map((tutor, i) => (
                <motion.div
                  key={tutor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="group overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="h-2 w-full"
                      style={{ background: `linear-gradient(to right, hsl(${275 + i * 22},85%,${55 + i * 3}%), hsl(${320 + i * 10},85%,60%))` }} />
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white text-lg font-bold shadow"
                          style={{ background: `linear-gradient(135deg, hsl(${275 + i * 22},85%,55%), hsl(${320 + i * 10},85%,60%))` }}
                        >
                          {tutor.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 truncate">{tutor.name}</h3>
                          <div className="mt-0.5 flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-gray-500">
                              {tutor.rating ? tutor.rating.toFixed(1) : "New"} · {tutor.reviewCount} reviews
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-bold"
                          style={{ color: "hsl(275,85%,50%)" }}>
                          ${tutor.hourlyRate}/hr
                        </span>
                      </div>

                      {tutor.bio && (
                        <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">{tutor.bio}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tutor.subjects.slice(0, 3).map((s) => (
                          <span key={s} className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ background: "hsl(275,85%,97%)", color: "hsl(275,85%,50%)" }}>
                            {s}
                          </span>
                        ))}
                      </div>

                      <Link href={`/tutors/${tutor.id}`} className="block mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full group-hover:text-white group-hover:border-transparent transition-all"
                          style={{} as React.CSSProperties}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, hsl(${275 + i * 22},85%,55%), hsl(${320 + i * 10},85%,60%))`;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "";
                          }}
                          data-testid={`button-view-tutor-${tutor.id}`}
                        >
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
          TESTIMONIALS (dark)
      ══════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0a0418 0%, #130828 50%, #0c041a 100%)" }}>

        <div className="absolute inset-0 hero-grid-bg opacity-50" />

        {/* Doodle accents */}
        <div className="absolute top-10 left-10 text-violet-800/40 pointer-events-none">
          <SparkDoodle className="w-10 h-10" />
        </div>
        <div className="absolute bottom-10 right-12 text-pink-800/40 pointer-events-none">
          <SparkDoodle className="w-8 h-8" />
        </div>
        <div className="absolute top-1/2 left-6 text-violet-800/30 pointer-events-none">
          <BookDoodle className="w-28 h-20" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold text-white md:text-5xl">
              Real students.{" "}
              <span style={{ background: "linear-gradient(135deg, hsl(280,100%,75%), hsl(320,100%,75%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Real results.
              </span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Priya S.", subject: "Calculus", grade: "C → A", text: "My tutor explained integration in a way that finally clicked. Went from a C to an A in one month. I actually look forward to math now.", avatar: "P", color: "from-violet-600 to-purple-700" },
              { name: "Marcus L.", subject: "Python", grade: "Got internship", text: "Found an amazing CS tutor who helped me land my first internship. The mock interviews were gold. Couldn't have done it without Insta-Study.", avatar: "M", color: "from-pink-500 to-rose-600" },
              { name: "Emma T.", subject: "Chemistry", grade: "Passed finals", text: "Flexible scheduling was a lifesaver. Booked late-night sessions before exams — my tutor was always there. Passed with a B+!", avatar: "E", color: "from-emerald-500 to-teal-600" },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="h-full rounded-2xl p-6 flex flex-col"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.15)", backdropFilter: "blur(12px)" }}>
                  <div className="text-5xl font-serif text-violet-400/40 mb-4 leading-none">"</div>
                  <p className="text-white/70 text-sm leading-relaxed flex-1 italic">{t.text}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-white font-bold text-sm`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-white/40 text-xs">{t.subject} · <span className="text-emerald-400">{t.grade}</span></p>
                    </div>
                    <div className="ml-auto flex">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
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
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(275,85%,52%) 0%, hsl(295,80%,50%) 40%, hsl(320,85%,58%) 100%)" }}>

        {/* Doodles */}
        <div className="absolute top-8 left-8 text-white/10 pointer-events-none animate-float">
          <AtomDoodle className="w-32 h-32" />
        </div>
        <div className="absolute bottom-8 right-8 text-white/10 pointer-events-none animate-float-slow">
          <CapDoodle className="w-32 h-28" />
        </div>
        <div className="absolute top-1/2 left-[5%] -translate-y-1/2 text-white/8 pointer-events-none animate-float-drift">
          <FormulaDoodle className="w-40 h-16" />
        </div>
        <div className="absolute top-1/3 right-[8%] text-white/10 pointer-events-none animate-float-bob">
          <PencilDoodle className="w-10 h-28" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-white md:text-6xl leading-tight mb-5">
              Your next breakthrough<br />starts here.
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of students who stopped struggling alone. Find your tutor, book in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="gap-2 px-10 py-6 text-base font-bold border-0 text-violet-700"
                  style={{ background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
                  data-testid="button-final-cta"
                >
                  Create free account
                </Button>
              </Link>
              <Link href="/tutors">
                <Button
                  size="lg"
                  className="gap-2 px-10 py-6 text-base font-semibold text-white"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}
                >
                  Browse tutors
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ background: "#050210", borderTop: "1px solid rgba(167,139,250,0.12)" }}>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-pink-500">
                <BookOpen className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-white">Insta-Study</span>
            </div>
            <p className="text-sm text-white/30">Peer-to-peer tutoring, reimagined.</p>
            <div className="flex gap-6 text-sm text-white/40">
              {[
                { href: "/", label: "Home" },
                { href: "/tutors", label: "Tutors" },
                { href: "/login", label: "Sign in" },
                { href: "/register", label: "Register" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
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
