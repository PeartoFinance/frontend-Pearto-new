'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getStockFinancials, type CompanyFinancial } from '@/services/marketService';

interface FinancialsTabProps {
    symbol: string;
}

export default function FinancialsTab({ symbol }: FinancialsTabProps) {
    const [financials, setFinancials] = useState<CompanyFinancial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'annual' | 'quarterly'>('annual');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getStockFinancials(symbol, period);
                setFinancials(data);
            } catch (e) {
                console.error('Failed to load financials:', e);
                setError('Financial data not available for this stock.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [symbol, period]);

    const formatLargeNumber = (num: number | null): string => {
        if (num == null) return '-';
        const absNum = Math.abs(num);
        if (absNum >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (absNum >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (absNum >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (absNum >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || financials.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                    {error || 'No financial data available for this stock. Sync from admin panel.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Period Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setPeriod('annual')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === 'annual'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                >
                    Annual
                </button>
                <button
                    onClick={() => setPeriod('quarterly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === 'quarterly'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                >
                    Quarterly
                </button>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {financials[0] && (
                    <>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Revenue</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {formatLargeNumber(financials[0].revenue)}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Net Income</p>
                            <p className={`text-2xl font-bold mt-1 ${(financials[0].netIncome ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'
                                }`}>
                                {formatLargeNumber(financials[0].netIncome)}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Total Assets</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {formatLargeNumber(financials[0].totalAssets)}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">EBITDA</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {formatLargeNumber(financials[0].ebitda)}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Financial Data Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Period</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Revenue</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Net Income</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Gross Profit</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hidden lg:table-cell">EPS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {financials.map((f) => (
                            <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                    {f.fiscalDateEnding ? new Date(f.fiscalDateEnding).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-slate-700 dark:text-slate-300">
                                    {formatLargeNumber(f.revenue)}
                                </td>
                                <td className={`px-4 py-3 text-sm text-right font-medium ${(f.netIncome ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'
                                    }`}>
                                    {formatLargeNumber(f.netIncome)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-slate-700 dark:text-slate-300">
                                    {formatLargeNumber(f.grossProfit)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-slate-700 dark:text-slate-300 hidden lg:table-cell">
                                    {f.epsActual != null ? `$${f.epsActual.toFixed(2)}` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
