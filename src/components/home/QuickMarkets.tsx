'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { RefreshCw, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { get } from '@/services/api';
import PriceDisplay from '@/components/common/PriceDisplay';

type MarketTab = 'US' | 'EU' | 'ASIA' | 'CRYPTO';

interface Mover {
    symbol: string;
    name?: string;
    changePercent?: number;
    change?: number;
    price?: number;
    assetType?: string;
}

interface MoversResponse {
    gainers?: Mover[];
    losers?: Mover[];
}

// Map tabs to country codes for the stocks/movers API
const TAB_COUNTRY: Record<MarketTab, string | null> = {
    US: 'US',
    EU: 'EU',
    ASIA: 'ASIA',
    CRYPTO: null, // uses a different endpoint
};

export default function QuickMarkets() {
    const [activeTab, setActiveTab] = useState<MarketTab>('US');
    const [movers, setMovers] = useState<Mover[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchMovers = useCallback(async (tab: MarketTab) => {
        setLoading(true);
        setError(false);

        try {
            if (tab === 'CRYPTO') {
                // Fetch top crypto from live API
                const data = await get<Mover[]>('/live/crypto', { limit: 5 });
                const sorted = (data || [])
                    .filter((c) => c.price)
                    .sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0))
                    .slice(0, 5);
                setMovers(sorted);
            } else {
                // Fetch stock movers — the API uses X-User-Country header automatically
                // We pass region as a query param hint for future use; currently the header drives it
                const data = await get<MoversResponse>('/live/movers', { type: 'gainers', limit: 5 });
                const gainers = (data?.gainers || []).slice(0, 5);
                setMovers(gainers);
            }
        } catch (err) {
            console.error('Quick Markets fetch error:', err);
            setError(true);
            setMovers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMovers(activeTab);
    }, [activeTab, fetchMovers]);

    const handleTabClick = (tab: MarketTab) => {
        setActiveTab(tab);
    };

    return (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-1 h-5 bg-emerald-500 rounded-full" />
                    Quick Markets
                </h3>
                <button
                    onClick={() => fetchMovers(activeTab)}
                    disabled={loading}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-700/60 rounded-lg mb-4">
                {(['US', 'EU', 'ASIA', 'CRYPTO'] as MarketTab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === tab
                            ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Market Snapshot Label */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                {activeTab === 'CRYPTO' ? 'TOP CRYPTO' : 'TOP MOVERS'}
            </p>

            {/* Movers Grid */}
            <div className="flex-1">
                {loading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="animate-spin text-emerald-500" size={20} />
                    </div>
                ) : error || movers.length === 0 ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-slate-500 text-sm">
                        <AlertCircle size={16} />
                        <span>No data available for {activeTab}.</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {movers.map((mover, idx) => {
                            const change = mover.changePercent ?? mover.change ?? 0;
                            const linkHref = activeTab === 'CRYPTO'
                                ? `/crypto/${mover.symbol}`
                                : `/stocks/${mover.symbol}`;

                            return (
                                <Link
                                    key={`${mover.symbol}-${idx}`}
                                    href={linkHref}
                                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{mover.symbol}</span>
                                        {mover.price && (
                                            <span className="text-xs text-slate-500">
                                                <PriceDisplay amount={mover.price} />
                                            </span>
                                        )}
                                    </div>
                                    <span className={`flex items-center gap-1 text-sm font-semibold ${change >= 0 ? 'text-emerald-500' : 'text-red-500'
                                        }`}>
                                        {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
