'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Crown,
    CreditCard,
    Calendar,
    Zap,
    TrendingUp,
    AlertTriangle,
    Check,
    X,
    RefreshCw,
    ExternalLink,
    Clock,
    BarChart3,
    Shield
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import { getBillingHistory, cancelSubscription, type BillingHistoryItem } from '@/services/subscriptionService';

export default function ProfileSubscription() {
    const { planName, status, expiresAt, features, usage, isPro, isLoading, refreshSubscription } = useSubscription();
    const { token } = useAuth();
    const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
    const [loadingBilling, setLoadingBilling] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // Fetch billing history
    useEffect(() => {
        const fetchBilling = async () => {
            if (!token) return;
            setLoadingBilling(true);
            try {
                const history = await getBillingHistory(token);
                setBillingHistory(history);
            } catch (e) {
                console.error('Failed to fetch billing history:', e);
            } finally {
                setLoadingBilling(false);
            }
        };
        fetchBilling();
    }, [token]);

    // Cancel subscription
    const handleCancel = async () => {
        if (!token) return;
        if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) return;

        setCancelling(true);
        try {
            const result = await cancelSubscription(token);
            if (result.success) {
                await refreshSubscription();
                alert('Subscription cancelled successfully');
            } else {
                alert(result.error || 'Failed to cancel subscription');
            }
        } catch (e) {
            alert('Failed to cancel subscription');
        } finally {
            setCancelling(false);
        }
    };

    // Format date
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    // Get status badge color
    const getStatusColor = (s: string) => {
        switch (s?.toLowerCase()) {
            case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'trialing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'cancelled': case 'canceled': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'expired': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${isPro ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-slate-700'}`}>
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{planName} Plan</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
                                    {status === 'trialing' ? '🎉 Trial Active' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                                {expiresAt && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {status === 'trialing' ? 'Trial ends' : 'Renews'}: {formatDate(expiresAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {!isPro && (
                            <Link
                                href="/pricing"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition"
                            >
                                <Zap className="w-4 h-4" />
                                Upgrade
                            </Link>
                        )}
                        {isPro && status !== 'cancelled' && (
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="px-4 py-2 text-sm text-slate-400 hover:text-red-400 transition"
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Plan'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Plan Description */}
                {isPro ? (
                    <p className="text-slate-400 text-sm">
                        Enjoy unlimited access to all premium features including advanced charts, AI insights, unlimited alerts, and priority support.
                    </p>
                ) : (
                    <p className="text-slate-400 text-sm">
                        You're on the Free plan. Upgrade to Pro for unlimited access to advanced features.
                    </p>
                )}
            </div>

            {/* Features Grid */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    Plan Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(features).map(([key, value]) => (
                        <div
                            key={key}
                            className={`flex items-center gap-2 p-3 rounded-lg ${value ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600'}`}
                        >
                            {value ? (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                                <X className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                            <span className={`text-sm capitalize ${value ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                {key.replace(/_/g, ' ')}
                            </span>
                        </div>
                    ))}
                    {Object.keys(features).length === 0 && (
                        <p className="text-slate-500 text-sm col-span-full">No features data available</p>
                    )}
                </div>
            </div>

            {/* Usage Limits */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Usage & Limits
                </h3>

                {Object.keys(usage).length === 0 ? (
                    <p className="text-slate-500 text-sm">
                        {isPro ? 'Unlimited usage on Pro plan' : 'No usage data available'}
                    </p>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(usage).map(([key, info]) => {
                            const percentage = info.limit > 0 ? Math.min(100, (info.used / info.limit) * 100) : 0;
                            const isExhausted = info.remaining === 0 && info.limit !== -1;
                            const isUnlimited = info.limit === -1;

                            return (
                                <div key={key} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-900 dark:text-white capitalize">
                                            {key.replace(/_limit$/, '').replace(/_/g, ' ')}
                                        </span>
                                        <span className={`text-sm ${isExhausted ? 'text-orange-400' : 'text-slate-400'}`}>
                                            {isUnlimited ? (
                                                <span className="text-emerald-400">Unlimited</span>
                                            ) : (
                                                `${info.used} / ${info.limit} (${info.remaining} left)`
                                            )}
                                        </span>
                                    </div>
                                    {!isUnlimited && (
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${isExhausted ? 'bg-orange-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    )}
                                    {info.period && !isUnlimited && (
                                        <p className="text-xs text-slate-500">
                                            Resets {info.period === 'daily' ? 'daily' : info.period === 'monthly' ? 'monthly' : 'never'}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Billing History */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    Billing History
                </h3>

                {loadingBilling ? (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-slate-500" />
                    </div>
                ) : billingHistory.length === 0 ? (
                    <p className="text-slate-500 text-sm">No billing history available</p>
                ) : (
                    <div className="space-y-3">
                        {billingHistory.slice(0, 5).map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/30 rounded-lg"
                            >
                                <div>
                                    <p className="text-sm text-slate-900 dark:text-white">{item.description}</p>
                                    <p className="text-xs text-slate-500">{formatDate(item.date)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">${item.amount.toFixed(2)}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded ${item.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/pricing"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg text-sm transition"
                    >
                        <TrendingUp className="w-4 h-4" />
                        View Plans
                    </Link>
                    <button
                        onClick={() => refreshSubscription()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg text-sm transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh Status
                    </button>
                    {isPro && (
                        <a
                            href="mailto:support@pearto.finance"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg text-sm transition"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Contact Support
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
