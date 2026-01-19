'use client';

import { useState, useEffect } from 'react';
import { Loader2, Wallet, Calendar, DollarSign } from 'lucide-react';
import { getStockDividends, type DividendRecord } from '@/services/marketService';

interface DividendsTabProps {
    symbol: string;
}

export default function DividendsTab({ symbol }: DividendsTabProps) {
    const [dividends, setDividends] = useState<DividendRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getStockDividends(symbol);
                setDividends(data);
            } catch (e) {
                console.error('Failed to load dividends:', e);
                setError('Dividend data not available.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [symbol]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || dividends.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <Wallet className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                    {error || 'No dividend history available for this stock.'}
                </p>
            </div>
        );
    }

    const getStatusColor = (status: DividendRecord['status']) => {
        switch (status) {
            case 'paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'approved': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    return (
        <div className="space-y-5">
            {/* Summary Card */}
            {dividends[0] && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={20} />
                        <span className="text-sm font-medium uppercase tracking-wide opacity-90">Latest Dividend</span>
                    </div>
                    <div className="text-3xl font-bold">
                        {dividends[0].dividendAmount != null ? `$${dividends[0].dividendAmount.toFixed(2)}` : `${dividends[0].totalPercent}%`}
                    </div>
                    <p className="text-sm mt-1 opacity-80">
                        {dividends[0].exDividendDate ? `Ex-Dividend: ${new Date(dividends[0].exDividendDate).toLocaleDateString()}` : dividends[0].fiscalYear}
                    </p>
                </div>
            )}

            {/* Dividend History Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" />
                        Dividend History
                    </h3>
                </div>
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Period</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Ex-Date</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {dividends.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                    {d.fiscalYear || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 capitalize">
                                    {d.dividendType}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-medium text-slate-900 dark:text-white">
                                    {d.dividendAmount != null ? `$${d.dividendAmount.toFixed(2)}` : `${d.totalPercent}%`}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-slate-500 hidden sm:table-cell">
                                    {d.exDividendDate ? new Date(d.exDividendDate).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(d.status)}`}>
                                        {d.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
