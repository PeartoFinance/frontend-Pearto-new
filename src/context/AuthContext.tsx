'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider, signInWithGoogleRedirect } from '@/lib/firebase';
import SetPasswordModal from '@/components/auth/SetPasswordModal';
import { fixImageUrl } from '@/utils/imageUtils';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    countryCode?: string;
    isVerified?: boolean;
    hasPassword?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Initialize from localStorage
    useEffect(() => {
        try {
            const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
            const savedUser = localStorage.getItem(AUTH_USER_KEY);

            if (savedToken && savedUser) {
                setToken(savedToken);
                const parsedUser = JSON.parse(savedUser);
                if (parsedUser.avatarUrl) {
                    parsedUser.avatarUrl = fixImageUrl(parsedUser.avatarUrl);
                }
                setUser(parsedUser);
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check if user needs to set password
    useEffect(() => {
        if (user && user.hasPassword === false) {
            setShowPasswordModal(true);
        }
    }, [user]);

    // Listen for auth:expired events from API interceptors (401 responses)
    useEffect(() => {
        const handleAuthExpired = (event: Event) => {
            // Check if we have a valid token currently
            const currentToken = localStorage.getItem(AUTH_TOKEN_KEY);

            // If no token, we're already logged out
            if (!currentToken) return;

            // Optional: You could check if the 401 really came from a meaningful request
            // For now, we'll just log it and proceed, but we might want to be more conservative
            console.warn('[AuthContext] Token expired — logging out. Event:', event);

            setUser(null);
            setToken(null);
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);

            // Sign out of Firebase too
            firebaseSignOut(auth).catch(() => { });
        };
        window.addEventListener('auth:expired', handleAuthExpired);
        return () => window.removeEventListener('auth:expired', handleAuthExpired);
    }, []);

    // Flag to prevent double-sync race condition between signInWithGoogle and onAuthStateChanged
    const isSyncingRef = useRef(false);

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // Check if we need to sync with backend (missing token)
                const localToken = localStorage.getItem(AUTH_TOKEN_KEY);

                if (!localToken && !isSyncingRef.current) {
                    // Prevent concurrent syncs (signInWithGoogle also calls google-signin)
                    isSyncingRef.current = true;
                    console.log('Firebase user found but no token. Syncing with backend...');
                    try {
                        // Re-check — signInWithGoogle may have saved a token while we awaited
                        const recheckToken = localStorage.getItem(AUTH_TOKEN_KEY);
                        if (recheckToken) {
                            console.log('[AuthContext] Token appeared during sync, skipping');
                            isSyncingRef.current = false;
                            return;
                        }

                        const idToken = await firebaseUser.getIdToken();
                        const response = await fetch(`${API_BASE}/auth/google-signin`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                idToken,
                                firebase_uid: firebaseUser.uid,
                                name: firebaseUser.displayName,
                                email: firebaseUser.email,
                                avatarUrl: firebaseUser.photoURL,
                            }),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.token) {
                                setToken(data.token);
                                localStorage.setItem(AUTH_TOKEN_KEY, data.token);
                            }
                            if (data.user) {
                                if (data.user.avatarUrl) {
                                    data.user.avatarUrl = fixImageUrl(data.user.avatarUrl);
                                }
                                setUser(data.user);
                                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
                                isSyncingRef.current = false;
                                return; // Done — synced successfully
                            }
                        }

                        // Backend rejected the sync — sign out Firebase to avoid half-auth state
                        console.warn('[AuthContext] Backend sync failed, signing out Firebase');
                        await firebaseSignOut(auth).catch(() => { });
                    } catch (error) {
                        console.error('Backend sync error:', error);
                        // Sign out Firebase to prevent half-authenticated loops
                        await firebaseSignOut(auth).catch(() => { });
                    } finally {
                        isSyncingRef.current = false;
                    }
                }
            }
        });

        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle redirect result (for redirect-based OAuth flow)
    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    const firebaseUser = result.user;

                    // Create local user
                    const userData: User = {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || 'User',
                        email: firebaseUser.email || '',
                        role: 'user',
                        avatarUrl: firebaseUser.photoURL || undefined,
                        isVerified: firebaseUser.emailVerified,
                    };

                    setUser(userData);
                    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));

                    // Sync with backend
                    try {
                        const idToken = await firebaseUser.getIdToken();
                        const response = await fetch(`${API_BASE}/auth/google-signin`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                idToken,
                                firebase_uid: firebaseUser.uid,
                                name: firebaseUser.displayName,
                                email: firebaseUser.email,
                                avatarUrl: firebaseUser.photoURL,
                            }),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.token) {
                                setToken(data.token);
                                localStorage.setItem(AUTH_TOKEN_KEY, data.token);
                            }
                        }
                    } catch {
                        // Ignore backend sync errors
                    }
                }
            } catch (error) {
                console.error('Redirect result error:', error);
            }
        };

        handleRedirectResult();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();

        if (data.user && data.user.avatarUrl) {
            data.user.avatarUrl = fixImageUrl(data.user.avatarUrl);
        }

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    }, []);

    const signup = useCallback(async (name: string, email: string, password: string, referralCode?: string) => {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, referralCode }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Signup failed');
        }

        // Auto-login after signup
        await login(email, password);
    }, [login]);

    const signInWithGoogle = useCallback(async () => {
        try {
            // Set flag BEFORE popup — onAuthStateChanged fires the instant popup resolves,
            // before the next line of this async function executes
            isSyncingRef.current = true;

            // Try popup-based sign-in first (better UX)
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            // Create local user from Firebase user
            const userData: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                role: 'user',
                avatarUrl: firebaseUser.photoURL || undefined,
                isVerified: firebaseUser.emailVerified,
            };

            setUser(userData);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));

            // Sync with backend
            try {
                const idToken = await firebaseUser.getIdToken();
                const response = await fetch(`${API_BASE}/auth/google-signin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idToken,
                        firebase_uid: firebaseUser.uid,
                        name: firebaseUser.displayName,
                        email: firebaseUser.email,
                        avatarUrl: firebaseUser.photoURL,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.token) {
                        setToken(data.token);
                        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
                    }
                    // Use backend user data if available (has numeric ID)
                    if (data.user) {
                        setUser(data.user);
                        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
                    }
                }
            } catch {
                // Ignore backend sync errors - user is still logged in via Firebase
            } finally {
                isSyncingRef.current = false;
            }
        } catch (error: unknown) {
            isSyncingRef.current = false;
            console.error('Google sign-in error:', error);

            const firebaseError = error as { code?: string; message?: string };

            // If popup is blocked, fall back to redirect-based sign-in
            if (firebaseError.code === 'auth/popup-blocked') {
                console.log('Popup blocked, falling back to redirect...');
                signInWithGoogleRedirect();
                return; // Redirect will handle the rest
            }

            if (firebaseError.code === 'auth/unauthorized-domain') {
                throw new Error('Domain not authorized. Add localhost to Firebase Console → Authentication → Settings → Authorized domains');
            } else if (firebaseError.code === 'auth/popup-closed-by-user') {
                throw new Error('Sign-in cancelled.');
            }

            throw new Error(`Google sign-in failed: ${firebaseError.message || 'Unknown error'}`);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await firebaseSignOut(auth);
        } catch {
            // Ignore Firebase signout errors
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user && !!token,
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        signInWithGoogle,
        logout,
        token,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            <SetPasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={() => {
                    // Update user state to reflect password is set
                    if (user) {
                        const updatedUser = { ...user, hasPassword: true };
                        setUser(updatedUser);
                        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
                    }
                }}
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export default AuthContext;
