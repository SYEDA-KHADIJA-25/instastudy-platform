import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/components/auth-provider";
import { PublicNavbar } from "@/components/layout/public-navbar";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-16 px-6 py-8 mx-auto max-w-5xl">
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
