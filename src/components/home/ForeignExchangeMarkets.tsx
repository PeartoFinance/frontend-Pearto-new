'use client';

import { useState } from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface CurrencyPair {
    from: string;
    to: string;
    rate: number;
    change: number;
    high: number;
    low: number;
}

const currencyPairs: CurrencyPair[] = [
    { from: 'USD', to: 'EUR', rate: 0.924200, change: -0.28, high: 0.925498, low: 0.922904 },
    { from: 'USD', to: 'GBP', rate: 0.793500, change: -0.92, high: 0.787166, low: 0.788832 },
    { from: 'USD', to: 'JPY', rate: 149.8500, change: -0.13, high: 149.9476, low: 149.7524 },
    { from: 'USD', to: 'AUD', rate: 1.5187, change: 0.83, high: 1.5250, low: 1.5124 },
    { from: 'USD', to: 'CAD', rate: 1.3654, change: 0.12, high: 1.3662, low: 1.3646 },
    { from: 'USD', to: 'CHF', rate: 0.881200, change: 0.85, high: 0.884934, low: 0.877466 },
];

const tabs = ['Major Pairs', 'Emerging Markets', 'Currency Exchange', 'Price Charts'];

export default function ForeignExchangeMarkets() {
    const [activeTab, setActiveTab] = useState('Major Pairs');
    const [baseCurrency, setBaseCurrency] = useState('USD');

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
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <RefreshCw size={14} /> Refresh
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currencyPairs.map((pair) => (
                    <div
                        key={`${pair.from}-${pair.to}`}
                        className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {pair.to}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{pair.from}/{pair.to}</p>
                                    <p className="text-xs text-slate-500">{pair.from} to {pair.to}</p>
                                </div>
                            </div>
                            <span className={`flex items-center gap-1 text-sm font-medium ${pair.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                {pair.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{pair.rate.toFixed(6)}</p>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>High: {pair.high.toFixed(6)}</span>
                            <span>Low: {pair.low.toFixed(6)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
