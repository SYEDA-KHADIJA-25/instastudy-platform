import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import TutorsPage from "@/pages/tutors";
import TutorProfilePage from "@/pages/tutor-profile";
import BookPage from "@/pages/book";
import BookingsPage from "@/pages/bookings";
import BecomeTutorPage from "@/pages/become-tutor";
import AvailabilityPage from "@/pages/availability";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard">
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      </Route>
      <Route path="/tutors" component={TutorsPage} />
      <Route path="/tutors/:tutorId" component={TutorProfilePage} />
      <Route path="/book/:tutorId">
        <ProtectedRoute><BookPage /></ProtectedRoute>
      </Route>
      <Route path="/bookings">
        <ProtectedRoute><BookingsPage /></ProtectedRoute>
      </Route>
      <Route path="/become-tutor">
        <ProtectedRoute><BecomeTutorPage /></ProtectedRoute>
      </Route>
      <Route path="/availability">
        <ProtectedRoute><AvailabilityPage /></ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute><AdminPage /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
