'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, BarChart2 } from 'lucide-react';

interface MarketIndex {
    name: string;
    value: number;
    change: number;
    changePercent: number;
}

const indices: MarketIndex[] = [
    { name: 'NEPSE', value: 2847.23, change: 23.45, changePercent: 0.83 },
    { name: 'Sensitive', value: 512.36, change: -3.21, changePercent: -0.62 },
    { name: 'Float', value: 198.45, change: 1.23, changePercent: 0.62 },
    { name: 'Sensitive Float', value: 124.78, change: 0.89, changePercent: 0.72 },
];

const topGainers = [
    { symbol: 'AAPL', price: 185.92, change: 4.23 },
    { symbol: 'MSFT', price: 378.91, change: 3.12 },
    { symbol: 'GOOGL', price: 141.80, change: 2.87 },
    { symbol: 'AMZN', price: 178.25, change: 2.45 },
];

const topLosers = [
    { symbol: 'META', price: 353.96, change: -2.15 },
    { symbol: 'NFLX', price: 485.23, change: -1.89 },
    { symbol: 'NVDA', price: 495.22, change: -1.45 },
    { symbol: 'TSLA', price: 248.48, change: -1.23 },
];

export default function MarketOverview() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Market Indices */}
            <div className="card lg:col-span-2">
                <div className="card-header flex items-center gap-2">
                    <BarChart2 size={18} className="text-emerald-500" />
                    <span>Market Indices</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
                    {indices.map((index) => (
                        <div key={index.name} className="p-4 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{index.name}</p>
                            <p className="text-xl font-bold mb-1">{index.value.toLocaleString()}</p>
                            <div className={`flex items-center justify-center gap-1 text-sm font-medium ${index.change >= 0 ? 'price-positive' : 'price-negative'
                                }`}>
                                {index.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(index.change).toFixed(2)} ({Math.abs(index.changePercent).toFixed(2)}%)
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Market Stats */}
            <div className="card">
                <div className="card-header">Today's Summary</div>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Turnover</span>
                        <span className="font-semibold">$4.25B</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Traded Shares</span>
                        <span className="font-semibold">12.5M</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Transactions</span>
                        <span className="font-semibold">89,234</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Traded Scrips</span>
                        <span className="font-semibold">312</span>
                    </div>
                </div>
            </div>

            {/* Top Gainers */}
            <div className="card">
                <div className="card-header flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-500" />
                        <span>Top Gainers</span>
                    </div>
                    <Link href="/market/gainers" className="text-xs text-emerald-500">View All</Link>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {topGainers.map((stock) => (
                        <div key={stock.symbol} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900">
                            <div className="symbol-badge">
                                <span className="symbol-icon">{stock.symbol.slice(0, 2)}</span>
                                {stock.symbol}
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">${stock.price}</p>
                                <p className="text-xs price-positive">+{stock.change}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Losers */}
            <div className="card">
                <div className="card-header flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-red-500 rotate-180" />
                        <span>Top Losers</span>
                    </div>
                    <Link href="/market/losers" className="text-xs text-emerald-500">View All</Link>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {topLosers.map((stock) => (
                        <div key={stock.symbol} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900">
                            <div className="symbol-badge">
                                <span className="symbol-icon">{stock.symbol.slice(0, 2)}</span>
                                {stock.symbol}
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">${stock.price}</p>
                                <p className="text-xs price-negative">{stock.change}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Stocks Placeholder */}
            <div className="card">
                <div className="card-header flex items-center gap-2">
                    <BarChart2 size={18} className="text-emerald-500" />
                    <span>Most Active</span>
                </div>
                <div className="p-4">
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <BarChart2 size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Loading live data...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
