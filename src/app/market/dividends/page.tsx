'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import { get } from '@/services/api';
import {
    ArrowLeft, Gift, Loader2, AlertCircle, TrendingUp, TrendingDown,
    Calendar, Filter, Search, Download, RefreshCw
} from 'lucide-react';
import { TableExportButton } from '@/components/common/TableExportButton';
import Footer from '@/components/layout/Footer';

interface Dividend {
    id: number;
    symbol: string;
    companyName?: string;
    bonusPercent: number;
    cashPercent: number;
    totalPercent: number;
    bookClosureDate?: string;
    fiscalYear: string;
    sector?: string;
}

export default function DividendsPage() {
    const [dividends, setDividends] = useState<Dividend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'totalPercent' | 'symbol' | 'bookClosureDate'>('totalPercent');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchDividends = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchDividends();
    }, [fetchDividends]);

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

    // Filter and sort dividends
    const filteredDividends = dividends
        .filter(d =>
            d.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'totalPercent') {
                comparison = (a.totalPercent || 0) - (b.totalPercent || 0);
            } else if (sortBy === 'symbol') {
                comparison = a.symbol.localeCompare(b.symbol);
            } else if (sortBy === 'bookClosureDate') {
                comparison = (a.bookClosureDate || '').localeCompare(b.bookClosureDate || '');
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });

    // Stats
    const totalDividends = dividends.length;
    const avgDividend = dividends.length > 0
        ? dividends.reduce((sum, d) => sum + (d.totalPercent || 0), 0) / dividends.length
        : 0;
    const highestDividend = dividends.length > 0
        ? Math.max(...dividends.map(d => d.totalPercent || 0))
        : 0;
    const upcomingCount = dividends.filter(d => {
        if (!d.bookClosureDate) return false;
        return new Date(d.bookClosureDate) > new Date();
    }).length;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden">
                    <div className="p-4 lg:p-6 space-y-6 w-full max-w-7xl mx-auto">
                        {/* Back Link */}
                        <Link href="/markets" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-500 text-sm">
                            <ArrowLeft size={16} />
                            Back to Markets
                        </Link>

                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                    <Gift className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        Proposed Dividends
                                    </h1>
                                    <p className="text-slate-500">Track upcoming dividend announcements</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={fetchDividends}
                                    disabled={loading}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                                >
                                    <RefreshCw size={18} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Total Dividends</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalDividends}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Average Yield</p>
                                <p className="text-2xl font-bold text-emerald-500">{avgDividend.toFixed(2)}%</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Highest Dividend</p>
                                <p className="text-2xl font-bold text-emerald-500">{highestDividend.toFixed(2)}%</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Upcoming</p>
                                <p className="text-2xl font-bold text-blue-500">{upcomingCount}</p>
                            </div>
                        </div>

                        {/* AI Analysis Panel */}
                        <AIAnalysisPanel
                            title="Dividend Insights"
                            pageType="dividends"
                            pageData={{
                                totalDividends,
                                avgDividend,
                                highestDividend,
                                upcomingCount,
                                dividends: dividends.slice(0, 20)
                            }}
                            autoAnalyze={dividends.length > 0}
                            quickPrompts={[
                                'Best dividend stocks',
                                'High yield picks',
                                'Dividend strategy'
                            ]}
                        />

                        {/* Search and Filters */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <Search size={18} className="text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by symbol or company..."
                                        className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white outline-none"
                                    >
                                        <option value="totalPercent">Sort by Yield</option>
                                        <option value="symbol">Sort by Symbol</option>
                                        <option value="bookClosureDate">Sort by Date</option>
                                    </select>
                                    <button
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
                                    >
                                        {sortOrder === 'desc' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <p className="text-red-600 dark:text-red-400">Failed to load dividend data</p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Dividend Data</h3>
                                    <TableExportButton
                                        data={filteredDividends}
                                        columns={[
                                            { key: 'symbol', label: 'Symbol' },
                                            { key: 'companyName', label: 'Company' },
                                            { key: 'bonusPercent', label: 'Bonus %', format: 'percent' },
                                            { key: 'cashPercent', label: 'Cash %', format: 'percent' },
                                            { key: 'totalPercent', label: 'Total %', format: 'percent' },
                                            { key: 'bookClosureDate', label: 'Book Closure', format: 'date' },
                                            { key: 'fiscalYear', label: 'Fiscal Year' },
                                        ]}
                                        filename="dividends"
                                        title="Proposed Dividends"
                                        variant="compact"
                                    />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Symbol</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Company</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Bonus (%)</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Cash (%)</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Total (%)</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Book Closure</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Fiscal Year</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {filteredDividends.map((div, idx) => (
                                                <tr key={div.id || `${div.symbol}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <td className="px-4 py-4">
                                                        <Link href={`/stocks/${div.symbol}`} className="flex items-center gap-3 hover:underline">
                                                            <span className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                                {div.symbol.slice(0, 2)}
                                                            </span>
                                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{div.symbol}</span>
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                                                        {div.companyName || '-'}
                                                    </td>
                                                    <td className="text-right px-4 py-4 text-slate-700 dark:text-slate-300 font-medium">
                                                        {div.bonusPercent?.toFixed(2) || '0.00'}
                                                    </td>
                                                    <td className="text-right px-4 py-4 text-slate-700 dark:text-slate-300 font-medium">
                                                        {div.cashPercent?.toFixed(2) || '0.00'}
                                                    </td>
                                                    <td className="text-right px-4 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                                            {div.totalPercent?.toFixed(2) || '0.00'}%
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${!div.bookClosureDate
                                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                            : new Date(div.bookClosureDate) > new Date()
                                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                            }`}>
                                                            <Calendar size={12} />
                                                            {formatDate(div.bookClosureDate)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-500">{div.fiscalYear}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {filteredDividends.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">
                                        No dividends found matching your search
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
              <Footer />
      </main>
        </div>
    );
}
