import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey:     import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

let app: FirebaseApp;
let auth: Auth;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

// Kept for legacy imports — no longer used
export function getDb() {
  throw new Error("Firestore is disabled. All data goes through the MySQL API.");
}
