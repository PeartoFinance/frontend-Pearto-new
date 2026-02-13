'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Activity, Coins, BarChart2, DollarSign } from 'lucide-react';
import type { SearchResult } from '@/services/liveChartService';
import { getAssetColor, getAssetIcon, getSymbolLink } from './LivePriceTile';
import { useCurrency } from '@/contexts/CurrencyContext';

interface MarketPulsePanelProps {
    title: string;
    icon: typeof TrendingUp;
    iconColor: string;
    items: SearchResult[];
    variant?: 'gainers' | 'losers' | 'active' | 'crypto' | 'default';
}

export function MarketPulsePanel({
    title,
    icon: Icon,
    iconColor,
    items,
    variant = 'default'
}: MarketPulsePanelProps) {
    const { formatPrice } = useCurrency();
    const formatNumber = (num: number | null | undefined, decimals = 2) => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const getRankColor = () => {
        switch (variant) {
            case 'gainers': return 'bg-emerald-500';
            case 'losers': return 'bg-red-500';
            case 'crypto': return 'bg-purple-500';
            case 'active': return 'bg-blue-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                <Icon size={18} className={iconColor} />
                <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {items.map((item, idx) => {
                    const isPositive = (item.changePercent || 0) >= 0;
                    const link = item.assetType === 'crypto'
                        ? `/crypto/${item.symbol}`
                        : `/stocks/${item.symbol}`;

                    return (
                        <Link
                            key={`${item.symbol}-${idx}`}
                            href={link}
                            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${getRankColor()}`}>
                                    {idx + 1}
                                </span>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{item.symbol}</p>
                                    <p className="text-xs text-slate-500 truncate max-w-[120px]">{item.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(item.price || 0)}</p>
                                <p className={`text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {isPositive ? '+' : ''}{formatNumber(item.changePercent)}%
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

interface CommoditiesPanelProps {
    commodities: SearchResult[];
}

export function CommoditiesPanel({ commodities }: CommoditiesPanelProps) {
    const { formatPrice } = useCurrency();
    const formatNumber = (num: number | null | undefined, decimals = 2) => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    if (commodities.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                <DollarSign size={18} className="text-amber-500" />
                <span className="font-semibold text-slate-900 dark:text-white">Commodities</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-slate-100 dark:divide-slate-700/50">
                {commodities.map(comm => {
                    const isPositive = (comm.changePercent || 0) >= 0;
                    return (
                        <div key={comm.symbol} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs font-bold">
                                    {comm.symbol.slice(0, 2)}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-900 dark:text-white">{comm.name}</p>
                                    <p className="text-[10px] text-slate-500">{comm.unit || 'oz'}</p>
                                </div>
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {formatPrice(comm.price || 0)}
                            </p>
                            <p className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isPositive ? '+' : ''}{formatNumber(comm.changePercent)}%
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface IndicesGridProps {
    indices: SearchResult[];
}

export function IndicesGrid({ indices }: IndicesGridProps) {
    const { formatPrice } = useCurrency();
    const formatNumber = (num: number | null | undefined, decimals = 2) => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {indices.map(idx => {
                const isPositive = (idx.changePercent || 0) >= 0;
                return (
                    <Link
                        key={idx.symbol}
                        href={`/live?symbol=${idx.symbol}&type=stock`}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg hover:border-emerald-500/50 transition group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{idx.symbol}</span>
                            <BarChart2 size={14} className="text-blue-500" />
                        </div>
                        <p className="text-xs text-slate-500 truncate mb-1">{idx.name}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {formatPrice(idx.price || 0)}
                        </p>
                        <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {isPositive ? '+' : ''}{formatNumber(idx.change)} ({formatNumber(idx.changePercent)}%)
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

interface VolumeBarChartProps {
    items: SearchResult[];
}

export function VolumeBarChart({ items }: VolumeBarChartProps) {
    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toLocaleString();
    };

    const maxVolume = Math.max(...items.map(s => s.volume || 0));

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                <span className="font-semibold text-slate-900 dark:text-white">Most Active by Volume</span>
            </div>
            <div className="p-5 space-y-4">
                {items.map(item => {
                    const widthPercent = ((item.volume || 0) / maxVolume) * 100;
                    const isPositive = (item.changePercent || 0) >= 0;

                    return (
                        <div key={item.symbol} className="flex items-center gap-4">
                            <Link
                                href={`/stocks/${item.symbol}`}
                                className="w-16 font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                                {item.symbol}
                            </Link>
                            <div className="flex-1">
                                <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${isPositive ? 'bg-emerald-500/80' : 'bg-red-500/80'}`}
                                        style={{ width: `${widthPercent}%` }}
                                    />
                                </div>
                            </div>
                            <span className="w-20 text-right text-sm text-slate-600 dark:text-slate-300">
                                {formatLargeNumber(item.volume)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
