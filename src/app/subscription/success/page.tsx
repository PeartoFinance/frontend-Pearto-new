'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, XCircle, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function SubscriptionSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { token, isAuthenticated, isLoading: authLoading } = useAuth();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [planName, setPlanName] = useState('');
    const [hasCaptured, setHasCaptured] = useState(false);

    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('token'); // PayPal uses 'token'
    const planId = searchParams.get('plan_id');
    const gateway = searchParams.get('gateway') || 'stripe';

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) {
            return;
        }

        // Prevent multiple captures
        if (hasCaptured) {
            return;
        }

        const capturePayment = async () => {
            // If no session/order ID, might be a trial activation redirect
            if (!sessionId && !orderId) {
                // Check if this is a trial success redirect
                if (searchParams.get('trial_activated') === 'true') {
                    setStatus('success');
                    setMessage('Your free trial has been activated!');
                    setPlanName('Trial');
                    return;
                }
                setStatus('error');
                setMessage('Invalid payment session');
                return;
            }

            if (!isAuthenticated || !token) {
                // If not authenticated after loading, redirect to login
                router.push('/login?redirect=/subscription/success');
                return;
            }

            setHasCaptured(true);

            try {
                const res = await fetch(`${API_URL}/subscription/capture`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        order_id: sessionId || orderId,
                        plan_id: planId ? parseInt(planId) : null,
                        gateway: gateway
                    }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setStatus('success');
                    setMessage('Payment successful! Your subscription is now active.');
                    setPlanName(data.plan || 'Premium');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Failed to activate subscription');
                }
            } catch (err) {
                setStatus('error');
                setMessage('An error occurred while processing your payment');
            }
        };

        capturePayment();
    }, [sessionId, orderId, planId, gateway, token, isAuthenticated, authLoading, hasCaptured, router, API_URL, searchParams]);

    return (
        <div className="w-full max-w-md">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 text-center shadow-lg">
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Loader2 size={32} className="text-blue-500 animate-spin" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Processing Payment
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Please wait while we confirm your payment...
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle size={32} className="text-emerald-500" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-2">
                            {message}
                        </p>
                        {planName && (
                            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                Plan: {planName}
                            </p>
                        )}
                        <div className="mt-6 space-y-3">
                            <Link
                                href="/profile"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
                            >
                                View My Subscription <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                            >
                                <Home size={16} /> Go to Dashboard
                            </Link>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <XCircle size={32} className="text-red-500" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Payment Failed
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {message}
                        </p>
                        <div className="mt-6 space-y-3">
                            <Link
                                href="/pricing"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
                            >
                                Try Again
                            </Link>
                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                            >
                                <Home size={16} /> Go to Dashboard
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function SubscriptionSuccessPage() {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 flex items-center justify-center pt-32 pb-8 px-4">
                    <Suspense fallback={
                        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 text-center shadow-lg">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <Loader2 size={32} className="text-blue-500 animate-spin" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Loading Payment Details
                            </h1>
                        </div>
                    }>
                        <SubscriptionSuccessContent />
                    </Suspense>
                </div>
              <Footer />
      </main>
        </div>
    );
}
