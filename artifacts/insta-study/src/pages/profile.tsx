import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useGetMe, useUpdateUser, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { User, GraduationCap, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || "", bio: user?.bio || "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({ name: user.name, bio: user.bio || "" });
    }
  }, [user?.id]);

  const updateMutation = useUpdateUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        refreshUser();
        toast({ title: "Profile updated" });
      },
      onError: () => {
        toast({ title: "Failed to update profile", variant: "destructive" });
      },
    },
  });

  const onSubmit = (data: FormData) => {
    if (!user) return;
    updateMutation.mutate({
      userId: user.id,
      data: { name: data.name, bio: data.bio },
    });
  };

  const tutorStatusConfig = {
    none: null,
    pending: { label: "Application pending review", color: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock },
    approved: { label: "Approved tutor", color: "text-green-700 bg-green-50 border-green-200", icon: CheckCircle },
    rejected: { label: "Application not approved", color: "text-red-700 bg-red-50 border-red-200", icon: null },
  };

  const tutorStatus = tutorStatusConfig[user?.tutorStatus as keyof typeof tutorStatusConfig];

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Your profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your personal information</p>
          </div>

          {/* Avatar */}
          <Card className="mb-6 border-card-border">
            <CardContent className="flex items-center gap-5 p-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold shadow-md">
                {user?.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {tutorStatus && (
                  <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tutorStatus.color}`}>
                    {tutorStatus.icon && <tutorStatus.icon className="h-3 w-3" />}
                    {tutorStatus.label}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit form */}
          <Card className="mb-6 border-card-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" /> Personal information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input data-testid="input-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <label className="text-sm font-medium text-foreground">Email address</label>
                    <Input value={user?.email || ""} disabled className="mt-1 bg-muted text-muted-foreground" />
                    <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed.</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio (optional)</FormLabel>
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

                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {updateMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Tutor status */}
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-primary" /> Tutor status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.tutorStatus === "none" || !user?.tutorStatus ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">You are not a tutor yet.</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Apply to share your knowledge and earn.</p>
                  </div>
                  <Link href="/become-tutor">
                    <Button variant="outline" size="sm" data-testid="button-apply-tutor">
                      Apply now
                    </Button>
                  </Link>
                </div>
              ) : user?.tutorStatus === "pending" ? (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <p className="text-sm text-muted-foreground">Application under review — we'll notify you soon.</p>
                </div>
              ) : user?.tutorStatus === "approved" ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-foreground font-medium">Approved tutor</p>
                  </div>
                  <Link href="/availability">
                    <Button variant="outline" size="sm" data-testid="button-manage-availability">
                      Manage slots
                    </Button>
                  </Link>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
