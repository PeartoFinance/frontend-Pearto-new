'use client';

import { useQuery } from '@tanstack/react-query';
import { getTechnicalAnalysis } from '@/services/marketService';
import { Loader2, Gauge, TrendingUp, TrendingDown, Minus, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useContext } from 'react';
import { createContext } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

// Safe import pattern - won't throw if context is missing
let useLiveModeOptional: () => { isLive: boolean; refreshTrigger: number } | null = () => null;
try {
    // Dynamic import would be better but for simplicity we use a safe pattern
    const { useLiveMode } = require('@/context/LiveModeContext');
    useLiveModeOptional = () => {
        try {
            return useLiveMode();
        } catch {
            return null;
        }
    };
} catch {
    // Context not available
}

interface RiskAnalysisWidgetProps {
    symbol: string;
}

export default function RiskAnalysisWidget({ symbol }: RiskAnalysisWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { formatPrice } = useCurrency();

    // Safely get live mode context (may be null if outside provider)
    const liveMode = useLiveModeOptional();
    const isLive = liveMode?.isLive ?? false;
    const refreshTrigger = liveMode?.refreshTrigger ?? 0;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['technical-analysis', symbol, isLive ? refreshTrigger : 0],
        queryFn: () => getTechnicalAnalysis(symbol),
        staleTime: isLive ? 0 : 60 * 1000,
        enabled: !!symbol,
        refetchInterval: isLive ? 10000 : false
    });

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 className="animate-spin text-emerald-500 mb-2" size={24} />
                <p className="text-sm text-slate-500">Analyzing technical indicators...</p>
            </div>
        );
    }

    if (isError || !data || !data.summary || data.summary.score === undefined) {
        // Fallback or error state - don't show if data missing
        return null;
    }

    const { summary, indicators } = data;

    // Score mapping to rotation/color
    // Score: -10 (Strong Sell) to +10 (Strong Buy)
    // Gauge: -90deg (Sell) to 90deg (Buy)
    const rotation = (summary.score / 10) * 90;

    const getScoreColor = (score: number) => {
        if (score >= 6) return 'text-emerald-500'; // Strong Buy
        if (score >= 2) return 'text-green-500';   // Buy
        if (score <= -6) return 'text-red-600';    // Strong Sell
        if (score <= -2) return 'text-red-400';    // Sell
        return 'text-slate-500';                   // Neutral
    };

    const getBgColor = (score: number) => {
        if (score >= 2) return 'bg-emerald-500';
        if (score <= -2) return 'bg-red-500';
        return 'bg-slate-400';
    };

    const getSignalIcon = (signal: string) => {
        if (signal.includes('Buy')) return <TrendingUp size={16} className="text-emerald-500" />;
        if (signal.includes('Sell')) return <TrendingDown size={16} className="text-red-500" />;
        return <Minus size={16} className="text-slate-400" />;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Gauge size={20} className="text-blue-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Technical Analysis</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(summary.score)} bg-opacity-10 bg-current`}>
                    {summary.signal}
                </div>
            </div>

            <div className="p-6">
                {/* Gauge Visualization */}
                <div className="relative h-32 w-full flex items-center justify-center mb-6">
                    {/* Semi-Circle Background */}
                    <div className="absolute top-0 w-48 h-24 bg-slate-100 dark:bg-slate-800 rounded-t-full overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-slate-300 to-emerald-500 dark:via-slate-600" />
                    </div>

                    {/* Needle */}
                    <div
                        className="absolute bottom-0 w-1 h-24 bg-slate-800 dark:bg-slate-200 origin-bottom transition-transform duration-1000 ease-out"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        <div className="absolute -top-1 -left-1.5 w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-200" />
                    </div>

                    {/* Center Point */}
                    <div className="absolute bottom-[-10px] w-4 h-4 rounded-full bg-slate-900 dark:bg-white z-10" />

                    {/* Labels */}
                    <div className="absolute bottom-0 w-64 flex justify-between text-xs font-bold text-slate-400 px-2">
                        <span className="text-red-500">Strong Sell</span>
                        <span className="text-emerald-500">Strong Buy</span>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Oscillators</p>
                        <div className="flex justify-center gap-1 text-xs">
                            <span className="text-emerald-500 font-bold">{summary.counts.oscillators.buy} Buy</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-red-500 font-bold">{summary.counts.oscillators.sell} Sell</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Moving Averages</p>
                        <div className="flex justify-center gap-1 text-xs">
                            <span className="text-emerald-500 font-bold">{summary.counts.movingAverages.buy} Buy</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-red-500 font-bold">{summary.counts.movingAverages.sell} Sell</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                >
                    {isExpanded ? 'Hide Details' : 'View Detailed Indicators'}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Collapsible Details */}
                {isExpanded && (
                    <div className="mt-4 space-y-6 border-t border-slate-100 dark:border-slate-800 pt-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Oscillators Table */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Oscillators</h4>
                            <div className="space-y-2">
                                {[
                                    { name: 'RSI (14)', value: indicators.rsi.value.toFixed(2), signal: indicators.rsi.signal },
                                    { name: 'Stochastic %K', value: indicators.stoch.k.toFixed(2), signal: indicators.stoch.signal },
                                    { name: 'CCI (20)', value: indicators.cci.value.toFixed(2), signal: indicators.cci.signal },
                                    { name: 'MACD', value: indicators.macd.value.toFixed(4), signal: indicators.macd.signal },
                                ].map((item) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-slate-900 dark:text-white">{item.value}</span>
                                            <span className={`w-16 text-right font-medium ${item.signal === 'Buy' ? 'text-emerald-500' :
                                                item.signal === 'Sell' ? 'text-red-500' : 'text-slate-400'
                                                }`}>
                                                {item.signal}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Moving Averages Table */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Moving Averages</h4>
                            <div className="space-y-2">
                                {indicators.movingAverages.map((ma) => (
                                    <div key={ma.name} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">{ma.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-slate-900 dark:text-white">
                                                {ma.value ? ma.value.toFixed(2) : '-'}
                                            </span>
                                            <span className={`w-16 text-right font-medium ${ma.signal === 'Buy' ? 'text-emerald-500' :
                                                ma.signal === 'Sell' ? 'text-red-500' : 'text-slate-400'
                                                }`}>
                                                {ma.signal}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
