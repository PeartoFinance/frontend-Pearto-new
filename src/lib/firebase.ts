import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';

// Firebase configuration using environment variables or fallback values
// Pearto App Firebase Project Configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAQVPecT36Q7QNhUrj2C_x9qebABgFkBhI",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "pearto-app.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pearto-app",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "pearto-app.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "598973425153",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:598973425153:web:c5584bec2ebce0a4710200",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-L0B6CD6ECV"
};

// Initialize Firebase (prevent re-initialization in hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider for better UX
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Helper function for redirect-based sign-in (fallback when popup is blocked)
export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);

export default app;
