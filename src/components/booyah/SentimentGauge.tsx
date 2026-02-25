'use client';

import { Loader2 } from 'lucide-react';

interface SentimentGaugeProps {
    sentiment: number; // -100 to +100
    confidence: number;
    loading: boolean;
}

export default function SentimentGauge({ sentiment, confidence, loading }: SentimentGaugeProps) {
    // Map sentiment (-100 to +100) to rotation (-90deg to +90deg)
    const rotation = (sentiment / 100) * 90;
    const normalizedSentiment = ((sentiment + 100) / 200) * 100; // 0-100

    const getSentimentLabel = () => {
        if (sentiment >= 60) return { text: 'Very Bullish', color: 'text-emerald-600 dark:text-emerald-400' };
        if (sentiment >= 20) return { text: 'Bullish', color: 'text-emerald-500 dark:text-emerald-400' };
        if (sentiment >= -20) return { text: 'Neutral', color: 'text-amber-500 dark:text-amber-400' };
        if (sentiment >= -60) return { text: 'Bearish', color: 'text-red-500 dark:text-red-400' };
        return { text: 'Very Bearish', color: 'text-red-600 dark:text-red-400' };
    };

    const label = getSentimentLabel();

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Calculating sentiment...</span>
                </div>
                <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                Market Sentiment
            </h3>

            {/* Gauge Visual */}
            <div className="relative flex flex-col items-center">
                {/* Semi-circle gauge */}
                <div className="relative w-48 h-24 overflow-hidden">
                    {/* Background arc */}
                    <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 opacity-20" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-[72px] rounded-t-full bg-white dark:bg-slate-900" />

                    {/* Needle */}
                    <div
                        className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out"
                        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                    >
                        <div className="w-0.5 h-20 bg-slate-800 dark:bg-white rounded-full mx-auto" />
                        <div className="w-3 h-3 bg-slate-800 dark:bg-white rounded-full -mt-1 mx-auto" />
                    </div>
                </div>

                {/* Labels */}
                <div className="flex justify-between w-48 -mt-1">
                    <span className="text-[10px] font-medium text-red-500">Bearish</span>
                    <span className="text-[10px] font-medium text-emerald-500">Bullish</span>
                </div>

                {/* Score */}
                <div className="mt-3 text-center">
                    <span className={`text-2xl font-extrabold ${label.color}`}>
                        {sentiment > 0 ? '+' : ''}{sentiment}
                    </span>
                    <p className={`text-sm font-semibold ${label.color}`}>{label.text}</p>
                </div>
            </div>

            {/* Mini bars */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Fear</p>
                    <p className="text-sm font-bold text-red-500">{Math.max(0, -sentiment)}%</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Neutral</p>
                    <p className="text-sm font-bold text-amber-500">{Math.max(0, 100 - Math.abs(sentiment))}%</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Greed</p>
                    <p className="text-sm font-bold text-emerald-500">{Math.max(0, sentiment)}%</p>
                </div>
            </div>
        </div>
    );
}
