'use client';

import Link from 'next/link';
import { ArrowLeft, Trash2, Mail, Clock } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export default function AccountDeletedPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-red-500/20 p-8 shadow-2xl text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full mb-6">
                        <Trash2 className="w-10 h-10 text-red-500" />
                    </div>

                    {/* Header */}
                    <h1 className="text-2xl font-bold text-white mb-3">Account Deleted</h1>
                    <p className="text-slate-400 mb-6">
                        Your account has been scheduled for permanent deletion.
                    </p>

                    {/* Info Box */}
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-6 text-left">
                        <div className="flex items-start gap-3 mb-3">
                            <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-white font-medium">30-Day Recovery Window</p>
                                <p className="text-sm text-slate-400">
                                    You have 30 days to reactivate your account before all data is permanently erased.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-white font-medium">Want to recover your account?</p>
                                <p className="text-sm text-slate-400">
                                    Contact our support team within 30 days to restore your account.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link
                            href="/auth/reactivate"
                            className="w-full py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium rounded-xl transition flex items-center justify-center gap-2"
                        >
                            Try to Reactivate
                        </Link>
                        <Link
                            href="/"
                            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Back to Home
                        </Link>
                    </div>

                    {/* Support */}
                    <p className="mt-6 text-slate-500 text-sm">
                        Questions? Email{' '}
                        <a href="mailto:support@pearto.com" className="text-slate-400 hover:text-white">
                            support@pearto.com
                        </a>
                    </p>
                </div>
            </div>
          <Footer />
    </div>
    );
}
