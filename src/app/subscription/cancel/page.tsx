'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';

export default function SubscriptionCancelPage() {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="px-4 lg:px-6 py-8">
                        <div className="max-w-lg mx-auto text-center">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                    <XCircle size={40} className="text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                Payment Cancelled
                            </h1>

                            {/* Message */}
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Your payment was cancelled and you have not been charged.
                                <br />
                                You can try again or choose a different plan.
                            </p>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
                                >
                                    <ArrowLeft size={18} />
                                    Return to Pricing
                                </Link>
                                <Link
                                    href="/support"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <HelpCircle size={18} />
                                    Contact Support
                                </Link>
                            </div>

                            {/* FAQ Link */}
                            <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
                                Having trouble? Check our{' '}
                                <Link href="/faq" className="text-emerald-500 hover:underline">
                                    FAQ
                                </Link>{' '}
                                or{' '}
                                <Link href="/support" className="text-emerald-500 hover:underline">
                                    contact us
                                </Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
