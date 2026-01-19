'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { getStockForecast, type AnalystForecast } from '@/services/marketService';

interface ForecastTabProps {
    symbol: string;
    currentPrice?: number;
}

export default function ForecastTab({ symbol, currentPrice }: ForecastTabProps) {
    const [forecast, setForecast] = useState<AnalystForecast | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getStockForecast(symbol);
                setForecast(data);
            } catch (e) {
                console.error('Failed to load forecast:', e);
                setError('Forecast data not available.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [symbol]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !forecast) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                    {error || 'No analyst forecast available. Sync from admin panel.'}
                </p>
            </div>
        );
    }

    const price = currentPrice || forecast.currentPrice || 0;
    const totalRecommendations = forecast.strongBuy + forecast.buy + forecast.hold + forecast.sell + forecast.strongSell;
    const bullish = forecast.strongBuy + forecast.buy;
    const bearish = forecast.sell + forecast.strongSell;

    const getConsensus = () => {
        if (totalRecommendations === 0) return { label: 'N/A', color: 'slate' };
        if (bullish > bearish * 2) return { label: 'Strong Buy', color: 'emerald' };
        if (bullish > bearish) return { label: 'Buy', color: 'green' };
        if (bearish > bullish) return { label: 'Sell', color: 'red' };
        return { label: 'Hold', color: 'amber' };
    };

    const consensus = getConsensus();

    const upside = forecast.targetMean && price ? ((forecast.targetMean - price) / price * 100).toFixed(1) : null;

    return (
        <div className="space-y-5">
            {/* Price Target Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Price Target</h3>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                ${forecast.targetMean?.toFixed(2) || '-'}
                            </p>
                            <p className="text-sm text-slate-500">Average Target</p>
                        </div>
                        {upside && (
                            <div className={`text-right ${Number(upside) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                <p className="text-2xl font-bold flex items-center justify-end gap-1">
                                    {Number(upside) >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                    {Number(upside) >= 0 ? '+' : ''}{upside}%
                                </p>
                                <p className="text-sm opacity-80">Upside</p>
                            </div>
                        )}
                    </div>

                    {/* Price Target Range */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Low: <span className="font-medium text-red-500">${forecast.targetLow?.toFixed(2) || '-'}</span></span>
                            <span className="text-slate-500">High: <span className="font-medium text-emerald-600">${forecast.targetHigh?.toFixed(2) || '-'}</span></span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 relative">
                            {forecast.targetLow && forecast.targetHigh && price && (
                                <div
                                    className="absolute h-3 w-1 bg-blue-600 rounded-full"
                                    style={{
                                        left: `${Math.min(100, Math.max(0, ((price - forecast.targetLow) / (forecast.targetHigh - forecast.targetLow)) * 100))}%`,
                                        transform: 'translateX(-50%)'
                                    }}
                                    title={`Current: $${price.toFixed(2)}`}
                                />
                            )}
                        </div>
                        <p className="text-xs text-center text-slate-400 mt-1">Current Price: ${price.toFixed(2)}</p>
                    </div>
                </div>

                {/* Analyst Consensus */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Analyst Consensus</h3>
                    <div className="text-center mb-4">
                        <span className={`inline-block px-4 py-2 rounded-lg text-lg font-bold bg-${consensus.color}-100 text-${consensus.color}-700 dark:bg-${consensus.color}-900/30 dark:text-${consensus.color}-400`}>
                            {consensus.label}
                        </span>
                        <p className="text-sm text-slate-500 mt-2">{totalRecommendations} analysts</p>
                    </div>

                    <div className="space-y-2">
                        {[
                            { label: 'Strong Buy', count: forecast.strongBuy, color: 'emerald' },
                            { label: 'Buy', count: forecast.buy, color: 'green' },
                            { label: 'Hold', count: forecast.hold, color: 'amber' },
                            { label: 'Sell', count: forecast.sell, color: 'orange' },
                            { label: 'Strong Sell', count: forecast.strongSell, color: 'red' },
                        ].map(({ label, count, color }) => (
                            <div key={label} className="flex items-center gap-2">
                                <span className="w-20 text-xs text-slate-500">{label}</span>
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full bg-${color}-500 rounded-full`}
                                        style={{ width: totalRecommendations > 0 ? `${(count / totalRecommendations) * 100}%` : '0%' }}
                                    />
                                </div>
                                <span className="w-6 text-xs text-slate-600 dark:text-slate-300 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
