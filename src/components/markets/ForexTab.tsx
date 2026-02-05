'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getForexRates, ForexRate } from '@/services/marketService';
import { TrendingUp, TrendingDown, RefreshCw, Loader2, Search, ArrowRightLeft, Info } from 'lucide-react';
import { FeatureLock } from '@/components/subscription/FeatureGating';

interface ForexTabProps {
    initialRates?: ForexRate[];
    isLoading?: boolean;
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

    // Loading state is true if parent is loading (initial) AND we don't have rates, OR if query is locally loading
    const isLoadingState = (parentLoading && rates.length === 0) || (isLoading && rates.length === 0);

    const filteredRates = rates.filter(rate =>
        rate.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.targetCurrency.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const majorPairs = rates.filter(rate => {
        const pair = rate.pair;
        return pair.includes('EUR') || pair.includes('GBP') || pair.includes('JPY') || pair.includes('CHF') || pair.includes('AUD');
    });

    const otherPairs = filteredRates.filter(rate => !majorPairs.includes(rate));

    const renderRateCard = (rate: ForexRate) => {
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
                    {/* Major Pairs Section - Only show if no search term */}
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

            <FeatureLock
                featureKey="forex_advanced"
                title="Advanced Forex Analytics"
            >
                <div className="h-40 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-400 font-medium">Advanced analytics visualization</p>
                </div>
            </FeatureLock>
        </div>
    );
}
