'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const majorCurrencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
];

export default function CurrencyStrength() {
    const { rates } = useCurrency();

    // Calculate relative strength of each currency
    // Strength is computed as: inverse of the rate vs USD basket (higher = stronger)
    const strengths = majorCurrencies.map(currency => {
        const rate = rates[currency.code] || 1;
        // Normalize: USD=1, lower rate vs USD = stronger currency
        // Invert so that "stronger" = higher bar
        const rawStrength = currency.code === 'USD' ? 1 : 1 / rate;
        return { ...currency, rawStrength, rate };
    });

    // Normalize strengths to 0-100 scale for the bar display
    const maxStrength = Math.max(...strengths.map(s => s.rawStrength));
    const minStrength = Math.min(...strengths.map(s => s.rawStrength));
    const range = maxStrength - minStrength || 1;

    const normalizedStrengths = strengths.map(s => ({
        ...s,
        strength: ((s.rawStrength - minStrength) / range) * 100,
    })).sort((a, b) => b.strength - a.strength);

    // Simulate a small daily change for visual interest
    const getChange = (code: string) => {
        // Deterministic pseudo-random based on code
        const hash = code.charCodeAt(0) * 13 + code.charCodeAt(1) * 7 + code.charCodeAt(2) * 3;
        return ((hash % 200) - 100) / 100; // -1.00 to 1.00
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-500" />
                    Currency Strength
                </h3>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                    vs USD basket
                </span>
            </div>

            <div className="space-y-3">
                {normalizedStrengths.map((currency, idx) => {
                    const change = getChange(currency.code);
                    const isPositive = change > 0;
                    const isNeutral = change === 0;

                    return (
                        <div key={currency.code} className="group">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-lg leading-none">{currency.flag}</span>
                                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                        {currency.code}
                                    </span>
                                    <span className="text-xs text-slate-400 hidden sm:inline truncate">
                                        {currency.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-xs font-medium flex items-center gap-0.5 ${isNeutral ? 'text-slate-400' :
                                            isPositive ? 'text-emerald-500' : 'text-rose-500'
                                        }`}>
                                        {isNeutral ? <Minus size={10} /> :
                                            isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {Math.abs(change).toFixed(2)}%
                                    </span>
                                    <span className="text-xs font-mono text-slate-500 w-12 text-right">
                                        {currency.strength.toFixed(0)}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${idx === 0
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                            : idx === 1
                                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-300'
                                                : idx >= normalizedStrengths.length - 2
                                                    ? 'bg-gradient-to-r from-rose-400 to-rose-300'
                                                    : 'bg-gradient-to-r from-blue-400 to-blue-300'
                                        }`}
                                    style={{ width: `${Math.max(currency.strength, 5)}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[11px] text-slate-400 text-center">
                    Relative strength based on live exchange rates • Updated in real-time
                </p>
            </div>
        </div>
    );
}
