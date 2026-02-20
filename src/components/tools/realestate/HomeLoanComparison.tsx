'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Home, ArrowLeftRight, TrendingDown, BarChart3 } from 'lucide-react';

export default function HomeLoanComparison() {
    const { formatPrice } = useCurrency();

    const [loan1Amount, setLoan1Amount] = useState(300000);
    const [loan1Rate, setLoan1Rate] = useState(6.5);
    const [loan1Term, setLoan1Term] = useState(30);

    const [loan2Amount, setLoan2Amount] = useState(300000);
    const [loan2Rate, setLoan2Rate] = useState(5.75);
    const [loan2Term, setLoan2Term] = useState(15);

    const calcLoan = (amount: number, rate: number, termYears: number) => {
        const r = rate / 100 / 12;
        const n = termYears * 12;
        const emi = r > 0
            ? amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
            : amount / n;
        const totalPayment = emi * n;
        const totalInterest = totalPayment - amount;
        return { emi, totalPayment, totalInterest };
    };

    const result = useMemo(() => {
        const l1 = calcLoan(loan1Amount, loan1Rate, loan1Term);
        const l2 = calcLoan(loan2Amount, loan2Rate, loan2Term);
        const emiDiff = l1.emi - l2.emi;
        const interestDiff = l1.totalInterest - l2.totalInterest;
        const totalDiff = l1.totalPayment - l2.totalPayment;
        return { l1, l2, emiDiff, interestDiff, totalDiff };
    }, [loan1Amount, loan1Rate, loan1Term, loan2Amount, loan2Rate, loan2Term]);

    // Bar chart helpers
    const maxEmi = Math.max(result.l1.emi, result.l2.emi);
    const maxTotal = Math.max(result.l1.totalPayment, result.l2.totalPayment);
    const maxInterest = Math.max(result.l1.totalInterest, result.l2.totalInterest);

    const barPct = (val: number, max: number) => max > 0 ? (val / max) * 100 : 0;

    return (
        <CalculatorLayout
            title="Home Loan Comparison"
            description="Compare two mortgage options side by side to find the better deal"
            category="Real Estate"
            insights={[
                { label: 'Loan 1 EMI', value: formatPrice(result.l1.emi), color: 'text-blue-600' },
                { label: 'Loan 2 EMI', value: formatPrice(result.l2.emi), color: 'text-emerald-600' },
                { label: 'EMI Difference', value: formatPrice(Math.abs(result.emiDiff)), color: result.emiDiff > 0 ? 'text-red-500' : 'text-emerald-600' },
                { label: 'Interest Saved', value: formatPrice(Math.abs(result.interestDiff)), color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Side by side EMI */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center border-2 border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-slate-500 mb-1">Loan 1 — Monthly EMI</p>
                            <p className="text-2xl font-bold text-blue-600">
                                <PriceDisplay amount={result.l1.emi} maximumFractionDigits={0} />
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">{loan1Rate}% · {loan1Term} yrs</p>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center border-2 border-emerald-200 dark:border-emerald-800">
                            <p className="text-xs text-slate-500 mb-1">Loan 2 — Monthly EMI</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                <PriceDisplay amount={result.l2.emi} maximumFractionDigits={0} />
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">{loan2Rate}% · {loan2Term} yrs</p>
                        </div>
                    </div>

                    {/* Bar charts */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl space-y-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly EMI</p>
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-blue-600 font-medium">Loan 1</span>
                                    <span className="font-semibold">{formatPrice(result.l1.emi)}</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${barPct(result.l1.emi, maxEmi)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-emerald-600 font-medium">Loan 2</span>
                                    <span className="font-semibold">{formatPrice(result.l2.emi)}</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${barPct(result.l2.emi, maxEmi)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl space-y-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Interest Paid</p>
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-blue-600 font-medium">Loan 1</span>
                                    <span className="font-semibold">{formatPrice(result.l1.totalInterest)}</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${barPct(result.l1.totalInterest, maxInterest)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-emerald-600 font-medium">Loan 2</span>
                                    <span className="font-semibold">{formatPrice(result.l2.totalInterest)}</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${barPct(result.l2.totalInterest, maxInterest)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl space-y-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Payment</p>
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-blue-600 font-medium">Loan 1</span>
                                    <span className="font-semibold">{formatPrice(result.l1.totalPayment)}</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${barPct(result.l1.totalPayment, maxTotal)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-emerald-600 font-medium">Loan 2</span>
                                    <span className="font-semibold">{formatPrice(result.l2.totalPayment)}</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${barPct(result.l2.totalPayment, maxTotal)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verdict */}
                    <div className={`p-4 rounded-xl ${result.totalDiff > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'}`}>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {result.totalDiff > 0 ? '✓ Loan 2 saves you more' : result.totalDiff < 0 ? '✓ Loan 1 saves you more' : 'Both loans are equal'}
                        </p>
                        <p className="text-xs text-slate-500">
                            Total savings: <PriceDisplay amount={Math.abs(result.totalDiff)} maximumFractionDigits={0} /> over the loan life
                        </p>
                    </div>
                </div>
            }
        >
            {/* Loan 1 */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">Loan 1</p>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{formatPrice(loan1Amount)}</span>
                    </div>
                    <input type="number" value={loan1Amount} onChange={(e) => setLoan1Amount(Number(e.target.value))} step={10000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={50000} max={1000000} step={10000} value={loan1Amount}
                        onChange={(e) => setLoan1Amount(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate (%)</label>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{loan1Rate}%</span>
                        </div>
                        <input type="number" value={loan1Rate} onChange={(e) => setLoan1Rate(Number(e.target.value))} step={0.125}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Term</label>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{loan1Term}yr</span>
                        </div>
                        <select value={loan1Term} onChange={(e) => setLoan1Term(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                            <option value={10}>10 years</option>
                            <option value={15}>15 years</option>
                            <option value={20}>20 years</option>
                            <option value={30}>30 years</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <ArrowLeftRight size={14} className="text-slate-400" />
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Loan 2 */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg">Loan 2</p>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(loan2Amount)}</span>
                    </div>
                    <input type="number" value={loan2Amount} onChange={(e) => setLoan2Amount(Number(e.target.value))} step={10000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={50000} max={1000000} step={10000} value={loan2Amount}
                        onChange={(e) => setLoan2Amount(Number(e.target.value))} className="w-full accent-emerald-500 mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate (%)</label>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{loan2Rate}%</span>
                        </div>
                        <input type="number" value={loan2Rate} onChange={(e) => setLoan2Rate(Number(e.target.value))} step={0.125}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Term</label>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{loan2Term}yr</span>
                        </div>
                        <select value={loan2Term} onChange={(e) => setLoan2Term(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                            <option value={10}>10 years</option>
                            <option value={15}>15 years</option>
                            <option value={20}>20 years</option>
                            <option value={30}>30 years</option>
                        </select>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
