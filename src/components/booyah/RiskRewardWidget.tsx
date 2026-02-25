'use client';

import { Target, ShieldAlert, ArrowRightLeft, Info } from 'lucide-react';
import type { BooyahPrediction } from '@/app/booyah/page';
import { useCurrency } from '@/contexts/CurrencyContext';

interface RiskRewardWidgetProps {
    prediction: BooyahPrediction | null;
    currentPrice: number;
    loading: boolean;
}

export default function RiskRewardWidget({ prediction, currentPrice, loading }: RiskRewardWidgetProps) {
    const { formatPrice } = useCurrency();

    if (loading || !prediction || !prediction.targetPrice || !prediction.stopLoss) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Risk / Reward Profile</h3>
                </div>
                <div className="space-y-4">
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                    <div className="flex justify-between">
                        <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                        <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const target = prediction.targetPrice;
    const stop = prediction.stopLoss;
    
    const potentialProfit = target - currentPrice;
    const potentialLoss = currentPrice - stop;
    
    const profitPercent = (potentialProfit / currentPrice) * 100;
    const lossPercent = (potentialLoss / currentPrice) * 100;
    
    const ratio = potentialLoss > 0 ? (potentialProfit / potentialLoss).toFixed(2) : 'N/A';
    const isFavorable = potentialLoss > 0 && (potentialProfit / potentialLoss) >= 2;

    // Calculate positions for the visual bar
    const range = target - stop;
    const currentPos = range > 0 ? ((currentPrice - stop) / range) * 100 : 50;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Risk / Reward Profile</h3>
                </div>
                <div className="group relative">
                    <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help" />
                    <div className="absolute right-0 w-48 p-2 mt-2 text-xs bg-slate-800 text-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        A ratio of 2.0 or higher is generally considered favorable by traders.
                    </div>
                </div>
            </div>

            {/* Visual Bar */}
            <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-12 mt-12">
                {/* Stop Loss Marker */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 flex flex-col items-start">
                    <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 z-10 -ml-1.5" />
                    <div className="absolute top-full mt-2 flex flex-col items-start">
                        <span className="text-[10px] font-medium text-slate-500 leading-none mb-1">Stop</span>
                        <span className="text-xs font-bold text-red-500 leading-none whitespace-nowrap">{formatPrice(stop, 0, 2, { notation: 'compact' })}</span>
                    </div>
                </div>

                {/* Current Price Marker */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-20" style={{ left: `${Math.max(0, Math.min(100, currentPos))}%` }}>
                    <div className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-900 shadow-sm" />
                    <div className="absolute bottom-full mb-2 flex flex-col items-center" style={{ transform: `translateX(${currentPos < 15 ? '25%' : currentPos > 85 ? '-25%' : '0'})` }}>
                        <span className="text-[10px] font-medium text-slate-500 leading-none mb-1">Current</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-none whitespace-nowrap">{formatPrice(currentPrice, 0, 2, { notation: 'compact' })}</span>
                    </div>
                </div>

                {/* Target Marker */}
                <div className="absolute top-1/2 -translate-y-1/2 right-0 flex flex-col items-end">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 z-10 -mr-1.5" />
                    <div className="absolute top-full mt-2 flex flex-col items-end">
                        <span className="text-[10px] font-medium text-slate-500 leading-none mb-1">Target</span>
                        <span className="text-xs font-bold text-emerald-500 leading-none whitespace-nowrap">{formatPrice(target, 0, 2, { notation: 'compact' })}</span>
                    </div>
                </div>

                {/* Colored segments */}
                <div className="absolute top-0 bottom-0 left-0 bg-red-500/20 rounded-l-full" style={{ width: `${Math.max(0, Math.min(100, currentPos))}%` }} />
                <div className="absolute top-0 bottom-0 right-0 bg-emerald-500/20 rounded-r-full" style={{ width: `${100 - Math.max(0, Math.min(100, currentPos))}%` }} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <ShieldAlert className="w-3 h-3 text-red-500 hidden sm:block" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Risk</span>
                    </div>
                    <p className="text-sm font-bold text-red-500">-{lossPercent.toFixed(1)}%</p>
                    <p className="text-xs text-slate-400 truncate">({formatPrice(potentialLoss, 0, 2, { notation: 'compact' })})</p>
                </div>
                
                <div className="text-center border-x border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Ratio</span>
                    </div>
                    <p className={`text-base sm:text-lg font-bold ${isFavorable ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {ratio === 'N/A' ? 'N/A' : `1 : ${ratio}`}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{isFavorable ? 'Favorable' : 'Sub-optimal'}</p>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Target className="w-3 h-3 text-emerald-500 hidden sm:block" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Reward</span>
                    </div>
                    <p className="text-sm font-bold text-emerald-500">+{profitPercent.toFixed(1)}%</p>
                    <p className="text-xs text-slate-400 truncate">({formatPrice(potentialProfit, 0, 2, { notation: 'compact' })})</p>
                </div>
            </div>
        </div>
    );
}