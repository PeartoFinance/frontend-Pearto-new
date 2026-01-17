'use client';

import { type MarketStock } from '@/services/marketService';
import { TrendingUp, TrendingDown, Globe, Building2 } from 'lucide-react';

interface StockHeaderProps {
    stock: MarketStock;
}

export default function StockHeader({ stock }: StockHeaderProps) {
    const isPositive = (stock.changePercent ?? 0) >= 0;

    const formatNumber = (num: number | undefined | null, decimals = 2): string => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Logo, Symbol, Name */}
                <div className="flex items-center gap-4">
                    {/* Logo Placeholder */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {stock.symbol?.slice(0, 2)}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stock.symbol}
                            </h1>
                            {stock.exchange && (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium rounded">
                                    {stock.exchange}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                            {stock.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            {stock.sector && (
                                <span className="flex items-center gap-1">
                                    <Building2 size={12} />
                                    {stock.sector}
                                </span>
                            )}
                            {stock.website && (
                                <a
                                    href={stock.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-emerald-500"
                                >
                                    <Globe size={12} />
                                    Website
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Price and Change */}
                <div className="text-left lg:text-right">
                    <div className="flex items-baseline gap-2 lg:justify-end">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                            ${formatNumber(stock.price)}
                        </span>
                        <span className="text-sm text-slate-500">
                            {stock.currency || 'USD'}
                        </span>
                    </div>

                    <div className={`flex items-center gap-2 mt-1 lg:justify-end ${isPositive ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                        {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        <span className="text-lg font-semibold">
                            {isPositive ? '+' : ''}{formatNumber(stock.change)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-sm font-medium ${isPositive
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                            {isPositive ? '+' : ''}{formatNumber(stock.changePercent)}%
                        </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                        Last updated: {stock.lastUpdated
                            ? new Date(stock.lastUpdated).toLocaleString()
                            : 'Live'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
