'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { RefreshCw, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { useForexRates } from '@/hooks/useContentData';
import { useCurrency } from '@/contexts/CurrencyContext';

type ForexTab = 'Major Pairs' | 'Emerging Markets' | 'Currency Exchange' | 'All Pairs';

// Categorize currencies into groups
const MAJOR_PAIRS = ['EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
const EMERGING_PAIRS = ['CNY', 'INR', 'NPR', 'AED', 'SAR', 'SGD', 'HKD'];

const tabs: ForexTab[] = ['Major Pairs', 'Emerging Markets', 'Currency Exchange', 'All Pairs'];

interface ForexRate {
    pair: string;
    rate: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    baseCurrency?: string;
    targetCurrency?: string;
}

export default function ForeignExchangeMarkets() {
    const [activeTab, setActiveTab] = useState<ForexTab>('Major Pairs');
    const [baseCurrency, setBaseCurrency] = useState('USD');

    const { data: forexRates = [], isLoading: loading, isError: error, refetch } = useForexRates(baseCurrency);
    const { symbol: currencySymbol } = useCurrency();

    // Filter forex rates based on active tab
    const filteredRates = useMemo(() => {
        if (!forexRates || forexRates.length === 0) return [];

        const rates = forexRates as ForexRate[];

        switch (activeTab) {
            case 'Major Pairs':
                return rates.filter((r) => {
                    const target = r.pair?.split('/')[1] || r.targetCurrency || '';
                    return MAJOR_PAIRS.includes(target);
                });

            case 'Emerging Markets':
                return rates.filter((r) => {
                    const target = r.pair?.split('/')[1] || r.targetCurrency || '';
                    return EMERGING_PAIRS.includes(target);
                });

            case 'Currency Exchange':
                // Show all as a compact exchange rate table
                return rates;

            case 'All Pairs':
                return rates;

            default:
                return rates;
        }
    }, [forexRates, activeTab]);

    const handleRefresh = () => {
        refetch();
    };

    return (
        <section className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{currencySymbol}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Foreign Exchange Markets</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Real-time exchange rates</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Base Currency */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">Base:</span>
                <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="px-2.5 py-1 text-xs font-medium border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                </select>
            </div>

            {/* Tabs - segmented control */}
            <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-700/60 rounded-lg mb-4 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${activeTab === tab
                            ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Currency Pairs Grid */}
            {loading && filteredRates.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                    <span className="ml-2 text-slate-500">Loading forex data...</span>
                </div>
            ) : error && filteredRates.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                    <AlertCircle size={20} className="mr-2" />
                    <span>Failed to load forex data</span>
                </div>
            ) : filteredRates.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                    <AlertCircle size={20} className="mr-2" />
                    <span>No pairs available for this category</span>
                </div>
            ) : activeTab === 'Currency Exchange' ? (
                /* Compact exchange rate table view */
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-2 font-medium">Pair</th>
                                <th className="text-right py-2 font-medium">Rate</th>
                                <th className="text-right py-2 font-medium">Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRates.map((rate) => {
                                const [from, to] = rate.pair?.split('/') || ['', ''];
                                const pairSlug = rate.pair?.replace('/', '') || '';
                                return (
                                    <tr key={rate.pair} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer" onClick={() => window.location.href = `/forex?pair=${pairSlug}`}>
                                        <td className="py-2.5 font-medium text-emerald-600 dark:text-emerald-400 hover:underline">{from}/{to}</td>
                                        <td className="py-2.5 text-right text-slate-700 dark:text-slate-300">{(rate.rate ?? 0).toFixed(4)}</td>
                                        <td className={`py-2.5 text-right font-medium ${(rate.changePercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {(rate.changePercent ?? 0) >= 0 ? '+' : ''}{(rate.changePercent ?? 0).toFixed(2)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Card grid view for Major/Emerging/All */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRates.map((rate) => {
                        const [from, to] = rate.pair?.split('/') || ['', ''];
                        const pairSlug = rate.pair?.replace('/', '') || '';
                        return (
                            <Link
                                key={rate.pair}
                                href={`/forex?pair=${pairSlug}`}
                                className="block p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {to}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{rate.pair}</p>
                                            <p className="text-xs text-slate-500">{from} to {to}</p>
                                        </div>
                                    </div>
                                    <span className={`flex items-center gap-1 text-sm font-medium ${(rate.changePercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                                        }`}>
                                        {(rate.changePercent ?? 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {(rate.changePercent ?? 0) >= 0 ? '+' : ''}{(rate.changePercent ?? 0).toFixed(2)}%
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{(rate.rate ?? 0).toFixed(6)}</p>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>High: {(rate.high ?? rate.rate ?? 0).toFixed(6)}</span>
                                    <span>Low: {(rate.low ?? rate.rate ?? 0).toFixed(6)}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
