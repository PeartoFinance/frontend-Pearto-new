'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Plus, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import PriceDisplay from '@/components/common/PriceDisplay';

interface WatchlistItem {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

import { useAuth } from '@/context/AuthContext';
import { useWatchlist } from '@/hooks/usePortfolioData';
// ... (imports)

export default function Watchlist() {
    const { isAuthenticated } = useAuth();

    // Only query if authenticated
    const { data: rawItems = [], isLoading: loading, isError: error } = useWatchlist();

    // Map raw API data to component format if needed, but looks like mapping was done in component
    // Let's assume rawItems matches what we need or map it
    const items: WatchlistItem[] = (rawItems || []).map((item: any) => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        price: item.price || 0,
        change: item.change || 0,
        changePercent: item.changePercent || 0
    }));

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
            ) : !isAuthenticated ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <AlertCircle size={24} className="text-slate-400" />
                    <p className="text-sm text-slate-500 text-center">
                        Sign in to view your watchlist
                    </p>
                    <Link
                        href="/login"
                        className="text-sm text-emerald-500 hover:text-emerald-600 font-medium"
                    >
                        Sign in
                    </Link>
                </div>
            ) : error || items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <AlertCircle size={24} className="text-slate-400" />
                    <p className="text-sm text-slate-500 text-center">
                        {error ? 'Failed to load watchlist' : 'Your watchlist is empty'}
                    </p>
                    <Link
                        href="/stocks"
                        className="text-sm text-emerald-500 hover:text-emerald-600"
                    >
                        Browse stocks to add
                    </Link>
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
                                    <PriceDisplay amount={item.price} />
                                </p>
                                <div className={`flex items-center gap-1 justify-end ${(item.changePercent || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                    {(item.changePercent || 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    <span className="text-xs font-medium">
                                        {(item.changePercent || 0) >= 0 ? '+' : ''}{(item.changePercent || 0).toFixed(2)}%
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
