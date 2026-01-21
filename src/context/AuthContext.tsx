'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider, signInWithGoogleRedirect } from '@/lib/firebase';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    countryCode?: string;
    isVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.71:5000/api';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.71:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize from localStorage
    useEffect(() => {
        try {
            const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
            const savedUser = localStorage.getItem(AUTH_USER_KEY);

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser && !user) {
                // User signed in with Firebase but no local user - create one
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
            }
        });

        return () => unsubscribe();
    }, [user]);

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
                        const response = await fetch(`${API_BASE}/auth/google-signin`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
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

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    }, []);

    const signup = useCallback(async (name: string, email: string, password: string) => {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
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
                const response = await fetch(`${API_BASE}/auth/google-signin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
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
            }
        } catch (error: unknown) {
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
        isAuthenticated: !!user,
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
