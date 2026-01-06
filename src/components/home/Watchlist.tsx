'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Plus, ChevronRight } from 'lucide-react';

interface WatchlistItem {
    symbol: string;
    name: string;
    price: string;
    change: string;
    isUp: boolean;
}

const watchlistData: WatchlistItem[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$185.92', change: '+1.24%', isUp: true },
    { symbol: 'MSFT', name: 'Microsoft', price: '$374.58', change: '+0.87%', isUp: true },
    { symbol: 'GOOGL', name: 'Alphabet', price: '$140.23', change: '-0.45%', isUp: false },
    { symbol: 'AMZN', name: 'Amazon', price: '$153.38', change: '+2.11%', isUp: true },
    { symbol: 'TSLA', name: 'Tesla', price: '$248.50', change: '-1.32%', isUp: false },
];

export default function Watchlist() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Watchlist
                </h3>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-emerald-500 transition">
                        <Plus size={18} />
                    </button>
                    <Link
                        href="/watchlist"
                        className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                        View All <ChevronRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Watchlist Items */}
            <div className="space-y-2">
                {watchlistData.map((item) => (
                    <Link
                        key={item.symbol}
                        href={`/stocks/${item.symbol}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group"
                    >
                        {/* Symbol Badge */}
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                {item.symbol.slice(0, 2)}
                            </span>
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {item.symbol}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {item.name}
                            </p>
                        </div>

                        {/* Price & Change */}
                        <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {item.price}
                            </p>
                            <div className={`flex items-center gap-1 justify-end ${item.isUp ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                {item.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                <span className="text-xs font-medium">{item.change}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
