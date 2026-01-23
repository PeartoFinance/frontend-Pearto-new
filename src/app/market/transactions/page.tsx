'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import { get } from '@/services/api';
import {
    ArrowLeft, TrendingUp, Loader2, AlertCircle,
    RefreshCw, Search, ArrowUpRight, ArrowDownRight, DollarSign
} from 'lucide-react';
import { TableExportButton } from '@/components/common/TableExportButton';

interface Transaction {
    id: number;
    symbol: string;
    companyName?: string;
    buyerBroker?: number;
    sellerBroker?: number;
    quantity: number;
    price: number;
    amount?: number;
    changePercent?: number;
    timestamp?: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await get<Transaction[]>('/market/bulk-transactions');
            setTransactions(data || []);
            setError(false);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = transactions.filter(tx =>
        tx.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const totalTransactions = transactions.length;
    const totalVolume = transactions.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
    const totalValue = transactions.reduce((sum, tx) => sum + ((tx.quantity || 0) * (tx.price || 0)), 0);
    const avgPrice = transactions.length > 0
        ? transactions.reduce((sum, tx) => sum + (tx.price || 0), 0) / transactions.length
        : 0;

    const formatNumber = (num: number | null | undefined, decimals = 2) => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toLocaleString();
    };

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
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                    <TrendingUp className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        Bulk Transactions
                                    </h1>
                                    <p className="text-slate-500">Large volume trades and block deals</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchTransactions}
                                disabled={loading}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            >
                                <RefreshCw size={18} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Total Transactions</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalTransactions}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Total Volume</p>
                                <p className="text-2xl font-bold text-purple-500">{formatLargeNumber(totalVolume)}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Total Value</p>
                                <p className="text-2xl font-bold text-emerald-500">${formatLargeNumber(totalValue)}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Avg Price</p>
                                <p className="text-2xl font-bold text-blue-500">${formatNumber(avgPrice)}</p>
                            </div>
                        </div>

                        {/* AI Analysis */}
                        <AIAnalysisPanel
                            title="Transaction Insights"
                            pageType="bulk-transactions"
                            pageData={{
                                totalTransactions,
                                totalVolume,
                                totalValue,
                                avgPrice,
                                transactions: transactions.slice(0, 20).map(tx => ({
                                    symbol: tx.symbol,
                                    quantity: tx.quantity,
                                    price: tx.price,
                                    value: tx.quantity * tx.price,
                                    buyerBroker: tx.buyerBroker,
                                    sellerBroker: tx.sellerBroker
                                }))
                            }}
                            autoAnalyze={transactions.length > 0}
                            quickPrompts={[
                                'Institutional activity',
                                'Large block deals',
                                'Smart money moves'
                            ]}
                        />

                        {/* Search */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                <Search size={18} className="text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by symbol..."
                                    className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Data Table */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <p className="text-red-600 dark:text-red-400">Failed to load transaction data</p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Transaction Records</h3>
                                    <TableExportButton
                                        data={filteredTransactions}
                                        columns={[
                                            { key: 'symbol', label: 'Symbol' },
                                            { key: 'companyName', label: 'Company' },
                                            { key: 'buyerBroker', label: 'Buyer Broker', format: 'number' },
                                            { key: 'sellerBroker', label: 'Seller Broker', format: 'number' },
                                            { key: 'quantity', label: 'Quantity', format: 'largeNumber' },
                                            { key: 'price', label: 'Price', format: 'currency' },
                                        ]}
                                        filename="bulk-transactions"
                                        title="Bulk Transactions"
                                        variant="compact"
                                    />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">#</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Symbol</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Buyer Broker</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Seller Broker</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {filteredTransactions.map((tx, index) => (
                                                <tr key={tx.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <td className="px-4 py-4 text-slate-500 font-medium">{index + 1}</td>
                                                    <td className="px-4 py-4">
                                                        <Link href={`/stocks/${tx.symbol}`} className="flex items-center gap-3 hover:underline">
                                                            <span className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400">
                                                                {tx.symbol.slice(0, 2)}
                                                            </span>
                                                            <div>
                                                                <span className="font-semibold text-purple-600 dark:text-purple-400">{tx.symbol}</span>
                                                                {tx.companyName && (
                                                                    <p className="text-xs text-slate-500 truncate max-w-[150px]">{tx.companyName}</p>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    </td>
                                                    <td className="text-right px-4 py-4">
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-sm font-medium">
                                                            <ArrowUpRight size={12} />
                                                            {tx.buyerBroker || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="text-right px-4 py-4">
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-sm font-medium">
                                                            <ArrowDownRight size={12} />
                                                            {tx.sellerBroker || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="text-right px-4 py-4 font-semibold text-slate-900 dark:text-white">
                                                        {formatLargeNumber(tx.quantity)}
                                                    </td>
                                                    <td className="text-right px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                                                        ${formatNumber(tx.price)}
                                                    </td>
                                                    <td className="text-right px-4 py-4">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-bold text-slate-900 dark:text-white">
                                                            <DollarSign size={12} />
                                                            {formatLargeNumber((tx.quantity || 0) * (tx.price || 0))}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {filteredTransactions.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">
                                        {searchQuery ? 'No transactions found matching your search' : 'No transaction data available'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
