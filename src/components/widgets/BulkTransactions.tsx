'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { get } from '@/services/api';

interface Transaction {
    id: number;
    symbol: string;
    buyerBroker?: number;
    sellerBroker?: number;
    quantity: number;
    price: number;
    changePercent?: number;
}

export default function BulkTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const data = await get<Transaction[]>('/market/bulk-transactions');
                setTransactions(data || []);
                setError(false);
            } catch (err) {
                console.error('Failed to fetch bulk transactions:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">Bulk Transactions</span>
                </div>
                <Link
                    href="/market/transactions"
                    className="text-sm text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                >
                    View More <ArrowUpRight size={14} />
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                </div>
            ) : error || transactions.length === 0 ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
                    <AlertCircle size={18} />
                    <span>No bulk transaction data available</span>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Symbol</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Buyer</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Seller</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Quantity</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                            {transactions.map((tx) => (
                                <tr key={tx.id || tx.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    <td className="px-4 py-3">
                                        <Link href={`/stocks/${tx.symbol}`} className="flex items-center gap-2 hover:underline">
                                            <span className="w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                {tx.symbol.slice(0, 2)}
                                            </span>
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">{tx.symbol}</span>
                                        </Link>
                                    </td>
                                    <td className="text-right px-4 py-3 font-medium text-slate-900 dark:text-white">{tx.buyerBroker || '-'}</td>
                                    <td className="text-right px-4 py-3 font-medium text-slate-900 dark:text-white">{tx.sellerBroker || '-'}</td>
                                    <td className="text-right px-4 py-3 text-slate-700 dark:text-slate-300">{tx.quantity?.toLocaleString() || '-'}</td>
                                    <td className="text-right px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="font-semibold text-slate-900 dark:text-white">${tx.price?.toFixed(2) || '0.00'}</span>
                                            {tx.changePercent != null && (
                                                <span className={`flex items-center text-xs ${tx.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {tx.changePercent >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                    {Math.abs(tx.changePercent).toFixed(2)}%
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
