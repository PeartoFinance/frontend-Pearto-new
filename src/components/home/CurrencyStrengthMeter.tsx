'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, RefreshCw, Loader2 } from 'lucide-react';
import { get } from '@/services/api';

interface CurrencyStrength {
    currency: string;
    strength: number;
    change?: number;
}

const CURRENCY_FLAGS: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CHF: '🇨🇭',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
    NZD: '🇳🇿',
    CNY: '🇨🇳',
    INR: '🇮🇳',
    NPR: '🇳🇵',
};

export default function CurrencyStrengthMeter() {
    const [strengths, setStrengths] = useState<CurrencyStrength[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchStrength = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);
            const data = await get<{ currencies: CurrencyStrength[] } | CurrencyStrength[]>('/live/forex/strength');
            // API returns { currencies: [...] } wrapper
            const list = Array.isArray(data) ? data : (data?.currencies || []);
            // Sort by strength descending
            const sorted = list.sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0));
            setStrengths(sorted);
        } catch (err) {
            console.error('Currency strength fetch error:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStrength();
    }, [fetchStrength]);

    // Normalize strength values to 0-100 range for bar widths
    const maxStrength = Math.max(...strengths.map(s => Math.abs(s.strength ?? 0)), 1);

    const getBarColor = (strength: number) => {
        if (strength > 0.5) return 'bg-emerald-500';
        if (strength > 0) return 'bg-emerald-400';
        if (strength > -0.5) return 'bg-red-400';
        return 'bg-red-500';
    };

    const getLabel = (strength: number) => {
        if (strength > 1) return 'Strong';
        if (strength > 0) return 'Moderate';
        if (strength > -1) return 'Weak';
        return 'Very Weak';
    };

    return (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                        <BarChart3 size={18} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Currency Strength</h3>
                        <p className="text-[10px] text-slate-400">Cross-pair analysis</p>
                    </div>
                </div>
                <button
                    onClick={fetchStrength}
                    disabled={loading}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex-1">
                {loading && strengths.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-violet-500" size={20} />
                    </div>
                ) : error || strengths.length === 0 ? (
                    <p className="text-center text-sm text-slate-500 py-8">Unable to load strength data</p>
                ) : (
                    <div className="space-y-2.5">
                        {strengths.map((item) => {
                            const pct = Math.min(Math.abs(item.strength) / maxStrength * 100, 100);
                            const barColor = getBarColor(item.strength);
                            const flag = CURRENCY_FLAGS[item.currency] || '💱';

                            return (
                                <div key={item.currency} className="flex items-center gap-3">
                                    <span className="text-sm w-5">{flag}</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8">
                                        {item.currency}
                                    </span>
                                    <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                                            style={{ width: `${Math.max(pct, 5)}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-mono font-medium w-12 text-right ${item.strength >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {item.strength >= 0 ? '+' : ''}{item.strength.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <p className="text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                Based on cross-pair analysis • Updated every 30 min
            </p>
        </div>
    );
}
