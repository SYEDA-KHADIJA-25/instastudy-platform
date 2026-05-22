import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Search,
  BookOpen,
  Calendar,
  User,
  Users,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Shield,
  Library,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOutUser } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();

  const isTutor = !!user?.isTutor;
  const isPending = user?.tutorStatus === "pending";
  const isAdmin = !!user?.isAdmin;

  const navItems = isAdmin
    ? [
        { href: "/admin",          label: "Overview",     icon: Shield },
        { href: "/admin/tutors",   label: "Tutors",       icon: Users },
        { href: "/admin/bookings", label: "All Bookings", icon: BookOpen },
        { href: "/profile",        label: "Profile",      icon: User },
      ]
    : [
        { href: isTutor ? "/tutor" : "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/tutors", label: "Find Tutors", icon: Search },
        { href: "/bookings", label: "My Bookings", icon: BookOpen },
        { href: "/materials", label: "Materials", icon: Library },
        { href: "/material-requests", label: "Material Requests", icon: ClipboardList },
        ...(!isTutor && !isPending ? [{ href: "/become-tutor", label: "Become a Tutor", icon: GraduationCap }] : []),
        ...(isTutor ? [{ href: "/availability", label: "Availability", icon: Calendar }] : []),
        { href: "/profile", label: "Profile", icon: User },
      ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <img src="/logo.png" alt="Insta-Study" className="h-11 w-auto" />
          <div className="flex flex-col leading-none">
            <span className="text-base font-black tracking-tight text-sidebar-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Insta<span className="text-secondary">Study</span>
            </span>
            <span className="text-[9px] font-medium tracking-[0.18em] uppercase text-muted-foreground mt-0.5">
              Peer Tutoring
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Tutor status badge */}
          {isPending && (
            <div className="mt-4 mx-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-xs font-medium text-amber-700">Tutor application pending</p>
              <p className="text-xs text-amber-600 mt-0.5">Under review by our team</p>
            </div>
          )}
          {isTutor && (
            <div className="mt-4 mx-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
              <p className="text-xs font-medium text-green-700">Approved Tutor</p>
              <Link href="/availability" onClick={() => setMobileOpen(false)}>
                <p className="text-xs text-green-600 mt-0.5 hover:underline cursor-pointer">Manage availability →</p>
              </Link>
            </div>
          )}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          {user && (
            <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={async () => {
              await signOutUser();
              queryClient.clear();
              window.location.href = "/";
            }}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:ml-64">
        <header className="flex h-16 items-center border-b border-border bg-background px-4 sm:px-6 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-menu-toggle"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="ml-3">
            <img src="/logo.png" alt="Insta-Study" className="h-10 w-auto" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
