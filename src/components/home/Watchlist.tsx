'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { getWatchlist, WatchlistItem as WatchlistItemType } from '@/services/portfolioService';

interface WatchlistItem {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

export default function Watchlist() {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const data = await getWatchlist();
                setItems(data.map(item => ({
                    symbol: item.symbol,
                    name: item.name,
                    price: item.price,
                    change: item.change,
                    changePercent: item.changePercent
                })));
            } catch (err) {
                console.error('Failed to fetch watchlist:', err);
                // Fallback to demo data
                setItems([
                    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 2.28, changePercent: 1.24 },
                    { symbol: 'MSFT', name: 'Microsoft', price: 374.58, change: 3.21, changePercent: 0.87 },
                    { symbol: 'GOOGL', name: 'Alphabet', price: 140.23, change: -0.63, changePercent: -0.45 },
                    { symbol: 'AMZN', name: 'Amazon', price: 153.38, change: 3.17, changePercent: 2.11 },
                    { symbol: 'TSLA', name: 'Tesla', price: 248.50, change: -3.32, changePercent: -1.32 },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlist();
    }, []);

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
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <Link
                            key={item.symbol}
                            href={`/stocks/${item.symbol}`}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group"
                        >
                            {/* Symbol Badge */}
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
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
                                    ${item.price.toFixed(2)}
                                </p>
                                <div className={`flex items-center gap-1 justify-end ${item.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                    {item.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    <span className="text-xs font-medium">
                                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
