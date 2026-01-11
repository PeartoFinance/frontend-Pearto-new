'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
    const router = useRouter();
    const { signup, signInWithGoogle, isAuthenticated } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [agreed, setAgreed] = useState(false);

    // Redirect if already authenticated
    if (isAuthenticated) {
        router.push('/');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!agreed) {
            setError('Please agree to the Terms & Conditions');
            return;
        }

        setLoading(true);

        try {
            await signup(name, email, password);
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed');
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

            {/* Decorative Elements */}
            <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition"
                >
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>

                {/* Signup Card */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-700 p-8 shadow-2xl">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-emerald-400 to-cyan-500 rounded-2xl mb-4">
                            <span className="text-2xl font-bold text-slate-900">P</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-slate-400">Join Pearto Finance today</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Google Sign Up */}
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-medium rounded-xl transition"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-slate-800 px-4 text-slate-500">or create with email</span>
                        </div>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                                    placeholder="Min. 6 characters"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                                    placeholder="Repeat password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3">
                            <button
                                type="button"
                                onClick={() => setAgreed(!agreed)}
                                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition ${agreed
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'bg-slate-900/50 border-slate-700'
                                    }`}
                            >
                                {agreed && <Check size={14} className="text-white" />}
                            </button>
                            <span className="text-sm text-slate-400">
                                I agree to the{' '}
                                <Link href="/terms" className="text-emerald-400 hover:underline">Terms of Service</Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</Link>
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="mt-6 text-center text-slate-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
