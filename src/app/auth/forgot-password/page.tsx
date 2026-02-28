'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, Loader2, CheckCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send reset email');
            }

            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md">
                {/* Back Link */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition"
                >
                    <ArrowLeft size={18} />
                    Back to Login
                </Link>

                {/* Card */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-700 p-8 shadow-2xl">
                    {sent ? (
                        /* Success State */
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-3">Check Your Email</h1>
                            <p className="text-slate-400 mb-6">
                                If an account exists for <span className="text-white">{email}</span>,
                                you'll receive a password reset link shortly.
                            </p>
                            <p className="text-sm text-slate-500 mb-6">
                                The link will expire in 1 hour.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition"
                            >
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-4">
                                    <Mail className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
                                <p className="text-slate-400">
                                    Enter your email and we'll send you a link to reset your password.
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
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

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Reset Link
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Footer */}
                    {!sent && (
                        <p className="mt-6 text-center text-slate-400 text-sm">
                            Remember your password?{' '}
                            <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
                                Sign in
                            </Link>
                        </p>
                    )}
                </div>
            </div>
          <Footer />
    </div>
    );
}
