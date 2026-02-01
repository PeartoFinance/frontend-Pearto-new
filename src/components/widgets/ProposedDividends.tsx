'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Gift, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { get } from '@/services/api';
import { TableExportButton } from '@/components/common/TableExportButton';

interface Dividend {
    id: number;
    symbol: string;
    companyName?: string;
    bonusPercent: number;
    cashPercent: number;
    totalPercent: number;
    bookClosureDate?: string;
    fiscalYear: string;
}

export default function ProposedDividends() {
    const [dividends, setDividends] = useState<Dividend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchDividends = async () => {
            try {
                setLoading(true);
                const data = await get<Dividend[]>('/market/dividends');
                setDividends(data || []);
                setError(false);
            } catch (err) {
                console.error('Failed to fetch dividends:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchDividends();
    }, []);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Not Announced';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Calculate Pagination
    const totalPages = Math.ceil(dividends.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDividends = dividends.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Gift size={18} className="text-emerald-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">Proposed Dividends</span>
                </div>
                <div className="flex items-center gap-3">
                    <TableExportButton
                        data={dividends}
                        columns={[
                            { key: 'symbol', label: 'Symbol' },
                            { key: 'companyName', label: 'Company' },
                            { key: 'bonusPercent', label: 'Bonus %', format: 'percent' },
                            { key: 'cashPercent', label: 'Cash %', format: 'percent' },
                            { key: 'totalPercent', label: 'Total %', format: 'percent' },
                            { key: 'bookClosureDate', label: 'Book Closure', format: 'date' },
                            { key: 'fiscalYear', label: 'Fiscal Year' },
                        ]}
                        filename="proposed-dividends"
                        title="Proposed Dividends"
                        variant="icon"
                    />
                    <Link
                        href="/market/dividends"
                        className="text-sm text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                    >
                        View All <ArrowUpRight size={14} />
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8 flex-1">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                </div>
            ) : error || dividends.length === 0 ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-500 flex-1">
                    <AlertCircle size={18} />
                    <span>No dividend data available</span>
                </div>
            ) : (
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Symbol</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Bonus (%)</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cash (%)</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total (%)</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Book Closure</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fiscal Year</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                                {paginatedDividends.map((div) => (
                                    <tr key={div.id || div.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={`/stocks/${div.symbol}`} className="flex items-center gap-2 hover:underline">
                                                <span className="w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                    {div.symbol.slice(0, 2)}
                                                </span>
                                                <span className="font-medium text-emerald-600 dark:text-emerald-400">{div.symbol}</span>
                                            </Link>
                                        </td>
                                        <td className="text-right px-4 py-3 text-slate-700 dark:text-slate-300">{div.bonusPercent?.toFixed(2) || '0.00'}</td>
                                        <td className="text-right px-4 py-3 text-slate-700 dark:text-slate-300">{div.cashPercent?.toFixed(2) || '0.00'}</td>
                                        <td className="text-right px-4 py-3 font-semibold text-emerald-500">{div.totalPercent?.toFixed(2) || '0.00'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${!div.bookClosureDate
                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                {formatDate(div.bookClosureDate)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{div.fiscalYear}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-auto px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, dividends.length)} of {dividends.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-2 font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
