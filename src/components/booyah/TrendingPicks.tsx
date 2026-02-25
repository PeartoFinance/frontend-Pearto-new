'use client';

import { useState, useEffect } from 'react';
import { Flame, TrendingUp, TrendingDown, Loader2, Zap } from 'lucide-react';
import { getTopMovers, type MarketStock } from '@/services/marketService';
import { useCurrency } from '@/contexts/CurrencyContext';

interface TrendingPicksProps {
    onSelect: (symbol: string) => void;
}

export default function TrendingPicks({ onSelect }: TrendingPicksProps) {
    const { formatPrice } = useCurrency();
    const [gainers, setGainers] = useState<MarketStock[]>([]);
    const [losers, setLosers] = useState<MarketStock[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await getTopMovers('both', 6);
                setGainers(data.gainers || []);
                setLosers(data.losers || []);
            } catch (err) {
                console.error('Failed to load movers:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trending Picks</h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Select a stock to get AI prediction</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Top Gainers</h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {gainers.slice(0, 6).map(stock => (
                            <button
                                key={stock.id}
                                onClick={() => onSelect(stock.symbol)}
                                className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{stock.symbol}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{stock.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(stock.price || 0)}</p>
                                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                        +{stock.changePercent?.toFixed(2)}%
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top Losers */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Top Losers</h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {losers.slice(0, 6).map(stock => (
                            <button
                                key={stock.id}
                                onClick={() => onSelect(stock.symbol)}
                                className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{stock.symbol}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{stock.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(stock.price || 0)}</p>
                                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                                        {stock.changePercent?.toFixed(2)}%
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
