import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { BookOpen, GraduationCap, Loader2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading, refreshUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        refreshUser();
        setLocation("/dashboard");
      },
      onError: async (error: any) => {
        let message = "Invalid email or password";
        try {
          const body = await error.json();
          message = body.error || message;
        } catch {}
        toast({ title: "Sign in failed", description: message, variant: "destructive" });
      },
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate({ data });
  };

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen">
      {/* Left illustration panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
        style={{ background: "#1e2d87" }}>
        <img
          src="/illus-browse.png"
          alt="Student browsing tutors"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(30,45,135,0.82) 0%, rgba(30,45,135,0.35) 55%, rgba(30,45,135,0.15) 100%)" }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
                <BookOpen className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Insta-Study</span>
            </div>
          </Link>

          <div className="mt-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
                Find your perfect tutor<br />in minutes.
              </h2>
              <p className="text-white/65 text-sm leading-relaxed mb-8 max-w-sm">
                Browse hundreds of verified peer tutors, filter by subject, rate, and availability — then book instantly.
              </p>
              <div className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div className="flex -space-x-2">
                  {["S", "M", "E"].map((l, i) => (
                    <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/30 font-bold text-xs text-white"
                      style={{ background: i === 0 ? "#5B6FD4" : i === 1 ? "#EDBA96" : "#7B8FE8" }}>
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">Loved by 2,000+ students</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Link href="/" className="lg:hidden mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 cursor-pointer">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: "#0f1240" }}>Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your Insta-Study account</p>
          </div>

          <div className="rounded-2xl border p-8 shadow-sm" style={{ borderColor: "rgba(91,111,212,0.15)" }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit-login"
                >
                  {loginMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline" data-testid="link-register">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
