'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { get } from '@/services/api';

interface ForexRate {
    pair: string;
    rate: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
}

const tabs = ['Major Pairs', 'Emerging Markets', 'Currency Exchange', 'Price Charts'];

export default function ForeignExchangeMarkets() {
    const [activeTab, setActiveTab] = useState('Major Pairs');
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [forexRates, setForexRates] = useState<ForexRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchForexData = async () => {
        try {
            setLoading(true);
            const data = await get<ForexRate[]>('/content/forex', { base: baseCurrency });
            setForexRates(data || []);
            setError(false);
        } catch (err) {
            console.error('Failed to fetch forex rates:', err);
            setError(true);
            setForexRates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForexData();
    }, [baseCurrency]);

    const handleRefresh = () => {
        fetchForexData();
    };

    return (
        <section className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">$</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Foreign Exchange Markets</h3>
                        <p className="text-xs text-slate-500">Real-time exchange rates • Just now</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Base Currency */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">Base Currency:</span>
                <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                </select>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === tab
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Currency Pairs Grid */}
            {loading && forexRates.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                    <span className="ml-2 text-slate-500">Loading forex data...</span>
                </div>
            ) : error && forexRates.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                    <AlertCircle size={20} className="mr-2" />
                    <span>Failed to load forex data</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {forexRates.map((rate) => {
                        const [from, to] = rate.pair.split('/');
                        return (
                            <div
                                key={rate.pair}
                                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600"
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
                                    <span className={`flex items-center gap-1 text-sm font-medium ${rate.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'
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
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
