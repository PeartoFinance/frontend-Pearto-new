'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { type MarketStock } from '@/services/marketService';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';
import { TableExportButton, type ExportColumn } from '@/components/common/TableExportButton';


interface StockTableProps {
    stocks: MarketStock[];
    loading?: boolean;
}

type SortKey = 'symbol' | 'name' | 'price' | 'change' | 'changePercent' | 'volume' | 'marketCap';
type SortDirection = 'asc' | 'desc';

export default function StockTable({ stocks, loading = false }: StockTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('marketCap');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };

    const sortedStocks = useMemo(() => {
        return [...stocks].sort((a, b) => {
            let aVal = a[sortKey];
            let bVal = b[sortKey];

            // Handle nulls
            if (aVal == null) aVal = sortDirection === 'asc' ? Infinity : -Infinity;
            if (bVal == null) bVal = sortDirection === 'asc' ? Infinity : -Infinity;

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDirection === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return sortDirection === 'asc'
                ? (aVal as number) - (bVal as number)
                : (bVal as number) - (aVal as number);
        });
    }, [stocks, sortKey, sortDirection]);

    const formatNumber = (num: number | undefined | null, decimals = 2): string => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const formatLargeNumber = (num: number | undefined | null): string => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toLocaleString();
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) {
            return <ArrowUpDown size={14} className="text-slate-400" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp size={14} className="text-emerald-500" />
            : <ArrowDown size={14} className="text-emerald-500" />;
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                {['Symbol', 'Name', 'Price', 'Change', 'Volume', 'Market Cap'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i} className="animate-pulse border-t border-slate-100 dark:border-slate-800">
                                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" /></td>
                                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
                                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
                                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    const exportColumns: ExportColumn[] = [
        { key: 'symbol', label: 'Symbol' },
        { key: 'name', label: 'Name' },
        { key: 'price', label: 'Price', format: 'currency' },
        { key: 'change', label: 'Change', format: 'currency' },
        { key: 'changePercent', label: 'Change %', format: 'percent' },
        { key: 'volume', label: 'Volume', format: 'largeNumber' },
        { key: 'marketCap', label: 'Market Cap', format: 'largeNumber' },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header with Export */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Stocks</h3>
                <TableExportButton
                    data={sortedStocks}
                    columns={exportColumns}
                    filename="stocks"
                    title="Stock Data"
                    variant="compact"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">

                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                        <tr>
                            <th
                                onClick={() => handleSort('symbol')}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            >
                                <div className="flex items-center gap-1">
                                    Symbol <SortIcon column="symbol" />
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort('name')}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            >
                                <div className="flex items-center gap-1">
                                    Name <SortIcon column="name" />
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort('price')}
                                className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Price <SortIcon column="price" />
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort('changePercent')}
                                className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Change <SortIcon column="changePercent" />
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort('volume')}
                                className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition hidden lg:table-cell"
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Volume <SortIcon column="volume" />
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort('marketCap')}
                                className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition hidden md:table-cell"
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Market Cap <SortIcon column="marketCap" />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden xl:table-cell">
                                52W Range
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {sortedStocks.map((stock) => {
                            const isPositive = (stock.changePercent ?? 0) >= 0;

                            return (
                                <tr
                                    key={stock.id || stock.symbol}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/stocks/${stock.symbol}`}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                                                {stock.symbol?.slice(0, 2)}
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                                                {stock.symbol}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/stocks/${stock.symbol}`}>
                                            <span className="text-slate-600 dark:text-slate-300 text-sm line-clamp-1 max-w-[200px]">
                                                {stock.name || '-'}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            ${formatNumber(stock.price)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className={`flex items-center justify-end gap-1 font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'
                                            }`}>
                                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            <span>
                                                {isPositive ? '+' : ''}{formatNumber(stock.change)} ({isPositive ? '+' : ''}{formatNumber(stock.changePercent)}%)
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 text-sm hidden lg:table-cell">
                                        {formatLargeNumber(stock.volume)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 text-sm hidden md:table-cell">
                                        {formatLargeNumber(stock.marketCap)}
                                    </td>
                                    <td className="px-4 py-3 text-right hidden xl:table-cell">
                                        <div className="text-xs text-slate-500">
                                            <span className="text-red-500">${formatNumber(stock.low52w, 0)}</span>
                                            <span className="mx-1">-</span>
                                            <span className="text-emerald-500">${formatNumber(stock.high52w, 0)}</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
