import { Link } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { defaultHomePath } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function PublicNavbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-3 backdrop-blur-md sm:px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="Insta-Study" className="h-14 w-auto" />
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Features
        </Link>
        <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          How it Works
        </Link>
        <Link href="/tutors" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Browse Tutors
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/tutors" className="md:hidden">
          <Button variant="ghost" size="sm" data-testid="button-nav-tutors-mobile">
            Tutors
          </Button>
        </Link>
        {user ? (
          <Link href={defaultHomePath(user)}>
            <Button size="sm" data-testid="button-go-to-dashboard">
              Dashboard
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="max-[380px]:hidden" data-testid="button-nav-login">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" data-testid="button-nav-register">
                Get started
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
