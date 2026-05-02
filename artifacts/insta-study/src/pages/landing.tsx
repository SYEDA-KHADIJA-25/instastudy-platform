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

/* ─── Brand tokens ───────────────────────────────────────────────────────── */
const BRAND = {
  deep:       "#33006F",                                                    // primary dark purple
  lavender:   "#CDACDB",                                                    // soft lavender accent
  pink:       "#FF7EB3",                                                    // button pink end
  purple:     "#8B7BFF",                                                    // button purple end
  btnGrad:    "linear-gradient(135deg, #FF7EB3 0%, #8B7BFF 100%)",          // primary button fill
  darkBg:     "#0a0118",                                                    // hero / footer bg
  lightBg:    "#F7F0FB",                                                    // tinted section bg
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
  "📐 Mathematics", "⚗️ Chemistry", "🧬 Biology", "💻 Computer Science",
  "🌍 History", "📖 Literature", "⚡ Physics", "🎨 Art",
  "🎵 Music Theory", "💰 Economics", "🧠 Psychology", "🌐 Languages",
  "📊 Statistics", "🧮 Calculus", "🔭 Astronomy", "✍️ Essay Writing",
];

function Marquee() {
  const repeated = [...SUBJECTS, ...SUBJECTS];
  return (
    <div className="overflow-hidden py-4" style={{ background: BRAND.deep }}>
      <div className="flex animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
        {repeated.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6 text-sm font-semibold tracking-wide"
            style={{ color: BRAND.lavender }}>
            {s}
            <span style={{ color: "rgba(205,172,219,0.3)", fontSize: 10 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Landing Page ────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { data: featuredTutors } = useGetFeaturedTutors({
    query: { queryKey: getGetFeaturedTutorsQueryKey() },
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="relative min-h-screen">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
        style={{ scaleX, background: BRAND.lavender }}
      />

      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 md:px-10 backdrop-blur-md"
        style={{ background: "rgba(10,1,24,0.75)", borderBottom: `1px solid rgba(205,172,219,0.15)` }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: BRAND.deep }}>
            <BookOpen className="h-4 w-4" style={{ color: BRAND.lavender }} />
          </div>
          <span className="text-lg font-bold text-white">Insta-Study</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {[{ label: "Features", id: "features" }, { label: "How it Works", id: "how-it-works" }].map((item) => (
            <button key={item.id} onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.55)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}>
              {item.label}
            </button>
          ))}
          <Link href="/tutors" className="text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.55)" }}>
            Browse Tutors
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="border-0 font-semibold"
              style={{ background: BRAND.deep, color: "#fff", boxShadow: "0 2px 12px rgba(51,0,111,0.4)" }}>
              Get started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: BRAND.darkBg }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 hero-grid-bg opacity-70" />
        <div className="absolute inset-0 noise-overlay" />

        {/* Two intentional glows — anchored, not scattered */}
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(51,0,111,0.55) 0%, transparent 65%)", filter: "blur(72px)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,123,255,0.14) 0%, transparent 70%)", filter: "blur(60px)" }} />

        {/* Fine horizontal rule — top edge texture */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(to right, transparent 0%, rgba(205,172,219,0.2) 40%, rgba(205,172,219,0.2) 60%, transparent 100%)` }} />

        {/* ── Split layout ── */}
        <motion.div
          className="relative z-10 mx-auto w-full max-w-4xl px-8 md:px-12 pt-32 pb-20 flex flex-col items-center text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Eyebrow badge */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase mb-9"
              style={{ background: "rgba(205,172,219,0.09)", border: "1px solid rgba(205,172,219,0.22)", color: BRAND.lavender }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse-glow" style={{ background: BRAND.lavender }} />
              Verified peer tutors
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-extrabold tracking-tight text-white leading-[1.02] w-full"
            style={{ fontSize: "clamp(44px, 6vw, 80px)" }}
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            The smarter way<br />
            to master{" "}
            <span className="relative inline-block">
              <span style={{ color: BRAND.lavender }}>any subject.</span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full"
                style={{ background: `linear-gradient(to right, ${BRAND.lavender}, transparent)` }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.8 }}
              />
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            className="mt-6 text-base leading-relaxed max-w-lg"
            style={{ color: "rgba(255,255,255,0.42)" }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
          >
            Connect with peer tutors who've mastered what you're learning.
            Book a session in minutes — or earn by sharing what you know.
          </motion.p>

          {/* CTA row */}
          <motion.div
            className="mt-9 flex items-center justify-center gap-5 flex-wrap"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36 }}
          >
            <Link href="/register">
              <Button size="lg"
                className="gap-2 px-8 py-5 text-sm font-bold border-0 h-auto"
                style={{ background: BRAND.deep, color: "#fff", boxShadow: "0 4px 24px rgba(51,0,111,0.55)" }}
                data-testid="button-cta-get-started">
                Find a tutor <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/register">
              <button
                className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.5)" }}
                data-testid="button-cta-become-tutor"
              >
                Become a tutor
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="mt-10 flex items-center justify-center gap-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          >
            <div className="flex -space-x-2.5">
              {["S", "M", "A", "R", "K"].map((l, i) => (
                <div key={l}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold text-white"
                  style={{ background: `hsl(${265 + i * 18}, 70%, ${30 + i * 6}%)`, borderColor: BRAND.darkBg }}>
                  {l}
                </div>
              ))}
            </div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
              <span className="font-semibold text-white">500+</span> active tutors ·{" "}
              <span className="font-semibold text-white">4.8★</span> avg rating
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{ color: "rgba(205,172,219,0.3)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
        >
          <span className="text-[9px] tracking-widest uppercase font-semibold">Scroll</span>
          <ArrowDown className="h-3.5 w-3.5 animate-bounce-gentle" />
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${BRAND.darkBg})` }} />
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section style={{ background: BRAND.darkBg }}>
        <div className="mx-auto max-w-5xl px-6 py-10 border-t" style={{ borderColor: "rgba(205,172,219,0.12)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Active tutors" },
              { value: "10k+", label: "Sessions completed" },
              { value: "4.8★", label: "Average rating" },
              { value: "20+", label: "Subjects covered" },
            ].map((s, i) => (
              <motion.div key={s.label} className="text-center"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <p className="text-3xl font-extrabold" style={{ color: BRAND.lavender }}>{s.value}</p>
                <p className="mt-1 text-xs font-medium tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section id="features" className="relative bg-white py-24 overflow-hidden">
        <div className="absolute top-6 right-6 pointer-events-none" style={{ color: BRAND.lavender, opacity: 0.3 }}>
          <AtomDoodle className="w-36 h-36" />
        </div>
        <div className="absolute bottom-6 left-6 pointer-events-none" style={{ color: BRAND.lavender, opacity: 0.25 }}>
          <BookDoodle className="w-40 h-28" />
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-4"
              style={{ background: BRAND.lightBg, color: BRAND.deep }}>
              Why Insta-Study
            </span>
            <h2 className="text-4xl font-extrabold md:text-5xl" style={{ color: BRAND.deep }}>
              Built for curious minds
            </h2>
            <p className="mt-4 max-w-lg mx-auto text-sm leading-relaxed" style={{ color: "#666" }}>
              Everything you need to learn faster, deeper, and on your own terms.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
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
                <div className="group relative h-full rounded-2xl p-6 overflow-hidden border transition-all hover:shadow-xl hover:-translate-y-1"
                  style={{ background: f.bg, borderColor: `rgba(205,172,219,0.35)` }}>
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
      <section id="how-it-works" className="relative py-28 overflow-hidden"
        style={{ background: BRAND.lightBg }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${BRAND.lavender}, transparent)` }} />

        <div className="mx-auto max-w-5xl px-6">
          <motion.div className="text-center mb-20"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-extrabold md:text-5xl" style={{ color: BRAND.deep }}>
              From zero to learning <span style={{ color: BRAND.pink }}>in minutes</span>
            </h2>
            <p className="mt-4 text-sm" style={{ color: "#666" }}>No friction. No wait. Just knowledge.</p>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-[52px] left-[16.67%] right-[16.67%] h-px border-t-2 border-dashed"
              style={{ borderColor: `rgba(205,172,219,0.6)` }} />

            <div className="grid gap-12 md:grid-cols-3">
              {[
                { step: "01", title: "Create your account",  desc: "Register in seconds. One account for both students and tutors.", doodle: <PencilDoodle className="w-10 h-28" />, color: BRAND.deep },
                { step: "02", title: "Find your tutor",      desc: "Browse by subject, filter by rate and rating. Read real profiles.", doodle: <BookDoodle className="w-28 h-20" />, color: BRAND.purple },
                { step: "03", title: "Book & learn",         desc: "Pick a slot, confirm your booking, show up ready to learn.", doodle: <SparkDoodle className="w-12 h-12" />, color: BRAND.pink },
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
                  <h3 className="text-lg font-bold mb-2" style={{ color: BRAND.deep }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#666" }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div className="mt-16 text-center"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Link href="/register">
              <Button size="lg" className="gap-2 px-10 py-6 text-base font-bold border-0"
                style={{ background: BRAND.deep, color: BRAND.lavender, boxShadow: "0 6px 28px rgba(51,0,111,0.35)" }}>
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
            <motion.div className="mb-12 flex items-end justify-between"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div>
                <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ background: BRAND.lightBg, color: BRAND.deep }}>
                  Meet your tutors
                </span>
                <h2 className="text-3xl font-extrabold" style={{ color: BRAND.deep }}>Top-rated this week</h2>
              </div>
              <Link href="/tutors">
                <Button variant="outline" size="sm" className="gap-1 hidden md:flex"
                  style={{ borderColor: `rgba(51,0,111,0.25)`, color: BRAND.deep }}>
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTutors.slice(0, 3).map((tutor, i) => (
                <motion.div key={tutor.id} initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}>
                  <Card className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
                    style={{ border: `1px solid rgba(205,172,219,0.4)` }}>
                    <div className="h-1.5 w-full" style={{ background: i % 2 === 0 ? BRAND.deep : BRAND.purple }} />
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold shadow-sm"
                          style={{ background: BRAND.deep }}>
                          {tutor.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold truncate" style={{ color: BRAND.deep }}>{tutor.name}</h3>
                          <div className="mt-0.5 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-gray-400">
                              {tutor.rating ? tutor.rating.toFixed(1) : "New"} · {tutor.reviewCount} reviews
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-bold" style={{ color: BRAND.pink }}>
                          ${tutor.hourlyRate}/hr
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
                          style={{ borderColor: `rgba(51,0,111,0.3)`, color: BRAND.deep }}
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
      <section className="relative py-28 overflow-hidden" style={{ background: BRAND.deep }}>
        <div className="absolute inset-0 hero-grid-bg opacity-40" />

        <div className="absolute top-8 left-8 pointer-events-none animate-float"
          style={{ color: BRAND.lavender, opacity: 0.15 }}>
          <SparkDoodle className="w-10 h-10" />
        </div>
        <div className="absolute bottom-8 right-10 pointer-events-none animate-float-slow"
          style={{ color: BRAND.lavender, opacity: 0.15 }}>
          <SparkDoodle className="w-8 h-8" />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 left-6 pointer-events-none"
          style={{ color: BRAND.lavender, opacity: 0.12 }}>
          <BookDoodle className="w-28 h-20" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-extrabold text-white md:text-5xl">
              Real students.{" "}
              <span style={{ color: BRAND.lavender }}>Real results.</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Priya S.",  subject: "Calculus",  result: "C → A",         avatar: "P", text: "My tutor explained integration in a way that finally clicked. Went from a C to an A in one month. I actually look forward to math now." },
              { name: "Marcus L.", subject: "Python",    result: "Got internship", avatar: "M", text: "Found an amazing CS tutor who helped me land my first internship. The mock interviews were gold. Couldn't have done it without Insta-Study." },
              { name: "Emma T.",   subject: "Chemistry", result: "Passed finals",  avatar: "E", text: "Flexible scheduling was a lifesaver. Booked late-night sessions before exams — my tutor was always there. Passed with a B+!" },
            ].map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <div className="h-full rounded-2xl p-6 flex flex-col"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid rgba(205,172,219,0.2)`, backdropFilter: "blur(8px)" }}>
                  <div className="text-4xl font-serif mb-4 leading-none" style={{ color: BRAND.lavender, opacity: 0.5 }}>"</div>
                  <p className="text-sm leading-relaxed flex-1 italic" style={{ color: "rgba(255,255,255,0.65)" }}>{t.text}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm"
                      style={{ background: BRAND.pink, color: BRAND.deep }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-xs" style={{ color: BRAND.lavender, opacity: 0.7 }}>
                        {t.subject} · <span style={{ color: BRAND.pink }}>{t.result}</span>
                      </p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
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
      <section className="relative py-32 overflow-hidden bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${BRAND.lightBg} 0%, transparent 70%)` }} />

        <div className="absolute top-10 left-8 pointer-events-none animate-float"
          style={{ color: BRAND.lavender, opacity: 0.5 }}>
          <AtomDoodle className="w-28 h-28" />
        </div>
        <div className="absolute bottom-10 right-10 pointer-events-none animate-float-slow"
          style={{ color: BRAND.lavender, opacity: 0.4 }}>
          <CapDoodle className="w-28 h-24" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: BRAND.lightBg }}>
              <Sparkles className="h-6 w-6" style={{ color: BRAND.deep }} />
            </div>
            <h2 className="text-4xl font-extrabold md:text-[56px] leading-tight mb-5" style={{ color: BRAND.deep }}>
              Your next breakthrough
              <br />starts here.
            </h2>
            <p className="text-base mb-10 max-w-lg mx-auto" style={{ color: "#666" }}>
              Join thousands of students who stopped struggling alone. Find your tutor, book in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-10 py-6 text-base font-bold border-0"
                  style={{ background: BRAND.deep, color: "#fff", boxShadow: "0 6px 28px rgba(51,0,111,0.4)" }}
                  data-testid="button-final-cta">
                  Create free account
                </Button>
              </Link>
              <Link href="/tutors">
                <Button size="lg" variant="outline" className="gap-2 px-10 py-6 text-base font-semibold"
                  style={{ borderColor: `rgba(51,0,111,0.3)`, color: BRAND.deep }}>
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
      <footer style={{ background: BRAND.darkBg, borderTop: `1px solid rgba(205,172,219,0.12)` }}>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: BRAND.deep }}>
                <BookOpen className="h-3.5 w-3.5" style={{ color: BRAND.lavender }} />
              </div>
              <span className="font-bold text-white">Insta-Study</span>
            </div>
            <p className="text-xs tracking-wide" style={{ color: "rgba(205,172,219,0.4)" }}>
              Peer-to-peer tutoring, reimagined.
            </p>
            <div className="flex gap-6 text-xs" style={{ color: "rgba(205,172,219,0.4)" }}>
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
