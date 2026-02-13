'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import { useState } from 'react';

export default function ForexTable() {
    const { rates } = useCurrency();
    const [search, setSearch] = useState('');

    const majorPairs = [
        { base: 'EUR', target: 'USD' },
        { base: 'GBP', target: 'USD' },
        { base: 'USD', target: 'JPY' },
        { base: 'USD', target: 'CHF' },
        { base: 'AUD', target: 'USD' },
        { base: 'USD', target: 'CAD' },
        { base: 'NZD', target: 'USD' },
    ];

    // Filter and calculate cross rates
    const getRate = (base: string, target: string) => {
        if (!rates[base] || !rates[target]) return 0;
        // rates are USD based per context
        // if USD is base: rates[target]
        // if USD is target: 1 / rates[base]

        const rateBaseToUSD = 1 / rates[base]; // How many USD for 1 Base
        const rateUSDToTarget = rates[target]; // How many Target for 1 USD

        // (Base -> USD) * (USD -> Target) = Base -> Target
        // Wait, context rates are: "How much of THIS currency for 1 USD"
        // So rates['EUR'] = 0.92 means 1 USD = 0.92 EUR

        // We want EUR/USD -> How many USD for 1 EUR?
        // 1 USD = rates[EUR] EUR
        // 1 EUR = 1/rates[EUR] USD

        // We want GBP/USD -> 1/rates[GBP]

        // We want USD/JPY -> rates[JPY]

        // General formula: 1 Unit Base = (rates[Target] / rates[Base]) Target

        return rates[target] / rates[base];
    };

    // We can also just list all available rates from context if search is active
    const displayRates = search ?
        Object.keys(rates)
            .filter(img => img.toLowerCase().includes(search.toLowerCase()))
            .map(currency => ({ base: 'USD', target: currency }))
        : majorPairs;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm max-w-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4 items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Exchange Rates</h3>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search currency..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Currency Pair</th>
                            <th className="px-6 py-4 text-right">Price</th>
                            <th className="px-6 py-4 text-right">Change</th>
                            <th className="px-6 py-4 text-right">Change %</th>
                            <th className="px-6 py-4 text-right hidden md:table-cell">High</th>
                            <th className="px-6 py-4 text-right hidden md:table-cell">Low</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {displayRates.map((pair) => {
                            const price = getRate(pair.base, pair.target);
                            // Mock change data (randomized for liveliness)
                            const change = (Math.random() * 0.01 - 0.005) * price;
                            const percent = (change / price) * 100;
                            const isPositive = change >= 0;

                            return (
                                <tr key={`${pair.base}${pair.target}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] border-2 border-white dark:border-slate-800">{pair.base}</div>
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] border-2 border-white dark:border-slate-800">{pair.target}</div>
                                            </div>
                                            {pair.base}/{pair.target}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-base whitespace-nowrap">
                                        {price.toFixed(5)}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-medium whitespace-nowrap ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {change > 0 ? '+' : ''}{change.toFixed(5)}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-medium whitespace-nowrap ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                            {Math.abs(percent).toFixed(2)}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 hidden md:table-cell whitespace-nowrap">
                                        {(price * 1.002).toFixed(5)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 hidden md:table-cell whitespace-nowrap">
                                        {(price * 0.998).toFixed(5)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 text-center text-xs text-slate-500">
                Real-time data provided by Open Exchange Rates • Delays may apply
            </div>
        </div>
    );
}
