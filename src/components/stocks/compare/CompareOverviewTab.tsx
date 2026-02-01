'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
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

    const metrics = [
        { label: 'Price', getValue: (s: CompareStock) => <PriceDisplay amount={s.price} />, highlight: true },
        { label: 'Change %', getValue: (s: CompareStock) => `${s.changePercent >= 0 ? '+' : ''}${formatNumber(s.changePercent)}%`, color: (s: CompareStock) => s.changePercent >= 0 ? 'text-teal-600' : 'text-red-500' },
        { label: 'Market Cap', getValue: (s: CompareStock) => formatLargeNumber(s.marketCap) },
        { label: 'Volume', getValue: (s: CompareStock) => formatLargeNumber(s.volume) },
        { label: 'P/E Ratio', getValue: (s: CompareStock) => formatNumber(s.peRatio) },
        { label: 'EPS', getValue: (s: CompareStock) => <PriceDisplay amount={s.eps} /> },
        { label: 'Beta', getValue: (s: CompareStock) => formatNumber(s.beta) },
        { label: '52W High', getValue: (s: CompareStock) => <PriceDisplay amount={s.high52w} /> },
        { label: '52W Low', getValue: (s: CompareStock) => <PriceDisplay amount={s.low52w} /> },
        { label: 'Dividend Yield', getValue: (s: CompareStock) => s.dividendYield ? `${(s.dividendYield * 100).toFixed(2)}%` : '-' },
        { label: 'Avg Volume', getValue: (s: CompareStock) => formatLargeNumber(s.avgVolume) },
        { label: 'Open', getValue: (s: CompareStock) => <PriceDisplay amount={s.open} /> },
        { label: 'Previous Close', getValue: (s: CompareStock) => <PriceDisplay amount={s.previousClose} /> },
    ];

    return (
        <div className="space-y-5">
            {/* Stock Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stocks.map((stock) => (
                    <div
                        key={stock.symbol}
                        className="bg-white dark:bg-slate-900 rounded-xl border-2 p-5"
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
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Detailed Metrics Comparison
                    </h3>
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
                            {metrics.map((metric) => (
                                <tr key={metric.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="py-3 px-4 text-sm text-slate-500">{metric.label}</td>
                                    {stocks.map((s) => (
                                        <td
                                            key={s.symbol}
                                            className={`py-3 px-4 text-right text-sm font-medium ${metric.color ? metric.color(s) : 'text-slate-900 dark:text-white'}`}
                                        >
                                            {metric.getValue(s)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
