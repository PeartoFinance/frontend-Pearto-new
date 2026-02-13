'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Calendar, CheckCircle, XCircle, Loader2, Crown, AlertTriangle, Clock } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { getSubscriptionStatus, cancelSubscription } from '@/services/subscriptionService';

interface UserSubscription {
    id: number;
    status: 'active' | 'trialing' | 'cancelled' | 'expired';
    auto_renew: boolean;
    start_date: string;
    current_period_end: string;
    plan: {
        id: number;
        name: string;
        price: number;
        currency: string;
        interval: string;
    };
}

export default function BillingPage() {
    const { user, isAuthenticated, token, isLoading: authLoading } = useAuth();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        // Wait for auth to load
        if (authLoading) return;

        const fetchSubscription = async () => {
            if (!isAuthenticated || !token) {
                setLoading(false);
                return;
            }

            try {
                const data = await getSubscriptionStatus(token);
                // Check if has_subscription and subscription object exist
                if (data && (data as any).has_subscription && (data as any).subscription) {
                    setSubscription((data as any).subscription);
                }
            } catch (error) {
                console.error('Failed to fetch subscription:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscription();
    }, [isAuthenticated, token, authLoading]);

    const handleCancelSubscription = async () => {
        if (!token) return;
        if (!confirm('Are you sure you want to cancel? You will still have access until the end of your billing period.')) return;

        setCancelling(true);
        try {
            const result = await cancelSubscription(token);
            if (result.success) {
                setSubscription(prev => prev ? { ...prev, status: 'cancelled', auto_renew: false } : null);
            }
        } catch (error) {
            console.error('Failed to cancel:', error);
        } finally {
            setCancelling(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-full">
                        <CheckCircle size={14} /> Active
                    </span>
                );
            case 'trialing':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                        <Clock size={14} /> Trial
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-full">
                        <AlertTriangle size={14} /> Cancelled
                    </span>
                );
            case 'expired':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-full">
                        <XCircle size={14} /> Expired
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-8">
                        {/* Back Link */}
                        <Link
                            href="/settings"
                            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-500 mb-6 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Settings
                        </Link>

                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <CreditCard className="text-emerald-500" /> Billing & Subscription
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Manage your subscription plan and billing details
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            </div>
                        ) : !isAuthenticated ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">Please log in to view your billing information.</p>
                                <Link href="/login" className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">
                                    Log In
                                </Link>
                            </div>
                        ) : subscription ? (
                            <div className="space-y-6">
                                {/* Current Plan Card */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-white">
                                            <Crown size={24} />
                                            <div>
                                                <p className="text-sm text-emerald-100">Current Plan</p>
                                                <p className="text-xl font-bold">{subscription.plan.name}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(subscription.status)}
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {subscription.plan.currency} {subscription.plan.price}
                                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/{subscription.plan.interval}</span>
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Calendar size={14} /> {subscription.status === 'cancelled' ? 'Access Until' : 'Next Billing Date'}
                                                </p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {formatDate(subscription.current_period_end)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Auto-renew</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {subscription.auto_renew ? 'Enabled' : 'Disabled'}
                                                </p>
                                            </div>
                                            {subscription.status === 'active' && (
                                                <button
                                                    onClick={handleCancelSubscription}
                                                    disabled={cancelling}
                                                    className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                                >
                                                    {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Upgrade Prompt */}
                                {subscription.status !== 'active' && (
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
                                        <h3 className="text-lg font-bold mb-2">Renew Your Subscription</h3>
                                        <p className="text-purple-100 mb-4">Get back access to all premium features.</p>
                                        <Link href="/pricing" className="inline-block px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors">
                                            View Plans
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard size={32} className="text-gray-400" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Active Subscription</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Upgrade to unlock premium features, advanced tools, and exclusive insights.
                                </p>
                                <Link
                                    href="/pricing"
                                    className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
                                >
                                    View Pricing Plans
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
