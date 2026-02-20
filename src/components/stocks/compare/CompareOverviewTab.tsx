'use client';

import { TrendingUp, TrendingDown, Crown } from 'lucide-react';
import type { MarketStock, PriceHistoryPoint } from '@/services/marketService';
import { TableExportButton } from '@/components/common/TableExportButton';
import PriceDisplay from '@/components/common/PriceDisplay';

interface CompareStock extends MarketStock {
    color: string;
    data: PriceHistoryPoint[];
}

interface CompareOverviewTabProps {
    stocks: CompareStock[];
}

type MetricConfig = {
    label: string;
    getValue: (s: CompareStock) => React.ReactNode;
    getRaw: (s: CompareStock) => number | null | undefined;
    color?: (s: CompareStock) => string;
    highlight?: boolean;
    higherIsBetter?: boolean; // true = higher is better, false = lower is better
};

export default function CompareOverviewTab({ stocks }: CompareOverviewTabProps) {
    const formatNumber = (num: number | null | undefined, decimals = 2) => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        return num.toLocaleString();
    };

    // Determine the "best" stock for a given metric
    const getBestIndex = (metric: MetricConfig): number => {
        if (stocks.length < 2) return -1;
        let bestIdx = -1;
        let bestVal: number | null = null;

        stocks.forEach((s, i) => {
            const val = metric.getRaw(s);
            if (val == null) return;
            if (bestVal == null) {
                bestVal = val;
                bestIdx = i;
            } else if (metric.higherIsBetter !== false && val > bestVal) {
                bestVal = val;
                bestIdx = i;
            } else if (metric.higherIsBetter === false && val < bestVal) {
                bestVal = val;
                bestIdx = i;
            }
        });

        // Only show crown if at least 2 stocks have valid values
        const validCount = stocks.filter(s => metric.getRaw(s) != null).length;
        return validCount >= 2 ? bestIdx : -1;
    };

    const metrics: MetricConfig[] = [
        {
            label: 'Price',
            getValue: (s) => <PriceDisplay amount={s.price} />,
            getRaw: (s) => s.price,
            highlight: true,
            higherIsBetter: undefined, // neutral — no "best"
        },
        {
            label: 'Change %',
            getValue: (s) => `${s.changePercent >= 0 ? '+' : ''}${formatNumber(s.changePercent)}%`,
            getRaw: (s) => s.changePercent,
            color: (s) => s.changePercent >= 0 ? 'text-teal-600' : 'text-red-500',
            higherIsBetter: true,
        },
        {
            label: 'Market Cap',
            getValue: (s) => formatLargeNumber(s.marketCap),
            getRaw: (s) => s.marketCap,
            higherIsBetter: true,
        },
        {
            label: 'Volume',
            getValue: (s) => formatLargeNumber(s.volume),
            getRaw: (s) => s.volume,
            higherIsBetter: true,
        },
        {
            label: 'P/E Ratio',
            getValue: (s) => formatNumber(s.peRatio),
            getRaw: (s) => s.peRatio,
            higherIsBetter: false, // Lower PE = better value
        },
        {
            label: 'EPS',
            getValue: (s) => <PriceDisplay amount={s.eps} />,
            getRaw: (s) => s.eps,
            higherIsBetter: true,
        },
        {
            label: 'Beta',
            getValue: (s) => formatNumber(s.beta),
            getRaw: (s) => s.beta,
        },
        {
            label: '52W High',
            getValue: (s) => <PriceDisplay amount={s.high52w} />,
            getRaw: (s) => s.high52w,
        },
        {
            label: '52W Low',
            getValue: (s) => <PriceDisplay amount={s.low52w} />,
            getRaw: (s) => s.low52w,
        },
        {
            label: '52W Range Position',
            getValue: (s) => {
                if (!s.high52w || !s.low52w || !s.price) return '-';
                const pct = ((s.price - s.low52w) / (s.high52w - s.low52w)) * 100;
                return (
                    <div className="flex items-center gap-2 justify-end">
                        <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-teal-400"
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                            />
                        </div>
                        <span className="text-xs">{pct.toFixed(0)}%</span>
                    </div>
                );
            },
            getRaw: (s) => {
                if (!s.high52w || !s.low52w || !s.price) return null;
                return ((s.price - s.low52w) / (s.high52w - s.low52w)) * 100;
            },
        },
        {
            label: 'Dividend Yield',
            getValue: (s) => s.dividendYield ? `${formatNumber(s.dividendYield)}%` : '-',
            getRaw: (s) => s.dividendYield ?? null,
            higherIsBetter: true,
        },
        {
            label: 'Avg Volume',
            getValue: (s) => formatLargeNumber(s.avgVolume),
            getRaw: (s) => s.avgVolume,
        },
        {
            label: 'Open',
            getValue: (s) => <PriceDisplay amount={s.open} />,
            getRaw: (s) => s.open,
        },
        {
            label: 'Previous Close',
            getValue: (s) => <PriceDisplay amount={s.previousClose} />,
            getRaw: (s) => s.previousClose,
        },
    ];

    // Pre-compute best indices
    const bestIndices = metrics.map(m => m.higherIsBetter !== undefined ? getBestIndex(m) : -1);

    return (
        <div className="space-y-5">
            {/* Stock Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stocks.map((stock) => (
                    <div
                        key={stock.symbol}
                        className="bg-white dark:bg-slate-900 rounded-xl border-2 p-5 transition-shadow hover:shadow-lg"
                        style={{ borderColor: stock.color }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stock.symbol}</h3>
                                <p className="text-sm text-slate-500 truncate max-w-[180px]">{stock.name}</p>
                            </div>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stock.color }} />
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                <PriceDisplay amount={stock.price} />
                            </span>
                            <span className={`flex items-center text-sm font-medium ${stock.changePercent >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                                {stock.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {stock.changePercent >= 0 ? '+' : ''}{formatNumber(stock.changePercent)}%
                            </span>
                        </div>

                        {/* 52W Range Bar */}
                        {stock.high52w && stock.low52w && stock.price && (
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>52W Low</span>
                                    <span>52W High</span>
                                </div>
                                <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                                    <div
                                        className="absolute h-full rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-teal-400"
                                        style={{ width: `${Math.min(100, Math.max(0, ((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100))}%` }}
                                    />
                                    <div
                                        className="absolute w-2.5 h-2.5 bg-white dark:bg-slate-200 rounded-full border-2 border-slate-900 dark:border-white -top-[1px]"
                                        style={{ left: `${Math.min(100, Math.max(0, ((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100))}%`, transform: 'translateX(-50%)' }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <PriceDisplay amount={stock.low52w} />
                                    <PriceDisplay amount={stock.high52w} />
                                </div>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-slate-500">Mkt Cap</span> <span className="font-medium text-slate-900 dark:text-white ml-1">{formatLargeNumber(stock.marketCap)}</span></div>
                            <div><span className="text-slate-500">P/E</span> <span className="font-medium text-slate-900 dark:text-white ml-1">{formatNumber(stock.peRatio)}</span></div>
                            <div><span className="text-slate-500">EPS</span> <span className="font-medium text-slate-900 dark:text-white ml-1"><PriceDisplay amount={stock.eps} /></span></div>
                            <div><span className="text-slate-500">Beta</span> <span className="font-medium text-slate-900 dark:text-white ml-1">{formatNumber(stock.beta)}</span></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Comparison Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Detailed Metrics Comparison
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Crown size={10} className="text-amber-500" /> indicates best value among compared stocks
                        </p>
                    </div>
                    <TableExportButton
                        data={stocks}
                        columns={[
                            { key: 'symbol', label: 'Symbol' },
                            { key: 'price', label: 'Price', format: 'currency' },
                            { key: 'changePercent', label: 'Change %', format: 'percent' },
                            { key: 'marketCap', label: 'Market Cap', format: 'largeNumber' },
                            { key: 'volume', label: 'Volume', format: 'largeNumber' },
                            { key: 'peRatio', label: 'P/E Ratio', format: 'number' },
                            { key: 'eps', label: 'EPS', format: 'currency' },
                        ]}
                        filename="stock-comparison"
                        title="Stock Comparison"
                        variant="icon"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-500">Metric</th>
                                {stocks.map((stock) => (
                                    <th key={stock.symbol} className="text-right py-3 px-4 text-sm font-semibold" style={{ color: stock.color }}>
                                        {stock.symbol}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {metrics.map((metric, mIdx) => (
                                <tr key={metric.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="py-3 px-4 text-sm text-slate-500">{metric.label}</td>
                                    {stocks.map((s, sIdx) => {
                                        const isBest = bestIndices[mIdx] === sIdx;
                                        return (
                                            <td
                                                key={s.symbol}
                                                className={`py-3 px-4 text-right text-sm font-medium ${metric.color ? metric.color(s) : 'text-slate-900 dark:text-white'} ${isBest ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
                                            >
                                                <span className="inline-flex items-center gap-1 justify-end">
                                                    {isBest && <Crown size={12} className="text-amber-500 flex-shrink-0" />}
                                                    {metric.getValue(s)}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
