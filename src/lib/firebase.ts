import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

/**
 * SecureVerify — Firebase Configuration
 * 
 * Singleton initialization of Firebase Auth and Firestore.
 * All config values are loaded from environment variables.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Strict Validation: Prevent fallback to "demo-api-key"
if (typeof window !== "undefined") {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "demo-api-key") {
    console.error("❌ SecureVerify: Critical Firebase Configuration Error. Please update .env.local with real keys.");
  } else {
    console.log("✅ SecureVerify: Firebase Configuration loaded successfully.");
  }
}

// Debug: warn if keys are missing
if (typeof window !== "undefined") {
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (!value && key !== "measurementId") {
      console.warn(`🔥 Firebase: ${key} is missing in environment variables!`);
    }
  });
}

// Singleton pattern: reuse existing app if already initialized
const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export default app;
