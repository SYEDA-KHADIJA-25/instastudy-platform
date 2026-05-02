import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { BookOpen, CheckCircle, GraduationCap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
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
    defaultValues: { name: "", email: "", password: "" },
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: () => {
        refreshUser();
        setLocation("/dashboard");
      },
      onError: async (error: any) => {
        let message = "Registration failed";
        try {
          const body = await error.json();
          message = body.error || message;
        } catch {}
        toast({ title: "Registration failed", description: message, variant: "destructive" });
      },
    },
  });

  const onSubmit = (data: FormData) => {
    registerMutation.mutate({ data });
  };

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen">
      {/* Left illustration panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
        style={{ background: "#EEF2FF" }}>
        <img
          src="/illus-study.png"
          alt="Student studying on books"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(30,45,135,0.7) 0%, rgba(30,45,135,0.1) 50%, transparent 100%)" }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "rgba(91,111,212,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(91,111,212,0.25)" }}>
                <BookOpen className="h-4 w-4" style={{ color: "#5B6FD4" }} />
              </div>
              <span className="font-bold text-lg" style={{ color: "#0f1240" }}>Insta-Study</span>
            </div>
          </Link>

          <div className="mt-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
                Start your learning<br />journey today.
              </h2>
              <p className="text-white/65 text-sm leading-relaxed mb-8 max-w-sm">
                Join thousands of students mastering new subjects with the help of verified peer tutors.
              </p>
              <div className="flex flex-col gap-3">
                {["Find expert tutors in any subject", "Book sessions in under 2 minutes", "Become a tutor and earn money"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ background: "rgba(237,186,150,0.25)" }}>
                      <CheckCircle className="h-3.5 w-3.5" style={{ color: "#EDBA96" }} />
                    </div>
                    <span className="text-white/80 text-sm">{item}</span>
                  </div>
                ))}
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
            <h1 className="text-2xl font-bold" style={{ color: "#0f1240" }}>Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Free forever. No credit card required.</p>
          </div>

          <div className="rounded-2xl border p-8 shadow-sm" style={{ borderColor: "rgba(91,111,212,0.15)" }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Alex Johnson"
                          autoComplete="name"
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="At least 6 characters"
                          autoComplete="new-password"
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
                  disabled={registerMutation.isPending}
                  data-testid="button-submit-register"
                >
                  {registerMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                  ) : (
                    "Create free account"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline" data-testid="link-login">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
