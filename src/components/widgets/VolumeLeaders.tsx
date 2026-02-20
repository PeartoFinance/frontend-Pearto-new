'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BarChart3, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { get } from '@/services/api';
import { TableExportButton } from '@/components/common/TableExportButton';
import PriceDisplay from '@/components/common/PriceDisplay';

interface ActiveStock {
    symbol: string;
    name?: string;
    price?: number;
    change?: number;
    changePercent?: number;
    volume?: number;
}

function formatVolume(vol: number): string {
    if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(1) + 'B';
    if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(1) + 'M';
    if (vol >= 1_000) return (vol / 1_000).toFixed(1) + 'K';
    return vol.toString();
}

export default function VolumeLeaders() {
    const [stocks, setStocks] = useState<ActiveStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);
            const data = await get<ActiveStock[]>('/live/most-active', { limit: 10 });
            setStocks(data || []);
        } catch (err) {
            console.error('Failed to fetch volume leaders:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Find max volume for relative bar widths
    const maxVol = stocks.reduce((max, s) => Math.max(max, s.volume || 0), 0);

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-blue-500" />
                    <div>
                        <span className="font-semibold text-slate-900 dark:text-white">Volume Leaders</span>
                        <p className="text-[10px] text-slate-400">Most actively traded stocks today</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <TableExportButton
                        data={stocks}
                        columns={[
                            { key: 'symbol', label: 'Symbol' },
                            { key: 'name', label: 'Name' },
                            { key: 'price', label: 'Price', format: 'currency' },
                            { key: 'changePercent', label: 'Change %', format: 'percent' },
                            { key: 'volume', label: 'Volume', format: 'number' },
                        ]}
                        filename="volume-leaders"
                        title="Volume Leaders"
                        variant="icon"
                    />
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
            ) : error || stocks.length === 0 ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
                    <AlertCircle size={18} />
                    <span>No volume data available</span>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Symbol</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Price</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Change</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 min-w-[140px]">Volume</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {stocks.map((stock, idx) => {
                                const pct = stock.changePercent || 0;
                                const isUp = pct >= 0;
                                const volPct = maxVol > 0 ? ((stock.volume || 0) / maxVol) * 100 : 0;

                                return (
                                    <tr key={`${stock.symbol}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={`/stocks/${stock.symbol}`} className="flex items-center gap-2.5 hover:underline">
                                                <span className="w-7 h-7 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                                    {stock.symbol?.slice(0, 2)}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{stock.symbol}</p>
                                                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{stock.name}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="text-right px-4 py-3">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                <PriceDisplay amount={stock.price || 0} />
                                            </span>
                                        </td>
                                        <td className="text-right px-4 py-3">
                                            <span className={`flex items-center justify-end gap-1 text-xs font-semibold ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                {isUp ? '+' : ''}{pct.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                    {formatVolume(stock.volume || 0)}
                                                </span>
                                                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${isUp ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                        style={{ width: `${volPct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
