import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { useGetFeaturedTutors } from "@workspace/api-client-react";
import { Star, BookOpen, Users, Clock, ChevronRight, CheckCircle, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function LandingPage() {
  const { data: featuredTutors } = useGetFeaturedTutors();

  return (
    <div className="min-h-screen bg-background">
      {/* Custom navbar with smooth scroll */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Insta-Study</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={() => scrollToSection("features")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How it Works
          </button>
          <Link href="/tutors" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Browse Tutors
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" data-testid="button-nav-login">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" data-testid="button-nav-register">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(275_85%_55%/0.12),transparent)]" />
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-56 w-56 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div {...fadeUp}>
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1 text-xs font-medium">
              Peer-to-peer tutoring platform
            </Badge>
          </motion.div>

          <motion.h1
            className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Learn from people who{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              actually get it
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Connect with expert peer tutors across any subject. Book sessions, manage availability,
            and grow — whether you are a student, a tutor, or both.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25" data-testid="button-cta-get-started">
                Find a tutor
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="gap-2 px-8" data-testid="button-cta-become-tutor">
                Become a tutor
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {["No subscription required", "Verified tutors", "Flexible scheduling"].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                {text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-muted/20 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "500+", label: "Active tutors" },
              { value: "10k+", label: "Sessions completed" },
              { value: "4.8★", label: "Average rating" },
              { value: "20+", label: "Subjects covered" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Everything you need to learn better
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built for students and tutors who value their time
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Users,
                title: "Expert Peer Tutors",
                desc: "Connect with verified tutors across mathematics, sciences, languages, and more. Every tutor is reviewed before going live.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: Clock,
                title: "Flexible Scheduling",
                desc: "Book sessions around your schedule. Tutors set their own availability, you pick what works for you.",
                color: "text-secondary",
                bg: "bg-secondary/10",
              },
              {
                icon: Zap,
                title: "Instant Booking",
                desc: "Browse profiles, check availability, and book your session in under two minutes — no back-and-forth.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: Star,
                title: "Ratings & Reviews",
                desc: "Transparent ratings help you pick the right tutor. Every completed session can be reviewed.",
                color: "text-secondary",
                bg: "bg-secondary/10",
              },
              {
                icon: Shield,
                title: "Safe & Verified",
                desc: "All tutors go through a review process before being approved. Your learning experience is protected.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: BookOpen,
                title: "Earn as a Tutor",
                desc: "Set your own rate and schedule. Apply in minutes and start earning by sharing what you know.",
                color: "text-secondary",
                bg: "bg-secondary/10",
              },
            ].map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="h-full border-card-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg}`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-card-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Up and running in minutes</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Create your account", desc: "Register in seconds — no role selection needed. One account for everything, whether you're a student, tutor, or both." },
              { step: "02", title: "Find your tutor", desc: "Search by subject, filter by rate and rating. Browse profiles, read bios, and check availability before booking." },
              { step: "03", title: "Book and learn", desc: "Pick a time slot that works for you, confirm your booking, and start learning right away." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="relative"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-5xl font-extrabold text-primary/10 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/register">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                Get started for free <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Tutors */}
      {featuredTutors && featuredTutors.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Top tutors</h2>
                <p className="mt-1 text-muted-foreground">Highly rated and ready to help</p>
              </div>
              <Link href="/tutors">
                <Button variant="outline" size="sm" className="gap-1">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTutors.slice(0, 3).map((tutor) => (
                <motion.div
                  key={tutor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="group overflow-hidden border-card-border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-bold">
                          {tutor.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-card-foreground truncate">{tutor.name}</h3>
                          <div className="mt-0.5 flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-muted-foreground">
                              {tutor.rating ? tutor.rating.toFixed(1) : "New"} · {tutor.reviewCount} reviews
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-primary">
                          ${tutor.hourlyRate}/hr
                        </span>
                      </div>

                      {tutor.bio && (
                        <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{tutor.bio}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tutor.subjects.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
                            {s}
                          </Badge>
                        ))}
                      </div>

                      <Link href={`/tutors/${tutor.id}`} className="block mt-4">
                        <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors" data-testid={`button-view-tutor-${tutor.id}`}>
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

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground">What students say</h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Priya S.", subject: "Calculus", text: "My tutor explained integration in a way that finally clicked. Went from a C to an A in one month.", rating: 5 },
              { name: "Marcus L.", subject: "Python", text: "Found an amazing CS tutor who helped me land my first internship. Couldn't have done it without Insta-Study.", rating: 5 },
              { name: "Emma T.", subject: "Chemistry", text: "Flexible scheduling was a lifesaver. I could book sessions around my busy schedule.", rating: 5 },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-card-border">
                  <CardContent className="p-6">
                    <div className="flex mb-3">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.subject} student</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 border border-border p-10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Ready to get started?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of students and tutors. Free to register, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" data-testid="button-final-cta">
                    Create free account
                  </Button>
                </Link>
                <Link href="/tutors">
                  <Button size="lg" variant="outline">
                    Browse tutors
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Insta-Study</span>
            </div>
            <p className="text-sm text-muted-foreground">Peer-to-peer tutoring made simple.</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link href="/tutors" className="hover:text-foreground transition-colors">Tutors</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
