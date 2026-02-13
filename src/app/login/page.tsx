'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, signInWithGoogle, isAuthenticated, isLoading, token } = useAuth();

    // Get redirect param
    const redirectParam = searchParams.get('redirect');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');
    const [referrer, setReferrer] = useState<string | null>(null);

    // Capture referrer on mount
    useEffect(() => {
        if (typeof document !== 'undefined' && document.referrer) {
            setReferrer(document.referrer);
        }
    }, []);

    // Helper to handle post-login redirect
    const handleRedirect = () => {
        if (redirectParam) {
            // Check if redirecting to Stocks app (or any allowed external domain)
            const allowedDomains = ['stocks-nine-blush.vercel.app', 'localhost:3001', 'stocks.pearto.com'];
            const isAllowedDomain = allowedDomains.some(domain => redirectParam.includes(domain));

            if (isAllowedDomain) {
                // Use token from context or localStorage
                const authToken = token || localStorage.getItem('auth_token');
                if (authToken) {
                    // Append token to redirect URL
                    const separator = redirectParam.includes('?') ? '&' : '?';
                    window.location.href = `${redirectParam}${separator}token=${authToken}`;
                    return;
                }
            }

            // If redirect is a URL, go there (for same-domain or explicitly provided URLs)
            if (redirectParam.startsWith('http') || redirectParam.startsWith('/')) {
                window.location.href = redirectParam;
                return;
            }

            // If redirect=true, try to go back to referrer
            if (redirectParam === 'true' && referrer) {
                // Prevent redirect loops if referrer is login page
                if (!referrer.includes('/login')) {
                    window.location.href = referrer;
                    return;
                }
            }
        }

        // Default
        router.push('/');
    };

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            handleRedirect();
        }
    }, [isAuthenticated, isLoading, redirectParam, referrer, token]);

    // Show loading state while checking auth or if authenticated (redirecting)
    if (isLoading || isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center animate-pulse">
                        <span className="text-2xl font-bold text-white">P</span>
                    </div>
                    <div className="text-white font-medium">
                        {isAuthenticated ? 'Redirecting...' : 'Loading...'}
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLocalLoading(true);

        try {
            await login(email, password);
            // handleRedirect will be called by the useEffect when isAuthenticated becomes true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            setLocalLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            // handleRedirect will be called by the useEffect when isAuthenticated becomes true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed');
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-100 dark:bg-slate-900">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
                {/* Background Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-500/20 z-10" />

                {/* Decorative Blur Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-600/20 rounded-full blur-[80px]" />

                {/* Content */}
                <div className="relative z-20 max-w-lg text-center">
                    {/* Logo */}
                    <div className="mb-8 flex justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <span className="text-3xl font-bold text-white">P</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Master Your Financial Future
                    </h2>

                    {/* Quote */}
                    <p className="text-lg text-gray-300 font-light italic">
                        "The goal isn't more money. The goal is living life on your own terms."
                    </p>

                    {/* Carousel Dots */}
                    <div className="mt-8 flex gap-2 justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto bg-white dark:bg-slate-900 transition-colors duration-300">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
                            <span className="text-2xl font-bold text-white">P</span>
                        </div>
                    </div>

                    {/* Back Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-500 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Home
                    </Link>

                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Welcome Back
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Sign in to access your portfolio and tools
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-slate-800 py-8 px-6 sm:rounded-xl sm:px-10 border border-gray-200 dark:border-slate-700 shadow-sm">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleSignIn}
                            type="button"
                            className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                        >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div className="mt-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                                    or continue with email
                                </span>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email Address
                                </label>
                                <div className="mt-1 relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="text-gray-400" size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Password
                                    </label>
                                    <Link href="/auth/forgot-password" className="text-sm font-medium text-emerald-500 hover:text-emerald-400">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="mt-1 relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="text-gray-400" size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={localLoading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {localLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-6">
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                                    Don't have an account?{' '}
                                    <Link href={`/signup${redirectParam ? `?redirect=${redirectParam}` : ''}`} className="font-medium text-emerald-500 hover:text-emerald-400">
                                        Create one
                                    </Link>
                                </span>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}
