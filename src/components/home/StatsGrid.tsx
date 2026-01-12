'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { getMarketIndices, getCommodities, MarketIndex, Commodity } from '@/services/marketService';

interface StatsCard {
    symbol: string;
    name: string;
    price: string;
    change: string;
    changePercent: string;
    isUp: boolean;
    color: string;
}

const colorClasses: Record<string, { bg: string; bar: string }> = {
    emerald: {
        bg: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10',
        bar: 'bg-emerald-500',
    },
    blue: {
        bg: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10',
        bar: 'bg-blue-500',
    },
    amber: {
        bg: 'from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10',
        bar: 'bg-amber-500',
    },
    yellow: {
        bg: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10',
        bar: 'bg-yellow-500',
    },
};

export default function StatsGrid() {
    const [statsData, setStatsData] = useState<StatsCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [indices, commodities] = await Promise.all([
                    getMarketIndices(),
                    getCommodities()
                ]);

                const cards: StatsCard[] = [];
                const colors = ['emerald', 'blue', 'amber', 'yellow'];

                // Add top indices - using 'value' field from API
                indices.slice(0, 2).forEach((idx: MarketIndex, i: number) => {
                    const changePercent = idx.changePercent || 0;
                    const change = idx.change || 0;
                    const isUp = changePercent >= 0;
                    cards.push({
                        symbol: idx.symbol,
                        name: idx.name || idx.symbol,
                        price: idx.value?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0',
                        change: `${isUp ? '+' : ''}${change.toFixed(2)}`,
                        changePercent: `${isUp ? '+' : ''}${changePercent.toFixed(2)}%`,
                        isUp,
                        color: colors[i % colors.length]
                    });
                });

                // Add commodities - using 'price' field from API
                commodities.slice(0, 2).forEach((c: Commodity, i: number) => {
                    const changePercent = c.changePercent || 0;
                    const change = c.change || 0;
                    const isUp = changePercent >= 0;
                    cards.push({
                        symbol: c.symbol,
                        name: c.name || c.symbol,
                        price: `$${c.price?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}`,
                        change: `${isUp ? '+' : ''}${change.toFixed(2)}`,
                        changePercent: `${isUp ? '+' : ''}${changePercent.toFixed(2)}%`,
                        isUp,
                        color: colors[(i + 2) % colors.length]
                    });
                });

                if (cards.length > 0) {
                    setStatsData(cards);
                    setError(false);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Failed to fetch stats data:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh every 2 minutes
        const interval = setInterval(fetchData, 120000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-emerald-500" size={24} />
                <span className="ml-2 text-slate-500">Loading market data...</span>
            </div>
        );
    }

    if (error || statsData.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-slate-500">
                <AlertCircle size={20} className="mr-2" />
                <span>No market data available. Import data from admin panel.</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => {
                const colors = colorClasses[stat.color] || colorClasses.emerald;
                return (
                    <div
                        key={stat.symbol}
                        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} p-5 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-shadow cursor-pointer`}
                    >
                        {/* Colored accent bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bar}`} />

                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <span className="px-2 py-1 text-xs font-medium bg-white/80 dark:bg-slate-800/80 rounded-md text-slate-600 dark:text-slate-300">
                                    {stat.symbol}
                                </span>
                            </div>
                            <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                                {stat.isUp ? (
                                    <TrendingUp size={16} className="text-emerald-500" />
                                ) : (
                                    <TrendingDown size={16} className="text-red-500" />
                                )}
                            </div>
                        </div>

                        {/* Name & Price */}
                        <h3 className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.name}</h3>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {stat.price}
                        </p>

                        {/* Change */}
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${stat.isUp ? 'text-emerald-600' : 'text-red-600'}`}>
                                {stat.change}
                            </span>
                            <span className={`text-sm ${stat.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stat.changePercent}
                            </span>
                        </div>

                        {/* Mini sparkline placeholder */}
                        <div className="mt-3 h-8 flex items-end gap-0.5">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-t ${colors.bar} opacity-30`}
                                    style={{ height: `${20 + Math.random() * 80}%` }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
