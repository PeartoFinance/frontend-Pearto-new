'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface Transaction {
    symbol: string;
    buyer: number;
    seller: number;
    quantity: number;
    price: number;
    change?: number;
}

const mockTransactions: Transaction[] = [
    { symbol: 'AAPL', buyer: 77, seller: 35, quantity: 89880, price: 393.5, change: 2.3 },
    { symbol: 'GOOGL', buyer: 33, seller: 44, quantity: 83384, price: 326.5, change: -1.2 },
    { symbol: 'MSFT', buyer: 56, seller: 28, quantity: 46300, price: 388.6, change: 1.5 },
    { symbol: 'AMZN', buyer: 14, seller: 14, quantity: 40000, price: 546.1, change: 0.8 },
    { symbol: 'TSLA', buyer: 81, seller: 81, quantity: 36075, price: 623.6, change: -2.1 },
];

export default function BulkTransactions() {
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
                        {mockTransactions.map((tx) => (
                            <tr key={tx.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                            {tx.symbol.slice(0, 2)}
                                        </span>
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">{tx.symbol}</span>
                                    </div>
                                </td>
                                <td className="text-right px-4 py-3 font-medium text-slate-900 dark:text-white">{tx.buyer}</td>
                                <td className="text-right px-4 py-3 font-medium text-slate-900 dark:text-white">{tx.seller}</td>
                                <td className="text-right px-4 py-3 text-slate-700 dark:text-slate-300">{tx.quantity.toLocaleString()}</td>
                                <td className="text-right px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <span className="font-semibold text-slate-900 dark:text-white">${tx.price.toFixed(2)}</span>
                                        {tx.change && (
                                            <span className={`flex items-center text-xs ${tx.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {tx.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                {Math.abs(tx.change)}%
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
