'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { getTopMovers, MarketStock } from '@/services/marketService';

type MarketTab = 'US' | 'EU' | 'ASIA' | 'CRYPTO';

interface Mover {
    symbol: string;
    name?: string;
    change: number;
    price?: number;
}

export default function QuickMarkets() {
    const [activeTab, setActiveTab] = useState<MarketTab>('US');
    const [movers, setMovers] = useState<Mover[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchMovers = async () => {
        try {
            setLoading(true);
            const data = await getTopMovers('both', 10);
            // Combine gainers and losers, sorted by absolute change
            const all = [
                ...(data.gainers || []).map((s: MarketStock) => ({
                    symbol: s.symbol,
                    name: s.name,
                    change: s.changePercent || 0,
                    price: s.price
                })),
                ...(data.losers || []).map((s: MarketStock) => ({
                    symbol: s.symbol,
                    name: s.name,
                    change: s.changePercent || 0,
                    price: s.price
                }))
            ];
            setMovers(all);
            setError(false);
        } catch (err) {
            console.error('Failed to fetch movers:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovers();
        // Refresh every 2 minutes
        const interval = setInterval(fetchMovers, 120000);
        return () => clearInterval(interval);
    }, []);

    // Filter movers based on tab (in production would fetch by region)
    const filteredMovers = movers.slice(0, 5);

    return (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-1 h-5 bg-emerald-500 rounded-full" />
                    Quick Markets
                </h3>
                <button
                    onClick={fetchMovers}
                    disabled={loading}
                    className="text-xs text-slate-500 hover:text-emerald-500 flex items-center gap-1"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4">
                {(['US', 'EU', 'ASIA', 'CRYPTO'] as MarketTab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === tab
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Market Snapshot Label */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">MOVERS</p>

            {/* Movers Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                </div>
            ) : error || filteredMovers.length === 0 ? (
                <div className="flex items-center justify-center py-6 gap-2 text-slate-500 text-sm">
                    <AlertCircle size={16} />
                    <span>No movers data. Import stocks from admin panel.</span>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredMovers.map((mover, idx) => (
                        <Link
                            key={`${mover.symbol}-${idx}`}
                            href={`/stocks/${mover.symbol}`}
                            className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{mover.symbol}</span>
                                {mover.price && (
                                    <span className="text-xs text-slate-500">${mover.price.toFixed(2)}</span>
                                )}
                            </div>
                            <span className={`flex items-center gap-1 text-sm font-semibold ${mover.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                {mover.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {mover.change >= 0 ? '+' : ''}{mover.change.toFixed(2)}%
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
