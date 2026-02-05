'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTechnicalAnalysis, type TechnicalAnalysisResponse } from '@/services/marketService';
import { Loader2, Gauge, TrendingUp, TrendingDown, Minus, X, ChevronDown, ChevronUp } from 'lucide-react';

interface RiskAnalysisPanelProps {
    symbol: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function RiskAnalysisPanel({ symbol, isOpen, onClose }: RiskAnalysisPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['technical-analysis-panel', symbol],
        queryFn: () => getTechnicalAnalysis(symbol),
        staleTime: 60 * 1000,
        enabled: !!symbol && isOpen,
    });

    if (!isOpen) return null;

    const getScoreColor = (score: number) => {
        if (score >= 5) return 'text-emerald-400';
        if (score >= 2) return 'text-green-400';
        if (score > -2) return 'text-slate-400';
        if (score > -5) return 'text-orange-400';
        return 'text-red-400';
    };

    const getSignalLabel = (score: number) => {
        if (score >= 5) return 'Strong Buy';
        if (score >= 2) return 'Buy';
        if (score > -2) return 'Neutral';
        if (score > -5) return 'Sell';
        return 'Strong Sell';
    };

    const getGaugeRotation = (score: number) => {
        const clampedScore = Math.max(-10, Math.min(10, score));
        return (clampedScore / 10) * 90;
    };

    const getIndicatorIcon = (signal: string) => {
        switch (signal) {
            case 'buy':
            case 'strong_buy':
                return <TrendingUp className="text-emerald-400" size={12} />;
            case 'sell':
            case 'strong_sell':
                return <TrendingDown className="text-red-400" size={12} />;
            default:
                return <Minus className="text-slate-400" size={12} />;
        }
    };

    // Calculate total counts from actual data
    const getTotalBuy = (data: TechnicalAnalysisResponse) => {
        return (data.summary.counts.oscillators.buy || 0) + (data.summary.counts.movingAverages.buy || 0);
    };

    const getTotalNeutral = (data: TechnicalAnalysisResponse) => {
        return (data.summary.counts.oscillators.neutral || 0) + (data.summary.counts.movingAverages.neutral || 0);
    };

    const getTotalSell = (data: TechnicalAnalysisResponse) => {
        return (data.summary.counts.oscillators.sell || 0) + (data.summary.counts.movingAverages.sell || 0);
    };

    return (
        <div className="absolute top-16 right-4 z-40 w-72 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Gauge size={16} className="text-blue-400" />
                    <span className="text-sm font-medium text-white">Risk Analysis</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-700 rounded transition"
                    >
                        <X size={14} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                {isLoading && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    </div>
                )}

                {isError && (
                    <div className="text-xs text-red-400 text-center py-4">
                        Failed to load analysis
                    </div>
                )}

                {data && (
                    <>
                        {/* Gauge */}
                        <div className="flex flex-col items-center mb-3">
                            <div className="relative w-24 h-14 overflow-hidden">
                                <svg viewBox="0 0 100 55" className="w-full">
                                    <defs>
                                        <linearGradient id="panelGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#ef4444" />
                                            <stop offset="25%" stopColor="#f97316" />
                                            <stop offset="50%" stopColor="#eab308" />
                                            <stop offset="75%" stopColor="#22c55e" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M 10 50 A 40 40 0 0 1 90 50"
                                        fill="none"
                                        stroke="url(#panelGaugeGradient)"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                    />
                                    <g transform={`rotate(${getGaugeRotation(data.summary.score)}, 50, 50)`}>
                                        <line x1="50" y1="50" x2="50" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="50" cy="50" r="4" fill="#fff" />
                                    </g>
                                </svg>
                            </div>
                            <div className={`text-lg font-bold ${getScoreColor(data.summary.score)}`}>
                                {data.summary.signal || getSignalLabel(data.summary.score)}
                            </div>
                            <div className="text-xs text-slate-400">
                                Score: {data.summary.score?.toFixed(1) ?? 0} / 10
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                                <div className="text-xs text-slate-400">Buy</div>
                                <div className="text-sm font-semibold text-emerald-400">{getTotalBuy(data)}</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                                <div className="text-xs text-slate-400">Neutral</div>
                                <div className="text-sm font-semibold text-slate-300">{getTotalNeutral(data)}</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                                <div className="text-xs text-slate-400">Sell</div>
                                <div className="text-sm font-semibold text-red-400">{getTotalSell(data)}</div>
                            </div>
                        </div>

                        {/* Expandable Details */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-slate-400 hover:text-slate-300 bg-slate-800/30 rounded transition"
                        >
                            <span>Detailed Indicators</span>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        {isExpanded && data.indicators && (
                            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                                {/* Oscillators */}
                                <div className="text-xs text-slate-500 uppercase mt-2 mb-1">Oscillators</div>
                                <div className="flex items-center justify-between text-xs py-1 px-1 bg-slate-800/20 rounded">
                                    <span className="text-slate-300">RSI (14)</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400">{data.indicators.rsi.value?.toFixed(2) ?? '-'}</span>
                                        {getIndicatorIcon(data.indicators.rsi.signal)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs py-1 px-1 bg-slate-800/20 rounded">
                                    <span className="text-slate-300">Stochastic</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400">{data.indicators.stoch.k?.toFixed(2) ?? '-'}</span>
                                        {getIndicatorIcon(data.indicators.stoch.signal)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs py-1 px-1 bg-slate-800/20 rounded">
                                    <span className="text-slate-300">MACD</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400">{data.indicators.macd.value?.toFixed(2) ?? '-'}</span>
                                        {getIndicatorIcon(data.indicators.macd.signal)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs py-1 px-1 bg-slate-800/20 rounded">
                                    <span className="text-slate-300">CCI</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400">{data.indicators.cci.value?.toFixed(2) ?? '-'}</span>
                                        {getIndicatorIcon(data.indicators.cci.signal)}
                                    </div>
                                </div>

                                {/* Moving Averages */}
                                <div className="text-xs text-slate-500 uppercase mt-3 mb-1">Moving Averages</div>
                                {data.indicators.movingAverages.map((ma) => (
                                    <div key={ma.name} className="flex items-center justify-between text-xs py-1 px-1 bg-slate-800/20 rounded">
                                        <span className="text-slate-300">{ma.name}</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-400">{ma.value?.toFixed(2) ?? '-'}</span>
                                            {getIndicatorIcon(ma.signal)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
