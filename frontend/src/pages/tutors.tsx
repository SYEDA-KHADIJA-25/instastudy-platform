import { useState } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListTutors } from "@/hooks/use-firestore";
import { Search, Star, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePublicNavOrAppLayout } from "@/hooks/use-layout";
import { studentPrice } from "@/lib/commission";

export default function TutorsPage() {
  const Layout = usePublicNavOrAppLayout();
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [maxRate, setMaxRate] = useState<number | undefined>();

  const params: Record<string, string | number> = {};
  if (search) params.search = search;
  if (subject && subject !== "all") params.subject = subject;
  if (maxRate) params.maxRate = maxRate;

  const { data: tutors, isLoading } = useListTutors(params);

  const clearFilters = () => {
    setSearch("");
    setSubject("");
    setMaxRate(undefined);
  };

  const hasFilters = search || (subject && subject !== "all") || maxRate;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Find a tutor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse expert tutors across any subject</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-tutors"
            />
          </div>

          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full sm:w-44" data-testid="select-subject-filter">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="History">History</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="French">French</SelectItem>
            </SelectContent>
          </Select>

          <Select value={maxRate?.toString() || "any"} onValueChange={(v) => setMaxRate(v && v !== "any" ? parseInt(v) : undefined)}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-rate-filter">
              <SelectValue placeholder="Any rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any rate</SelectItem>
              <SelectItem value="400">Up to Rs 400/hr</SelectItem>
              <SelectItem value="500">Up to Rs 500/hr</SelectItem>
              <SelectItem value="700">Up to Rs 700/hr</SelectItem>
              <SelectItem value="900">Up to Rs 900/hr</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0" data-testid="button-clear-filters">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Results count */}
        {!isLoading && tutors && (
          <p className="mb-4 text-sm text-muted-foreground">
            {tutors.length} tutor{tutors.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Tutor list */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : tutors && tutors.length > 0 ? (
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          >
            <AnimatePresence>
              {tutors.map((tutor) => (
                <motion.div
                  key={tutor.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                >
                  <Card className="group h-full border-card-border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5" data-testid={`tutor-card-${tutor.id}`}>
                    <CardContent className="flex h-full flex-col p-5">
                      <div className="flex items-start gap-3">
                        {tutor.avatarUrl ? (
                          <img
                            src={tutor.avatarUrl}
                            alt={tutor.name}
                            className="h-12 w-12 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-bold">
                            {tutor.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-card-foreground truncate">{tutor.name}</h3>
                          <div className="mt-0.5 flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-muted-foreground">
                              {tutor.rating ? tutor.rating.toFixed(1) : "New"} · {tutor.reviewCount} reviews
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-primary">Rs {studentPrice(tutor.hourlyRate)}/hr</span>
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
                        {tutor.subjects.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                            +{tutor.subjects.length - 3}
                          </Badge>
                        )}
                      </div>

                      {tutor.experience && (
                        <p className="mt-2 text-xs text-muted-foreground">{tutor.experience}</p>
                      )}

                      <div className="mt-auto pt-4">
                        <Link href={`/tutors/${tutor.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                            data-testid={`button-view-tutor-${tutor.id}`}
                          >
                            View profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground">No tutors found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters ? "Try adjusting your filters." : "No approved tutors yet."}
            </p>
            {hasFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2 text-primary">
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
