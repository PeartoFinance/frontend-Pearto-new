'use client';

import { useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity, Minus } from 'lucide-react';
import type { PriceHistoryPoint } from '@/services/marketService';
import type { BooyahPrediction } from '@/app/booyah/page';

import { useCurrency } from '@/contexts/CurrencyContext';
import PriceDisplay from '@/components/common/PriceDisplay';

interface TechnicalDashboardProps {
    data: PriceHistoryPoint[];
    prediction: BooyahPrediction | null;
    loading: boolean;
}

function computeRSI(closes: number[], period = 14): number {
    if (closes.length < period + 1) return 50;
    let gains = 0, losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff > 0) gains += diff;
        else losses += Math.abs(diff);
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function computeSMA(closes: number[], period: number): number {
    if (closes.length < period) return closes[closes.length - 1] || 0;
    const slice = closes.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

function computeMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
    if (closes.length < 26) return { macd: 0, signal: 0, histogram: 0 };
    const ema = (data: number[], period: number) => {
        const k = 2 / (period + 1);
        let result = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
        for (let i = period; i < data.length; i++) {
            result = data[i] * k + result * (1 - k);
        }
        return result;
    };
    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const macd = ema12 - ema26;
    const signal = macd * 0.8; // Approximate
    return { macd, signal, histogram: macd - signal };
}

interface IndicatorRowProps {
    name: string;
    value: React.ReactNode;
    signal: 'bullish' | 'bearish' | 'neutral';
    detail: string;
}

function IndicatorRow({ name, value, signal, detail }: IndicatorRowProps) {
    const signalConfig = {
        bullish: { icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Bullish' },
        bearish: { icon: TrendingDown, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Bearish' },
        neutral: { icon: Minus, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Neutral' },
    };
    const cfg = signalConfig[signal];
    const Icon = cfg.icon;

    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 gap-2">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{detail}</p>
                </div>
            </div>
            <div className="text-right shrink-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{value}</div>
                <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
            </div>
        </div>
    );
}

export default function TechnicalDashboard({ data, prediction, loading }: TechnicalDashboardProps) {
    const { formatPrice } = useCurrency();
    const indicators = useMemo(() => {
        const closes = data.filter(d => d.close != null).map(d => d.close!);
        if (closes.length < 26) return null;

        const rsi = computeRSI(closes);
        const sma20 = computeSMA(closes, 20);
        const sma50 = computeSMA(closes, 50);
        const { macd, signal, histogram } = computeMACD(closes);
        const currentPrice = closes[closes.length - 1];
        const volumes = data.filter(d => d.volume != null).map(d => d.volume!);
        const avgVol = volumes.length > 20 ? volumes.slice(-20).reduce((a, b) => a + b, 0) / 20 : 0;
        const lastVol = volumes[volumes.length - 1] || 0;

        return { rsi, sma20, sma50, macd, signal, histogram, currentPrice, avgVol, lastVol };
    }, [data]);

    if (loading || !indicators) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Technical Indicators</h3>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const rsiSignal = indicators.rsi > 70 ? 'bearish' : indicators.rsi < 30 ? 'bullish' : 'neutral';
    const smaSignal = indicators.currentPrice > indicators.sma50 ? 'bullish' : indicators.currentPrice < indicators.sma50 ? 'bearish' : 'neutral';
    const macdSignal = indicators.histogram > 0 ? 'bullish' : indicators.histogram < 0 ? 'bearish' : 'neutral';
    const volumeSignal = indicators.lastVol > indicators.avgVol * 1.5 ? 'bullish' : indicators.lastVol < indicators.avgVol * 0.5 ? 'bearish' : 'neutral';
    const trendSignal = indicators.sma20 > indicators.sma50 ? 'bullish' : indicators.sma20 < indicators.sma50 ? 'bearish' : 'neutral';

    // Overall score
    const signals = [rsiSignal, smaSignal, macdSignal, volumeSignal, trendSignal];
    const bullCount = signals.filter(s => s === 'bullish').length;
    const bearCount = signals.filter(s => s === 'bearish').length;
    const overallScore = prediction?.technicals.overallScore ?? Math.round((bullCount / signals.length) * 100);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Technical Analysis</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Overall Score</span>
                    <div className={`px-3 py-1 rounded-lg font-bold text-sm ${overallScore >= 60 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : overallScore >= 40 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                        {overallScore}/100
                    </div>
                </div>
            </div>

            {/* Score Bar */}
            <div className="mb-5">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Bearish</span>
                    <span>Neutral</span>
                    <span>Bullish</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 opacity-30 rounded-full" />
                    <div
                        className="absolute top-0 h-3 w-1.5 bg-slate-900 dark:bg-white rounded-full shadow-md transition-all duration-700"
                        style={{ left: `${Math.min(98, Math.max(2, overallScore))}%`, transform: 'translateX(-50%)' }}
                    />
                </div>
            </div>

            {/* Indicators */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <IndicatorRow
                    name="RSI (14)"
                    value={indicators.rsi.toFixed(1)}
                    signal={rsiSignal}
                    detail={indicators.rsi > 70 ? 'Overbought territory' : indicators.rsi < 30 ? 'Oversold territory' : 'Normal range'}
                />
                <IndicatorRow
                    name="MACD"
                    value={indicators.macd.toFixed(3)}
                    signal={macdSignal}
                    detail={indicators.histogram > 0 ? 'Above signal line' : 'Below signal line'}
                />
                <IndicatorRow
                    name="SMA 20/50"
                    value={<><PriceDisplay amount={indicators.sma20} options={{ notation: 'compact' }} /> / <PriceDisplay amount={indicators.sma50} options={{ notation: 'compact' }} /></>}
                    signal={smaSignal}
                    detail={indicators.currentPrice > indicators.sma50 ? 'Price above SMA 50' : 'Price below SMA 50'}
                />
                <IndicatorRow
                    name="Volume"
                    value={indicators.lastVol > 1000000 ? `${(indicators.lastVol / 1000000).toFixed(1)}M` : `${(indicators.lastVol / 1000).toFixed(0)}K`}
                    signal={volumeSignal}
                    detail={indicators.lastVol > indicators.avgVol ? 'Above average volume' : 'Below average volume'}
                />
                <IndicatorRow
                    name="Trend (SMA)"
                    value={indicators.sma20 > indicators.sma50 ? 'Uptrend' : 'Downtrend'}
                    signal={trendSignal}
                    detail={indicators.sma20 > indicators.sma50 ? 'SMA 20 > SMA 50 (Golden)' : 'SMA 20 < SMA 50 (Death)'}
                />
            </div>

            {/* Summary */}
            <div className="mt-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">Bullish: {bullCount}</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600 dark:text-slate-400">Neutral: {signals.length - bullCount - bearCount}</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-slate-600 dark:text-slate-400">Bearish: {bearCount}</span>
                </div>
            </div>
        </div>
    );
}
