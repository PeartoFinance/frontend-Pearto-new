'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSubscription } from '@/context/SubscriptionContext';
import { FeatureLock, UpgradeModal } from '@/components/subscription/FeatureGating';

const LiveChartPage = dynamic(
    () => import('@/components/charts/LiveChartPage'),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400">Loading live charts...</span>
                </div>
            </div>
        )
    }
);

interface LiveClientWrapperProps {
    symbol?: string;
}

import { useSearchParams } from 'next/navigation';

export default function LiveClientWrapper({ symbol: propSymbol }: LiveClientWrapperProps) {
    const searchParams = useSearchParams();
    const symbol = searchParams.get('symbol') || propSymbol || 'AAPL';
    const assetType = (searchParams.get('type') as 'stock' | 'crypto' | 'forex' | 'commodity') || 'stock';

    const { isPro, trackUsage, isLoading: isSubscriptionLoading } = useSubscription();
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        if (isSubscriptionLoading) return;

        const checkAccess = async () => {
            if (isPro) {
                setIsAllowed(true);
                setShowUpgradeModal(false);
                return;
            }

            // Reuse advanced_charts_limit for Live/Intraday access
            const { allowed } = await trackUsage('advanced_charts_limit');
            setIsAllowed(allowed);
            if (!allowed) {
                setShowUpgradeModal(true);
            }
        };

        checkAccess();
    }, [isPro, trackUsage, isSubscriptionLoading]);

    if (isAllowed === null || isSubscriptionLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400">Loading live charts...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {isAllowed ? (
                <LiveChartPage symbol={symbol} assetType={assetType} />
            ) : (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                    <FeatureLock
                        featureKey="advanced_charts"
                        title="Live Market Data Locked"
                        className="w-full max-w-2xl h-[600px] flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800"
                    >
                        <div className="w-full h-full opacity-20 pointer-events-none"></div>
                    </FeatureLock>
                </div>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                message="You have reached your daily limit for Live Charts. Upgrade to Pro for unlimited real-time access."
                featureKey="advanced_charts_limit"
            />
        </div>
    );
}
