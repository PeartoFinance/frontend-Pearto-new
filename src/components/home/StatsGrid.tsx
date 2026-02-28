'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Clock } from 'lucide-react';
import { useMarketIndices, useCommodities } from '@/hooks/useMarketData';
import { MarketIndex, Commodity } from '@/services/marketService';
import PriceDisplay from '@/components/common/PriceDisplay';

interface StatsCard {
    symbol: string;
    name: string;
    price: string | number;
    isCommodity?: boolean;
    change: number;
    changePercent: number;
    isUp: boolean;
    color: string;
}

const colorClasses: Record<string, { accent: string; badge: string }> = {
    emerald: { accent: 'bg-emerald-500', badge: 'text-emerald-600 dark:text-emerald-400' },
    blue: { accent: 'bg-blue-500', badge: 'text-blue-600 dark:text-blue-400' },
    amber: { accent: 'bg-amber-500', badge: 'text-amber-600 dark:text-amber-400' },
    violet: { accent: 'bg-violet-500', badge: 'text-violet-600 dark:text-violet-400' },
};

function SkeletonCard() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-4 animate-pulse">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-600" />
            <div className="h-4 w-14 bg-slate-300/60 dark:bg-white/10 rounded mb-3" />
            <div className="h-3 w-24 bg-slate-300/60 dark:bg-white/10 rounded mb-2" />
            <div className="h-7 w-28 bg-slate-300/60 dark:bg-white/10 rounded mb-2" />
            <div className="h-3 w-20 bg-slate-300/60 dark:bg-white/10 rounded" />
        </div>
    );
}

export default function StatsGrid() {
    const { data: indices, isLoading: indicesLoading, isError: indicesError } = useMarketIndices();
    const { data: commodities, isLoading: commoditiesLoading, isError: commoditiesError } = useCommodities();

    const loading = indicesLoading || commoditiesLoading;
    const error = indicesError || commoditiesError;

    // Detect market closed: if all indices report "Markets Closed" in marketStatus
    const marketClosed = useMemo(() => {
        if (!indices || indices.length === 0) return false;
        return indices.some((idx: MarketIndex) =>
            idx.marketStatus === 'Markets Closed'
        );
    }, [indices]);

    const statsData = useMemo(() => {
        const cards: StatsCard[] = [];
        const colors = ['emerald', 'blue', 'amber', 'violet'];

        if (indices) {
            indices.slice(0, 2).forEach((idx: MarketIndex, i: number) => {
                const changePercent = idx.changePercent || 0;
                const change = idx.change || 0;
                cards.push({
                    symbol: idx.symbol,
                    name: idx.name || idx.symbol,
                    price: idx.value?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0',
                    isCommodity: false,
                    change,
                    changePercent,
                    isUp: changePercent >= 0,
                    color: colors[i % colors.length],
                });
            });
        }

        if (commodities) {
            commodities.slice(0, 2).forEach((c: Commodity, i: number) => {
                const changePercent = c.changePercent || 0;
                const change = c.change || 0;
                cards.push({
                    symbol: c.symbol,
                    name: c.name || c.symbol,
                    price: c.price || 0,
                    isCommodity: true,
                    change,
                    changePercent,
                    isUp: changePercent >= 0,
                    color: colors[(i + 2) % colors.length],
                });
            });
        }

        return cards;
    }, [indices, commodities]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (error || statsData.length === 0) {
        return (
            <div className="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400">
                <AlertCircle size={18} className="mr-2" />
                <span className="text-sm">No market data available. Import data from admin panel.</span>
            </div>
        );
    }

    return (
        <div>
            {marketClosed && (
                <div className="flex items-center gap-1.5 mb-2 px-1">
                    <Clock size={13} className="text-amber-500" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Markets Closed — showing last session data
                    </span>
                </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statsData.map((stat, idx) => {
                const c = colorClasses[stat.color] || colorClasses.emerald;
                return (
                    <div
                        key={`${stat.symbol}-${idx}`}
                        className="relative group overflow-hidden rounded-xl bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.1] backdrop-blur border border-slate-200/80 dark:border-white/10 p-4 transition-all cursor-pointer shadow-sm dark:shadow-none"
                    >
                        {/* Accent bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.accent}`} />

                        {/* Symbol */}
                        <span className={`text-xs font-bold tracking-wide ${c.badge}`}>
                            {stat.symbol}
                        </span>

                        {/* Name */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{stat.name}</p>

                        {/* Price */}
                        <div className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            {stat.isCommodity ? (
                                <PriceDisplay amount={stat.price as number} />
                            ) : (
                                stat.price
                            )}
                        </div>

                        {/* Change row */}
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${stat.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {stat.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stat.isUp ? '+' : ''}
                                {stat.isCommodity ? (
                                    <PriceDisplay amount={Math.abs(stat.change)} showSymbol={false} />
                                ) : (
                                    Math.abs(stat.change).toFixed(2)
                                )}
                            </span>
                            <span className={`text-xs ${stat.isUp ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-red-600/70 dark:text-red-400/70'}`}>
                                ({stat.isUp ? '+' : ''}{stat.changePercent.toFixed(2)}%)
                            </span>
                            {marketClosed && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">prev close</span>
                            )}
                        </div>

                        {/* Mini sparkline */}
                        <div className="mt-3 h-6 flex items-end gap-px opacity-0 group-hover:opacity-100 transition-opacity">
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-t ${c.accent} opacity-30 dark:opacity-40`}
                                    style={{ height: `${20 + Math.random() * 80}%` }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
            </div>
        </div>
    );
}
