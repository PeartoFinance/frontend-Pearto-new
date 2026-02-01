'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    TrendingUp,
    TrendingDown,
    Clock,
    Star,
    ChevronRight,
    Flame,
    BarChart3
} from 'lucide-react';
import { getTopMovers, type MarketStock } from '@/services/marketService';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ChartSidebarProps {
    symbol: string;
}

interface TrendingTicker {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

export default function ChartSidebar({ symbol }: ChartSidebarProps) {
    const { user, isAuthenticated } = useAuth();
    const { formatPrice } = useCurrency();
    const [watchlist, setWatchlist] = useState<TrendingTicker[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
    const [trending, setTrending] = useState<MarketStock[]>([]);
    const [futures, setFutures] = useState<TrendingTicker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load recently viewed from localStorage
        const stored = localStorage.getItem('pearto_recently_viewed');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setRecentlyViewed(parsed.slice(0, 5));
            } catch { }
        }

        // Add current symbol to recently viewed
        const updated = [symbol, ...(recentlyViewed.filter(s => s !== symbol))].slice(0, 10);
        localStorage.setItem('pearto_recently_viewed', JSON.stringify(updated));

        // Fetch trending
        const fetchTrending = async () => {
            try {
                const data = await getTopMovers('both', 5);
                if (data.gainers) {
                    setTrending(data.gainers.slice(0, 5));
                }
            } catch (e) {
                console.error('Failed to fetch trending:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();

        // Mock futures data
        setFutures([
            { symbol: 'ES=F', name: 'S&P 500 Futures', price: 6075.50, change: -17.50, changePercent: -0.29 },
            { symbol: 'YM=F', name: 'Dow Futures', price: 43063.00, change: -117.00, changePercent: -0.27 },
            { symbol: 'NQ=F', name: 'Nasdaq Futures', price: 21859.25, change: -40.00, changePercent: -0.18 },
            { symbol: 'RTY=F', name: 'Russell 2000', price: 2533.50, change: -30.60, changePercent: -1.19 }
        ]);
    }, [symbol]);

    const formatChange = (change: number) => change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
    const formatPercent = (pct: number) => pct >= 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`;

    return (
        <aside className="w-72 border-l border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden">
            {/* My Portfolio & Markets Header */}
            <div className="p-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm">My Portfolio & Markets</h2>
                    <button className="text-xs text-blue-400 hover:text-blue-300">Customize</button>
                </div>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
                {/* My Watchlists */}
                <section className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Star size={14} className="text-yellow-400" />
                            <span className="text-sm font-medium">My Watchlists</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-500" />
                    </div>
                    {isAuthenticated ? (
                        <div className="space-y-2">
                            {watchlist.length > 0 ? (
                                watchlist.slice(0, 5).map(item => (
                                    <Link
                                        key={item.symbol}
                                        href={`/chart/${item.symbol}`}
                                        className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800 transition text-sm"
                                    >
                                        <span className="text-blue-400 font-medium">{item.symbol}</span>
                                        <span className={item.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                            {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-xs text-slate-500">Add symbols to your watchlist to see them here.</p>
                            )}
                            <Link
                                href="/portfolio"
                                className="block text-xs text-blue-400 hover:text-blue-300 mt-2"
                            >
                                Manage Watchlist →
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                            <p className="text-xs text-slate-400 mb-2">Sign in to view your list and add symbols.</p>
                            <Link
                                href="/login"
                                className="inline-block px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}
                </section>

                {/* Recently Viewed */}
                <section className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-sm font-medium">Recently Viewed</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-500" />
                    </div>
                    {recentlyViewed.length > 0 ? (
                        <div className="space-y-1">
                            {recentlyViewed.slice(0, 5).map(s => (
                                <Link
                                    key={s}
                                    href={`/chart/${s}`}
                                    className={`block px-2 py-1.5 rounded text-sm hover:bg-slate-800 transition ${s === symbol ? 'bg-slate-800 text-blue-400' : ''}`}
                                >
                                    {s}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500">No recent symbols</p>
                    )}
                </section>

                {/* Trending Tickers */}
                <section className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Flame size={14} className="text-orange-400" />
                            <span className="text-sm font-medium">Trending Tickers</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-500" />
                    </div>
                    {loading ? (
                        <div className="animate-pulse space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-8 bg-slate-800 rounded" />
                            ))}
                        </div>
                    ) : (
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-slate-500">
                                    <th className="text-left py-1">Symbol</th>
                                    <th className="text-right py-1">Last Price</th>
                                    <th className="text-right py-1">Change</th>
                                    <th className="text-right py-1">% Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trending.map(t => (
                                    <tr key={t.symbol} className="hover:bg-slate-800/50">
                                        <td className="py-1.5">
                                            <Link href={`/chart/${t.symbol}`} className="text-blue-400 hover:underline font-medium">
                                                {t.symbol}
                                            </Link>
                                        </td>
                                        <td className="text-right">{formatPrice(t.price)}</td>
                                        <td className={`text-right ${t.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {formatChange(t.change)}
                                        </td>
                                        <td className={`text-right ${t.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {formatPercent(t.changePercent)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Futures */}
                <section className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={14} className="text-blue-400" />
                            <span className="text-sm font-medium">Futures</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-500" />
                    </div>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-slate-500">
                                <th className="text-left py-1">Symbol</th>
                                <th className="text-right py-1">Last Price</th>
                                <th className="text-right py-1">Change</th>
                                <th className="text-right py-1">% Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {futures.map(f => (
                                <tr key={f.symbol} className="hover:bg-slate-800/50">
                                    <td className="py-1.5">
                                        <Link href={`/chart/${f.symbol}`} className="text-blue-400 hover:underline font-medium">
                                            {f.symbol.replace('=F', '')}
                                        </Link>
                                    </td>
                                    <td className="text-right">{formatPrice(f.price)}</td>
                                    <td className={`text-right ${f.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatChange(f.change)}
                                    </td>
                                    <td className={`text-right ${f.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatPercent(f.changePercent)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </aside>
    );
}
