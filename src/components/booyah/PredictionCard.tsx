'use client';

import { Loader2, Target, Shield, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import type { BooyahPrediction } from '@/app/booyah/page';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PredictionCardProps {
    prediction: BooyahPrediction | null;
    loading: boolean;
}

const SIGNAL_CONFIG: Record<string, { label: string; color: string; bgClass: string; borderClass: string; icon: string }> = {
    STRONG_BUY: { label: 'STRONG BUY', color: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20', borderClass: 'border-emerald-200 dark:border-emerald-800/50', icon: '🔥' },
    BUY: { label: 'BUY', color: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20', borderClass: 'border-emerald-200 dark:border-emerald-800/50', icon: '📈' },
    HOLD: { label: 'HOLD', color: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-50 dark:bg-amber-900/20', borderClass: 'border-amber-200 dark:border-amber-800/50', icon: '⏸' },
    SELL: { label: 'SELL', color: 'text-red-600 dark:text-red-400', bgClass: 'bg-red-50 dark:bg-red-900/20', borderClass: 'border-red-200 dark:border-red-800/50', icon: '📉' },
    STRONG_SELL: { label: 'STRONG SELL', color: 'text-red-600 dark:text-red-400', bgClass: 'bg-red-50 dark:bg-red-900/20', borderClass: 'border-red-200 dark:border-red-800/50', icon: '🚨' },
};

export default function PredictionCard({ prediction, loading }: PredictionCardProps) {
    const { formatPrice } = useCurrency();

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">AI is analyzing...</span>
                </div>
                <div className="space-y-3">
                    <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                    <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse w-3/4" />
                    <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse w-1/2" />
                </div>
            </div>
        );
    }

    if (!prediction) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
                <Target className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">AI prediction will appear here</p>
            </div>
        );
    }

    const config = SIGNAL_CONFIG[prediction.signal] || SIGNAL_CONFIG.HOLD;

    return (
        <div className={`rounded-2xl border p-6 ${config.bgClass} ${config.borderClass}`}>
            <div className="text-center mb-4">
                <span className="text-3xl">{config.icon}</span>
                <h3 className={`text-2xl font-extrabold mt-2 ${config.color}`}>{config.label}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI Prediction Signal</p>
            </div>

            {/* Confidence Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Confidence</span>
                    <span className={`font-bold ${config.color}`}>{prediction.confidence}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                        style={{ width: `${prediction.confidence}%` }}
                    />
                </div>
            </div>

            {/* Target & Stop Loss */}
            <div className="grid grid-cols-2 gap-3">
                {prediction.targetPrice && (
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center min-w-0">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 truncate">Target</span>
                        </div>
                        <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate block">{formatPrice(prediction.targetPrice, 0, 2, { notation: 'compact' })}</span>
                    </div>
                )}
                {prediction.stopLoss && (
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center min-w-0">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Shield className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 truncate">Stop Loss</span>
                        </div>
                        <span className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 truncate block">{formatPrice(prediction.stopLoss, 0, 2, { notation: 'compact' })}</span>
                    </div>
                )}
            </div>

            {/* Time Horizon */}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Horizon: {prediction.timeHorizon}</span>
            </div>
        </div>
    );
}
