import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { defaultHomePath } from "@/lib/auth-utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireApprovedTutor?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireApprovedTutor }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLocation("/login");
      return;
    }
    if (requireAdmin && user.role !== "admin") {
      setLocation(defaultHomePath(user));
      return;
    }
    if (requireApprovedTutor && !user.isTutor) {
      setLocation("/dashboard");
    }
  }, [isLoading, user, requireAdmin, requireApprovedTutor, setLocation]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && user.role !== "admin") {
    return null;
  }

  if (requireApprovedTutor && !user.isTutor) {
    return null;
  }

  return <>{children}</>;
}
