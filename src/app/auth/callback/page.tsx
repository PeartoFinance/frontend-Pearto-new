'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * OAuth Callback Page
 * Handles Firebase redirect-based authentication flow
 * Route: /auth/callback
 */
export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);

                if (result) {
                    // Successfully signed in
                    const user = result.user;

                    // Store user data in localStorage
                    const userData = {
                        id: user.uid,
                        name: user.displayName || 'User',
                        email: user.email || '',
                        role: 'user',
                        avatarUrl: user.photoURL || undefined,
                        isVerified: user.emailVerified,
                    };
                    localStorage.setItem('auth_user', JSON.stringify(userData));

                    // Sync with backend
                    try {
                        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.71:5000/api';
                        const response = await fetch(`${API_BASE}/auth/google-signin`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                firebase_uid: user.uid,
                                name: user.displayName,
                                email: user.email,
                                avatarUrl: user.photoURL,
                            }),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.token) {
                                localStorage.setItem('auth_token', data.token);
                            }
                        }
                    } catch {
                        // Backend sync failed, but user is still logged in via Firebase
                        console.warn('Backend sync failed, continuing with Firebase auth');
                    }

                    setStatus('success');

                    // Redirect to home after short delay
                    setTimeout(() => {
                        router.push('/');
                    }, 1000);
                } else {
                    // No redirect result - user may have navigated here directly
                    router.push('/login');
                }
            } catch (error) {
                console.error('OAuth callback error:', error);
                setStatus('error');
                setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');

                // Redirect to login after showing error
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        };

        handleRedirectResult();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                {status === 'processing' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-white mb-2">Signing you in...</h2>
                        <p className="text-gray-400">Please wait while we complete the authentication.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Sign in successful!</h2>
                        <p className="text-gray-400">Redirecting you to the app...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Sign in failed</h2>
                        <p className="text-red-400 mb-2">{errorMessage}</p>
                        <p className="text-gray-400">Redirecting to login...</p>
                    </>
                )}
            </div>
        </div>
    );
}
