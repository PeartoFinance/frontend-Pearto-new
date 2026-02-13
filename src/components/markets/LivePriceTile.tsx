'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, BarChart2, Coins, DollarSign } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { SearchResult } from '@/services/liveChartService';

interface LivePriceTileProps {
    item: SearchResult;
    variant?: 'card' | 'row' | 'compact';
    showRank?: boolean;
    rank?: number;
    flashState?: 'up' | 'down' | null;
    onRemove?: () => void;
    showVolume?: boolean;
}

export function LivePriceTile({
    item,
    variant = 'row',
    showRank = false,
    rank,
    flashState,
    onRemove,
    showVolume = false
}: LivePriceTileProps) {
    const { formatPrice } = useCurrency();
    const isPositive = (item.changePercent || 0) >= 0;

    const Icon = getAssetIcon(item.assetType);
    const colorClass = getAssetColor(item.assetType);
    const link = getSymbolLink(item.symbol, item.assetType);

    const formatNumber = (num: number | null | undefined, decimals = 2) => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toLocaleString();
    };

    if (variant === 'card') {
        return (
            <Link
                href={link}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg hover:border-emerald-500/50 transition group block"
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{item.symbol}</span>
                    <Icon size={14} className={colorClass.split(' ')[0]} />
                </div>
                <p className="text-xs text-slate-500 truncate mb-1">{item.name}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(item.price || 0)}
                </p>
                <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {isPositive ? '+' : ''}{formatNumber(item.change)} ({formatNumber(item.changePercent)}%)
                </div>
            </Link>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${colorClass}`}>
                        {item.symbol.slice(0, 2)}
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.unit || ''}</p>
                    </div>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatPrice(item.price || 0)}
                </p>
                <p className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{formatNumber(item.changePercent)}%
                </p>
            </div>
        );
    }

    // Default row variant
    return (
        <div
            className={`flex items-center justify-between p-4 transition-colors ${flashState === 'up' ? 'bg-emerald-500/10' :
                flashState === 'down' ? 'bg-red-500/10' : ''
                }`}
        >
            <Link href={link} className="flex items-center gap-3">
                {showRank && rank !== undefined && (
                    <span className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${isPositive ? 'bg-emerald-500' : 'bg-red-500'
                        }`}>
                        {rank}
                    </span>
                )}
                {!showRank && (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon size={18} />
                    </div>
                )}
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.symbol}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.name}</p>
                </div>
            </Link>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className={`text-lg font-bold transition-colors ${flashState === 'up' ? 'text-emerald-500' :
                        flashState === 'down' ? 'text-red-500' :
                            'text-slate-900 dark:text-white'
                        }`}>
                        {formatPrice(item.price || 0)}
                    </p>
                    <div className={`flex items-center justify-end gap-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {isPositive ? '+' : ''}{formatNumber(item.change)} ({formatNumber(item.changePercent)}%)
                    </div>
                </div>

                {showVolume && (
                    <div className="text-right text-sm text-slate-500">
                        <p>Vol: {formatLargeNumber(item.volume)}</p>
                    </div>
                )}

                {onRemove && (
                    <button
                        onClick={(e) => { e.preventDefault(); onRemove(); }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                    >
                        <span className="sr-only">Remove</span>
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}

// Helper functions
export function getAssetIcon(type: string) {
    switch (type) {
        case 'index': return BarChart2;
        case 'commodity': return DollarSign;
        case 'crypto': return Coins;
        default: return TrendingUp;
    }
}

export function getAssetColor(type: string) {
    switch (type) {
        case 'index': return 'text-blue-500 bg-blue-500/10';
        case 'commodity': return 'text-amber-500 bg-amber-500/10';
        case 'crypto': return 'text-purple-500 bg-purple-500/10';
        default: return 'text-emerald-500 bg-emerald-500/10';
    }
}

export function getSymbolLink(symbol: string, type: string) {
    switch (type) {
        case 'crypto': return `/crypto/${symbol}`;
        case 'index': return `/live?symbol=${symbol}&type=stock`;
        default: return `/stocks/${symbol}`;
    }
}
