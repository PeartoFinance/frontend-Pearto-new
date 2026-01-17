'use client';

import { type MarketStock } from '@/services/marketService';

interface StockStatsProps {
    stock: MarketStock;
}

export default function StockStats({ stock }: StockStatsProps) {
    const formatNumber = (num: number | undefined | null, decimals = 2): string => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const formatLargeNumber = (num: number | undefined | null): string => {
        if (num == null) return '-';
        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toLocaleString()}`;
    };

    const formatPercent = (num: number | undefined | null): string => {
        if (num == null) return '-';
        return `${(num * 100).toFixed(2)}%`;
    };

    const stats = [
        { label: 'Open', value: `$${formatNumber(stock.open)}` },
        { label: 'High', value: `$${formatNumber(stock.dayHigh)}` },
        { label: 'Low', value: `$${formatNumber(stock.dayLow)}` },
        { label: 'Prev Close', value: `$${formatNumber(stock.previousClose)}` },
        { label: '52W High', value: `$${formatNumber(stock.high52w)}` },
        { label: '52W Low', value: `$${formatNumber(stock.low52w)}` },
        { label: 'Volume', value: stock.volume?.toLocaleString() || '-' },
        { label: 'Avg Volume', value: stock.avgVolume?.toLocaleString() || '-' },
        { label: 'Market Cap', value: formatLargeNumber(stock.marketCap) },
        { label: 'P/E Ratio', value: formatNumber(stock.peRatio) },
        { label: 'EPS', value: `$${formatNumber(stock.eps)}` },
        { label: 'Beta', value: formatNumber(stock.beta) },
        { label: 'Dividend Yield', value: stock.dividendYield ? formatPercent(stock.dividendYield) : '-' },
        { label: 'Dividend Rate', value: stock.dividendRate ? `$${formatNumber(stock.dividendRate)}` : '-' },
        { label: 'Sector', value: stock.sector || '-' },
        { label: 'Industry', value: stock.industry || '-' },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Key Statistics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                    >
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                            {stat.label}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
