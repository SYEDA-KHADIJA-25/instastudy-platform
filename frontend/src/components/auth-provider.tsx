import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { ensureUserDocument, getUserDoc, getTutorDoc } from "@/lib/firestore-service";
import { buildAppUser } from "@/lib/auth-utils";
import type { AppUser } from "@/lib/types";

type AuthContextType = {
  firebaseUser: FirebaseUser | null;
  user: AppUser | null;
  isLoading: boolean;
  isError: boolean;
  refreshUser: () => void;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  isLoading: true,
  isError: false,
  refreshUser: () => {},
  signOutUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadUser = useCallback(async (fb: FirebaseUser) => {
    try {
      // Ensure user row exists in MySQL
      await ensureUserDocument({
        uid: fb.uid,
        email: fb.email || "",
        name: fb.displayName || fb.email?.split("@")[0] || "User",
        photoURL: fb.photoURL ?? null,
      });

      // Fetch user + tutor profile from MySQL API
      const [userDoc, tutorDoc] = await Promise.all([
        getUserDoc(fb.uid),
        getTutorDoc(fb.uid),
      ]);

      if (!userDoc) {
        setUser(null);
        return;
      }

      // Map MySQL row → AppUser shape
      const appUser: AppUser = {
        uid: fb.uid,
        id: fb.uid,
        name: userDoc.name,
        email: userDoc.email,
        bio: (userDoc as any).bio ?? null,
        avatarUrl: (userDoc as any).avatar_url ?? null,
        phone: (userDoc as any).phone ?? null,
        role: (userDoc as any).role ?? "user",
        createdAt: (userDoc as any).created_at
          ? new Date((userDoc as any).created_at).toISOString()
          : undefined,
        isAdmin: (userDoc as any).role === "admin",
        isTutor: tutorDoc?.status === "approved",
        tutorStatus: tutorDoc ? tutorDoc.status : "none",
      };

      setUser(appUser);
    } catch (err) {
      console.error("[AuthProvider] loadUser error:", err);
      setIsError(true);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubAuth = onAuthStateChanged(auth, async (fb) => {
      // Clear any existing poll
      if (pollRef.current) clearInterval(pollRef.current);

      setFirebaseUser(fb);
      setIsError(false);

      if (!fb) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      await loadUser(fb);

      // Poll every 10s to pick up role/status changes (e.g. admin approves tutor)
      pollRef.current = setInterval(() => loadUser(fb), 10_000);
    });

    return () => {
      unsubAuth();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadUser]);

  const refreshUser = useCallback(async () => {
    if (!firebaseUser) return;
    await loadUser(firebaseUser);
  }, [firebaseUser, loadUser]);

  const signOutUser = useCallback(async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  const value = useMemo(
    () => ({ firebaseUser, user, isLoading, isError, refreshUser, signOutUser }),
    [firebaseUser, user, isLoading, isError, refreshUser, signOutUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
