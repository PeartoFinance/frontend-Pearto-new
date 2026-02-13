'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getForexRates, ForexRate, getForexStrength, getForexCorrelation } from '@/services/marketService';
import { TrendingUp, TrendingDown, Loader2, Search, ArrowRightLeft, Info, BarChart2, Grid3X3 } from 'lucide-react';
import { FeatureLock } from '@/components/subscription/FeatureGating';

interface ForexTabProps {
    initialRates?: ForexRate[];
    isLoading?: boolean;
}

// Currency flag emoji map
const currencyFlags: Record<string, string> = {
    USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
    CHF: '🇨🇭', AUD: '🇦🇺', CAD: '🇨🇦', NZD: '🇳🇿',
};

// Correlation value → color
function corrColor(v: number): string {
    if (v >= 0.7) return 'bg-emerald-500 text-white';
    if (v >= 0.3) return 'bg-emerald-200 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300';
    if (v > -0.3) return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    if (v > -0.7) return 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-300';
    return 'bg-red-500 text-white';
}

export default function ForexTab({ initialRates = [], isLoading: parentLoading }: ForexTabProps) {
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: rates = [], isLoading, refetch } = useQuery({
        queryKey: ['content', 'forex', baseCurrency],
        queryFn: () => getForexRates(baseCurrency),
        initialData: baseCurrency === 'USD' ? initialRates : undefined,
        staleTime: 30 * 1000,
    });

    // Forex analytics queries
    const { data: strengthData } = useQuery({
        queryKey: ['forex', 'strength'],
        queryFn: getForexStrength,
        staleTime: 5 * 60 * 1000,
    });

    const { data: corrData } = useQuery({
        queryKey: ['forex', 'correlation'],
        queryFn: () => getForexCorrelation('1mo', '1d'),
        staleTime: 30 * 60 * 1000,
    });

    const isLoadingState = (parentLoading && rates.length === 0) || (isLoading && rates.length === 0);

    const filteredRates = rates.filter(rate =>
        (rate.pair || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rate.targetCurrency || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const majorPairs = rates.filter(rate => {
        const pair = rate.pair || '';
        return pair.includes('EUR') || pair.includes('GBP') || pair.includes('JPY') || pair.includes('CHF') || pair.includes('AUD');
    });

    const otherPairs = filteredRates.filter(rate => !majorPairs.includes(rate));

    const renderRateCard = (rate: ForexRate) => {
        if (!rate.pair) return null;
        const isPositive = (rate.change || 0) >= 0;
        const [from, to] = rate.pair.split('/');

        return (
            <div key={rate.pair} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{from}</span>
                        <ArrowRightLeft size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-900 dark:text-white">{to}</span>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${isPositive
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {(rate.changePercent || 0).toFixed(2)}%
                    </span>
                </div>

                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {(rate.rate || 0).toFixed(4)}
                </div>

                <div className={`text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{(rate.change || 0).toFixed(4)}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="text-slate-500 block">High</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{(rate.high || 0).toFixed(4)}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block text-right">Low</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 block text-right">{(rate.low || 0).toFixed(4)}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['USD', 'EUR', 'GBP', 'JPY'].map((currency) => (
                        <button
                            key={currency}
                            onClick={() => setBaseCurrency(currency)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${baseCurrency === currency
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            Base: {currency}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search pairs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
                    />
                </div>
            </div>

            {isLoadingState ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 size={32} className="animate-spin mb-4" />
                    <p>Loading exchange rates...</p>
                </div>
            ) : rates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Info size={32} className="mb-4 text-slate-300 dark:text-slate-600" />
                    <p>No exchange rates available.</p>
                    <button onClick={() => refetch()} className="mt-4 text-emerald-500 hover:underline">Retry</button>
                </div>
            ) : (
                <>
                    {/* Major Pairs Section */}
                    {!searchTerm && majorPairs.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-500" />
                                Major Pairs
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {majorPairs.map(renderRateCard)}
                            </div>
                        </div>
                    )}

                    {/* All Rates / Search Results */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <ArrowRightLeft size={18} className="text-emerald-500" />
                            {searchTerm ? 'Search Results' : 'All Rates'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {(searchTerm ? filteredRates : otherPairs).map(renderRateCard)}
                        </div>
                    </div>
                </>
            )}

            {/* ── Advanced Forex Analytics ── */}
            <FeatureLock
                featureKey="forex_advanced"
                title="Advanced Forex Analytics"
            >
                <div className="space-y-6">
                    {/* Currency Strength Index */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <BarChart2 size={18} className="text-emerald-500" />
                            Currency Strength Index
                        </h3>
                        {strengthData?.currencies ? (
                            <div className="space-y-3">
                                {strengthData.currencies.map((c) => {
                                    const isPositive = c.avgChangePercent >= 0;
                                    return (
                                        <div key={c.currency} className="flex items-center gap-3">
                                            <span className="text-lg w-6 text-center">{currencyFlags[c.currency] || '🏳️'}</span>
                                            <span className="w-10 font-bold text-sm text-slate-900 dark:text-white">{c.currency}</span>
                                            <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden relative">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${isPositive
                                                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                        : 'bg-gradient-to-r from-red-400 to-red-500'
                                                        }`}
                                                    style={{ width: `${Math.max(c.strength, 3)}%` }}
                                                />
                                                <span className="absolute inset-0 flex items-center px-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                    {c.strength.toFixed(1)}
                                                </span>
                                            </div>
                                            <span className={`text-xs font-medium w-16 text-right ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {isPositive ? '+' : ''}{c.avgChangePercent.toFixed(3)}%
                                            </span>
                                            <span className="text-xs text-slate-400 w-8 text-right">#{c.rank}</span>
                                        </div>
                                    );
                                })}
                                <p className="text-xs text-slate-400 mt-2">
                                    Based on {strengthData.currencies[0]?.pairCount || 0}+ cross-pair aggregations
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="animate-spin text-emerald-500" size={24} />
                            </div>
                        )}
                    </div>

                    {/* Correlation Heatmap */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <Grid3X3 size={18} className="text-emerald-500" />
                            Cross-Pair Correlation Matrix
                            <span className="text-xs font-normal text-slate-400 ml-auto">{corrData?.period || '1mo'} · {corrData?.interval || '1d'}</span>
                        </h3>
                        {corrData?.matrix && corrData.labels.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr>
                                            <th className="p-1.5 text-left text-slate-500"></th>
                                            {corrData.labels.map((l) => (
                                                <th key={l} className="p-1.5 text-center font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{l}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {corrData.matrix.map((row, i) => (
                                            <tr key={corrData.labels[i]}>
                                                <td className="p-1.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{corrData.labels[i]}</td>
                                                {row.map((val, j) => (
                                                    <td key={j} className={`p-1.5 text-center font-mono text-[11px] rounded ${corrColor(val)}`}>
                                                        {val.toFixed(2)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500"></span> Strong +</div>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900/50"></span> Weak +</div>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-700"></span> Neutral</div>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 dark:bg-red-900/50"></span> Weak −</div>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span> Strong −</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="animate-spin text-emerald-500" size={24} />
                            </div>
                        )}
                    </div>
                </div>
            </FeatureLock>
        </div>
    );
}
