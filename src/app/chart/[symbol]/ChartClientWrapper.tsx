'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FeatureLock } from '@/components/subscription/FeatureGating';
import { useSubscription } from '@/context/SubscriptionContext';
import { UsageLimitBanner, UpgradeModal } from '@/components/subscription/FeatureGating';

const AdvancedChartPage = dynamic(
    () => import('@/components/charts/AdvancedChartPage'),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }
);

interface ChartClientWrapperProps {
    symbol: string;
}

export default function ChartClientWrapper({ symbol }: ChartClientWrapperProps) {
    const { isPro, trackUsage, isLoading: isSubscriptionLoading } = useSubscription();
    const searchParams = useSearchParams();
    const assetType = (searchParams?.get('type') as 'stock' | 'crypto' | 'forex' | 'commodity') || 'stock';

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

            const { allowed } = await trackUsage('advanced_charts_limit');
            setIsAllowed(allowed);
            if (!allowed) {
                setShowUpgradeModal(true);
            }
        };

        checkAccess();
    }, [isPro, trackUsage, isSubscriptionLoading]);

    // Show loading state while checking permissions
    if (isAllowed === null || isSubscriptionLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Usage limit banner for free users */}
            {!isPro && isAllowed && (
                <div className="fixed top-16 right-4 z-50 w-64">
                    <UsageLimitBanner
                        featureKey="advanced_charts_limit"
                        featureLabel="Advanced Chart Views"
                    />
                </div>
            )}

            {isAllowed ? (
                <AdvancedChartPage symbol={symbol} assetType={assetType} />
            ) : (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                    <FeatureLock
                        featureKey="advanced_charts"
                        title="Advanced Charts Locked"
                        className="w-full max-w-2xl h-[600px] flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800"
                    >
                        <div className="w-full h-full opacity-20 pointer-events-none">
                            {/* Placeholder or blurred content could go here if we wanted to show a glimpse */}
                        </div>
                    </FeatureLock>
                </div>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                message="You have reached your daily limit for Advanced Charts. Upgrade to Pro for unlimited access."
                featureKey="advanced_charts_limit"
            />
        </div>
    );
}

