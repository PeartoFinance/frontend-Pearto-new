'use client';

import { useState, useCallback, useEffect } from 'react';
import { StockChartWidget } from '@/components/charts';
import { Loader2, ChevronDown } from 'lucide-react';
import { getStockHistory } from '@/services/marketService';
import { TableExportButton } from '@/components/common/TableExportButton';

interface HistoryTabProps {
    symbol: string;
}

interface PriceDataPoint {
    date: string;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume: number | null;
}

type Period = '1M' | '3M' | '6M' | '1Y' | '5Y' | 'All';
type Interval = 'Daily' | 'Weekly' | 'Monthly';

export default function HistoryTab({ symbol }: HistoryTabProps) {
    const [period, setPeriod] = useState<Period>('6M');
    const [interval, setInterval] = useState<Interval>('Daily');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PriceDataPoint[]>([]);
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
    const [showIntervalDropdown, setShowIntervalDropdown] = useState(false);

    const periodMap: Record<Period, string> = {
        '1M': '1mo',
        '3M': '3mo',
        '6M': '6mo',
        '1Y': '1y',
        '5Y': '5y',
        'All': 'max',
    };

    const intervalMap: Record<Interval, string> = {
        'Daily': '1d',
        'Weekly': '1wk',
        'Monthly': '1mo',
    };

    // Fetch data
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getStockHistory(symbol, periodMap[period], intervalMap[interval]);
            if (response?.data) {
                const sorted = response.data
                    .map((d: any) => ({
                        date: d.date.split('T')[0],
                        open: d.open,
                        high: d.high,
                        low: d.low,
                        close: d.close,
                        volume: d.volume,
                    }))
                    .sort((a: PriceDataPoint, b: PriceDataPoint) => b.date.localeCompare(a.date));
                setData(sorted);
            }
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoading(false);
        }
    }, [symbol, period, interval]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Format helpers
    const formatNumber = (num: number | null, decimals = 2): string => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatLargeNumber = (num: number | null): string => {
        if (num == null) return '-';
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toLocaleString();
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const calculateChange = (current: number | null, previous: number | null): { value: number; percent: number } | null => {
        if (current == null || previous == null || previous === 0) return null;
        const value = current - previous;
        const percent = (value / previous) * 100;
        return { value, percent };
    };

    // Prepare data for chart (reversed for chronological order)
    const chartData = [...data].reverse();

    return (
        <div className="space-y-5">
            {/* Mini Chart using StockChartWidget */}
            <StockChartWidget
                data={chartData}
                symbol={symbol}
                loading={loading}
                height={200}
                showVolume={false}
                showPriceInfoBar={false}
                showHeader={false}
                showChartTypeSelector={false}
                showPeriodSelector={false}
                initialChartType="area"
            />

            {/* Historical Data Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Table Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Historical Data</h3>

                    <div className="flex items-center gap-2">
                        {/* Interval Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowIntervalDropdown(!showIntervalDropdown); setShowPeriodDropdown(false); }}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                {interval}
                                <ChevronDown size={14} />
                            </button>
                            {showIntervalDropdown && (
                                <div className="absolute right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                                    {(['Daily', 'Weekly', 'Monthly'] as Interval[]).map(i => (
                                        <button
                                            key={i}
                                            onClick={() => { setInterval(i); setShowIntervalDropdown(false); }}
                                            className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            {i}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Period Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowPeriodDropdown(!showPeriodDropdown); setShowIntervalDropdown(false); }}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                {period === 'All' ? 'All Time' : period.replace('M', ' Months').replace('Y', ' Year')}
                                <ChevronDown size={14} />
                            </button>
                            {showPeriodDropdown && (
                                <div className="absolute right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                                    {(['1M', '3M', '6M', '1Y', '5Y', 'All'] as Period[]).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => { setPeriod(p); setShowPeriodDropdown(false); }}
                                            className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 whitespace-nowrap"
                                        >
                                            {p === 'All' ? 'All Time' : p.replace('M', ' Months').replace('Y', ' Year')}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Export Button */}
                        <TableExportButton
                            data={data}
                            columns={[
                                { key: 'date', label: 'Date', format: 'date' },
                                { key: 'open', label: 'Open', format: 'currency' },
                                { key: 'high', label: 'High', format: 'currency' },
                                { key: 'low', label: 'Low', format: 'currency' },
                                { key: 'close', label: 'Close', format: 'currency' },
                                { key: 'volume', label: 'Volume', format: 'largeNumber' },
                            ]}
                            filename={`${symbol}-history-${period}`}
                            title={`${symbol} Price History`}
                            variant="compact"
                        />
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                )}

                {/* Table */}
                {!loading && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Date</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Open</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">High</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Low</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Close</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Adj. Close</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Change</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Volume</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.map((row, idx) => {
                                    const prevRow = data[idx + 1];
                                    const change = calculateChange(row.close, prevRow?.close);
                                    const isPositive = change && change.value >= 0;

                                    return (
                                        <tr key={row.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                                                {formatDate(row.date)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                                                {formatNumber(row.open)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                                                {formatNumber(row.high)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                                                {formatNumber(row.low)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-medium">
                                                {formatNumber(row.close)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                                                {formatNumber(row.close)}
                                            </td>
                                            <td className={`px-4 py-3 text-right font-medium ${change == null ? 'text-slate-400' :
                                                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {change ? `${isPositive ? '+' : ''}${change.percent.toFixed(2)}%` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                                                {formatLargeNumber(row.volume)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
