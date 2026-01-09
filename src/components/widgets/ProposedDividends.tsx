'use client';

import Link from 'next/link';
import { ArrowUpRight, Gift } from 'lucide-react';

interface Dividend {
    symbol: string;
    bonusPercent: number;
    cashPercent: number;
    totalPercent: number;
    bookClosure: string;
    fiscalYear: string;
}

const mockDividends: Dividend[] = [
    { symbol: 'NEI', bonusPercent: 0, cashPercent: 8.00, totalPercent: 8.00, bookClosure: 'Not Announced', fiscalYear: '2081/2082' },
    { symbol: 'NTC', bonusPercent: 0, cashPercent: 30.00, totalPercent: 30.00, bookClosure: 'Jan 4, 2026', fiscalYear: '2081/2082' },
    { symbol: 'CHCL', bonusPercent: 8.00, cashPercent: 4.00, totalPercent: 12.00, bookClosure: 'Jan 1, 2026', fiscalYear: '2081/2082' },
    { symbol: 'NLG', bonusPercent: 4.00, cashPercent: 3.37, totalPercent: 7.37, bookClosure: 'Jan 6, 2026', fiscalYear: '2081/2082' },
    { symbol: 'API', bonusPercent: 5.00, cashPercent: 0.26, totalPercent: 5.26, bookClosure: 'Jan 2, 2026', fiscalYear: '2081/2082' },
];

export default function ProposedDividends() {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Gift size={18} className="text-emerald-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">Proposed Dividends</span>
                </div>
                <Link
                    href="/market/dividends"
                    className="text-sm text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                >
                    View All <ArrowUpRight size={14} />
                </Link>
            </div>

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
                        {mockDividends.map((div) => (
                            <tr key={div.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                            {div.symbol.slice(0, 2)}
                                        </span>
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">{div.symbol}</span>
                                    </div>
                                </td>
                                <td className="text-right px-4 py-3 text-slate-700 dark:text-slate-300">{div.bonusPercent.toFixed(2)}</td>
                                <td className="text-right px-4 py-3 text-slate-700 dark:text-slate-300">{div.cashPercent.toFixed(2)}</td>
                                <td className="text-right px-4 py-3 font-semibold text-emerald-500">{div.totalPercent.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${div.bookClosure === 'Not Announced'
                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                        }`}>
                                        {div.bookClosure}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{div.fiscalYear}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
