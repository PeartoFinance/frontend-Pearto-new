'use client';

import { useLiveMode } from '@/context/LiveModeContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { UpgradeModal } from '@/components/subscription/FeatureGating';
import { useState } from 'react';
import { Zap } from 'lucide-react';

export default function LiveModeToggle() {
    const { isLive, toggleLive, setLiveMode } = useLiveMode();
    const { isPro } = useSubscription();
    const [showUpgrade, setShowUpgrade] = useState(false);

    const handleToggle = () => {
        if (!isPro && !isLive) {
            // If user is not Pro and trying to enable live mode
            setShowUpgrade(true);
            return;
        }
        toggleLive();
    };

    return (
        <>
            <button
                onClick={handleToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border ${isLive
                        ? 'bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
            >
                <div className="relative">
                    <Zap size={14} className={isLive ? 'fill-red-400' : ''} />
                    {isLive && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    )}
                </div>
                <span>{isLive ? 'LIVE MODE' : 'GO LIVE'}</span>
            </button>

            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                message="Live Market Data is a Pro feature. Upgrade to enable real-time updates."
                featureKey="real_time_data"
            />
        </>
    );
}
