'use client';

import Link from 'next/link';
import { ArrowUpRight, Calendar, Gift } from 'lucide-react';

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
        <div className="card">
            <div className="card-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Gift size={18} className="text-emerald-500" />
                    <span>Proposed Dividends</span>
                </div>
                <Link
                    href="/market/dividends"
                    className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                >
                    View All <ArrowUpRight size={14} />
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th className="text-right">Bonus (%)</th>
                            <th className="text-right">Cash (%)</th>
                            <th className="text-right">Total (%)</th>
                            <th>Book Closure</th>
                            <th>Fiscal Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockDividends.map((div) => (
                            <tr key={div.symbol}>
                                <td>
                                    <div className="symbol-badge">
                                        <span className="symbol-icon">{div.symbol.slice(0, 2)}</span>
                                        {div.symbol}
                                    </div>
                                </td>
                                <td className="text-right">{div.bonusPercent.toFixed(2)}</td>
                                <td className="text-right">{div.cashPercent.toFixed(2)}</td>
                                <td className="text-right font-semibold price-positive">{div.totalPercent.toFixed(2)}</td>
                                <td>
                                    <span className={`badge ${div.bookClosure === 'Not Announced' ? 'badge-warning' : 'badge-success'}`}>
                                        {div.bookClosure}
                                    </span>
                                </td>
                                <td className="text-gray-500 dark:text-gray-400">{div.fiscalYear}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
