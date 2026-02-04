'use client';

import React from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { Zap, Crown, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// ==========================================================
// USAGE LIMIT BANNER
// Purpose: Show users their remaining usage for a feature
// Displays: "3/5 AI queries remaining today" with upgrade CTA
// ==========================================================

interface UsageLimitBannerProps {
    featureKey: string;
    featureLabel?: string;
    className?: string;
    compact?: boolean;
}

export function UsageLimitBanner({
    featureKey,
    featureLabel,
    className = '',
    compact = false,
}: UsageLimitBannerProps) {
    const { usage, isPro, isLoading } = useSubscription();

    if (isLoading || isPro) return null;

    const usageInfo = usage[featureKey];
    if (!usageInfo) return null;

    const { limit, used, remaining, period } = usageInfo;

    // Don't show if unlimited
    if (limit === -1) return null;

    // Calculate usage percentage for the progress bar
    const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

    // Color based on remaining
    const isLow = remaining <= 1 && remaining > 0;
    const isExhausted = remaining === 0;

    const periodLabel = period === 'daily' ? 'today' : period === 'monthly' ? 'this month' : 'total';
    const label = featureLabel || featureKey.replace(/_limit$/, '').replace(/_/g, ' ');

    if (compact) {
        return (
            <div className={`flex items-center gap-2 text-sm ${className}`}>
                {isExhausted ? (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                ) : (
                    <Zap className="w-4 h-4 text-emerald-500" />
                )}
                <span className={isExhausted ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'}>
                    {remaining === -1 ? 'Unlimited' : `${remaining}/${limit} remaining`}
                </span>
                {isExhausted && (
                    <Link
                        href="/pricing"
                        className="text-emerald-500 hover:text-emerald-600 font-medium"
                    >
                        Upgrade
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div
            className={`rounded-lg border p-3 ${isExhausted
                    ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20'
                    : isLow
                        ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                } ${className}`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {isExhausted ? (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ) : (
                        <Zap className="w-4 h-4 text-emerald-500" />
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {label}
                    </span>
                </div>
                <span
                    className={`text-sm font-semibold ${isExhausted
                            ? 'text-orange-600 dark:text-orange-400'
                            : isLow
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-slate-600 dark:text-slate-400'
                        }`}
                >
                    {remaining}/{limit} {periodLabel}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full rounded-full transition-all ${isExhausted
                            ? 'bg-orange-500'
                            : isLow
                                ? 'bg-yellow-500'
                                : 'bg-emerald-500'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {isExhausted && (
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                        Limit reached for {periodLabel}
                    </span>
                    <Link
                        href="/pricing"
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                    >
                        <Crown className="w-3 h-3" />
                        Upgrade to Pro
                    </Link>
                </div>
            )}
        </div>
    );
}

// ==========================================================
// FEATURE LOCK OVERLAY
// Purpose: Wrap components that require Pro access
// Shows a blur overlay with upgrade CTA when locked
// ==========================================================

interface FeatureLockProps {
    featureKey: string;
    children: React.ReactNode;
    title?: string;
    className?: string;
}

export function FeatureLock({ featureKey, children, title, className = '' }: FeatureLockProps) {
    const { hasFeature, isPro, isLoading } = useSubscription();

    if (isLoading) {
        return <div className={`opacity-50 ${className}`}>{children}</div>;
    }

    if (isPro || hasFeature(featureKey)) {
        return <>{children}</>;
    }

    const featureLabel = title || featureKey.replace(/_/g, ' ');

    return (
        <div className={`relative ${className}`}>
            {/* Blurred content */}
            <div className="blur-sm pointer-events-none select-none">{children}</div>

            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-[2px] rounded-lg">
                <div className="text-center p-6 max-w-xs">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1 capitalize">
                        {featureLabel}
                    </h3>
                    <p className="text-sm text-slate-300 mb-4">
                        Upgrade to Pro to unlock this feature
                    </p>
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                    >
                        <Crown className="w-4 h-4" />
                        Upgrade Now
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ==========================================================
// UPGRADE MODAL
// Purpose: Show when user hits a limit (triggered by 429 response)
// ==========================================================

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureKey?: string;
    message?: string;
}

export function UpgradeModal({ isOpen, onClose, featureKey, message }: UpgradeModalProps) {
    if (!isOpen) return null;

    const featureLabel = featureKey?.replace(/_limit$/, '').replace(/_/g, ' ') || 'this feature';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Limit Reached
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {message || `You've reached your daily limit for ${featureLabel}. Upgrade to Pro for unlimited access.`}
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/pricing"
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                            onClick={onClose}
                        >
                            <Crown className="w-5 h-5" />
                            Upgrade to Pro
                        </Link>
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
