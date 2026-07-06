import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/components/auth-provider";
import { PublicNavbar } from "@/components/layout/public-navbar";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="mx-auto max-w-5xl px-4 py-8 pt-16 sm:px-6">
        {children}
      </div>
    </div>
  );
}

export function usePublicNavOrAppLayout() {
  const { user, isLoading } = useAuth();
  if (!isLoading && user) return AppLayout;
  return PublicLayout;
}
