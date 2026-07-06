import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/components/auth-provider";
import { getFirebaseAuth } from "@/lib/firebase";
import { defaultHomePath } from "@/lib/auth-utils";
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
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  useEffect(() => {
    if (!isLoading && user) {
      setLocation(defaultHomePath(user));
    }
  }, [user, isLoading, setLocation]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (e: unknown) {
      const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
      const message =
        code === "auth/invalid-credential" || code === "auth/wrong-password"
          ? "Invalid email or password"
          : "Sign in failed. Please try again.";
      toast({ title: "Sign in failed", description: message, variant: "destructive" });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
      const msg  = e instanceof Error ? e.message : "";
      // Ignore user-cancelled and Firebase internal assertion errors
      if (code === "auth/popup-closed-by-user") return;
      if (msg.includes("INTERNAL ASSERTION FAILED")) return;
      toast({ title: "Google sign-in failed", variant: "destructive" });
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col" style={{ background: "#1e2d87" }}>
        <img
          src="/illus-browse.png"
          alt="Student browsing tutors"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(30,45,135,0.82) 0%, rgba(30,45,135,0.35) 55%, rgba(30,45,135,0.15) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src="/logo.png" alt="Insta-Study" className="h-11 w-auto" />
            </div>
          </Link>

          <div className="mt-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
                Find your perfect tutor
                <br />
                in minutes.
              </h2>
              <p className="text-white/65 text-sm leading-relaxed mb-8 max-w-sm">
                Browse verified peer tutors, filter by subject and rate — then book instantly.
              </p>
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <div className="flex -space-x-2">
                  {["S", "M", "E"].map((l, i) => (
                    <div
                      key={i}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/30 font-bold text-xs text-white"
                      style={{ background: i === 0 ? "#5B6FD4" : i === 1 ? "#EDBA96" : "#7B8FE8" }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">Loved by students</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white px-4 py-10 sm:px-6 sm:py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Link href="/" className="lg:hidden mb-4">
              <img src="/logo.png" alt="Insta-Study" className="h-13 w-auto" />
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: "#0f1240" }}>
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your Insta-Study account</p>
          </div>

          <div className="rounded-2xl border p-5 shadow-sm sm:p-8" style={{ borderColor: "rgba(91,111,212,0.15)" }}>
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

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting} data-testid="button-submit-login">
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full gap-2" onClick={() => void signInWithGoogle()}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline" data-testid="link-register">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
