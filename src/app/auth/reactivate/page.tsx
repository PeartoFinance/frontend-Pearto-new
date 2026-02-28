'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { reactivateAccount } from '@/services/accountService';
import Footer from '@/components/layout/Footer';

export default function ReactivateAccountPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await reactivateAccount(email, password);
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to reactivate account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

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
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4">
                            <RefreshCw className="w-8 h-8 text-amber-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Reactivate Account</h1>
                        <p className="text-slate-400">
                            Your account has been deactivated. Enter your credentials to reactivate it.
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-4">
                                <RefreshCw className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Account Reactivated!</h2>
                            <p className="text-slate-400">Redirecting you to login...</p>
                        </div>
                    ) : (
                        <>
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
                                            className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition outline-none"
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
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition outline-none"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Reactivating...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={18} />
                                            Reactivate Account
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Help Text */}
                    <p className="mt-6 text-center text-slate-400 text-sm">
                        Need help?{' '}
                        <a href="mailto:support@pearto.com" className="text-amber-400 hover:text-amber-300">
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
          <Footer />
    </div>
    );
}
