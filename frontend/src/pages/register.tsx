import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/components/auth-provider";
import { getFirebaseAuth } from "@/lib/firebase";
import { defaultHomePath } from "@/lib/auth-utils";
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
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  useEffect(() => {
    if (!isLoading && user) {
      setLocation(defaultHomePath(user));
    }
  }, [user, isLoading, setLocation]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(cred.user, { displayName: data.name });
    } catch (e: unknown) {
      const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
      let message = "Registration failed";
      if (code === "auth/email-already-in-use") message = "This email is already registered.";
      toast({ title: "Registration failed", description: message, variant: "destructive" });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
      if (code === "auth/popup-closed-by-user") return;
      toast({ title: "Google sign-up failed", variant: "destructive" });
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
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col" style={{ background: "#EEF2FF" }}>
        <img
          src="/illus-study.png"
          alt="Student studying on books"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(30,45,135,0.7) 0%, rgba(30,45,135,0.1) 50%, transparent 100%)",
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
                Start your learning
                <br />
                journey today.
              </h2>
              <p className="text-white/65 text-sm leading-relaxed mb-8 max-w-sm">
                Join students mastering new subjects with verified peer tutors.
              </p>
              <div className="flex flex-col gap-3">
                {["Find expert tutors in any subject", "Book sessions in minutes", "Become a tutor and earn"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(237,186,150,0.25)" }}>
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
              Create your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Free forever. No credit card required.</p>
          </div>

          <div className="rounded-2xl border p-5 shadow-sm sm:p-8" style={{ borderColor: "rgba(91,111,212,0.15)" }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Alex Johnson" autoComplete="name" data-testid="input-name" {...field} />
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
                        <Input type="email" placeholder="you@example.com" autoComplete="email" data-testid="input-email" {...field} />
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

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting} data-testid="button-submit-register">
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                    </>
                  ) : (
                    "Create free account"
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
              Continue with Google
            </Button>
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
