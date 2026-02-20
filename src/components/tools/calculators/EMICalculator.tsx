'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { IndianRupee, Percent, Calendar, Landmark, TrendingDown, ArrowUpRight } from 'lucide-react';

interface EMIResult {
    emi: number;
    totalInterest: number;
    totalPayment: number;
    schedule: { month: number; principal: number; interest: number; balance: number }[];
}

export default function EMICalculator() {
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(10);
    const [tenure, setTenure] = useState(20);
    const { formatPrice } = useCurrency();

    const result = useMemo<EMIResult>(() => {
        const P = loanAmount;
        const r = interestRate / 100 / 12;
        const n = tenure * 12;

        const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - P;

        const schedule = [];
        let balance = P;
        for (let month = 1; month <= Math.min(n, 12); month++) {
            const interestPayment = balance * r;
            const principalPayment = emi - interestPayment;
            balance -= principalPayment;
            schedule.push({
                month,
                principal: Math.round(principalPayment),
                interest: Math.round(interestPayment),
                balance: Math.max(0, Math.round(balance)),
            });
        }

        return { emi: Math.round(emi), totalInterest: Math.round(totalInterest), totalPayment: Math.round(totalPayment), schedule };
    }, [loanAmount, interestRate, tenure]);

    const principalPct = result.totalPayment > 0 ? Math.round((loanAmount / result.totalPayment) * 100) : 0;
    const interestPct = 100 - principalPct;

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const principalArc = (principalPct / 100) * circumference;
    const interestArc = (interestPct / 100) * circumference;

    const insights = [
        { label: 'Interest-to-Principal', value: `${(result.totalInterest / loanAmount).toFixed(1)}x`, color: 'text-rose-600 dark:text-rose-400' },
        { label: 'Total Interest', value: formatPrice(result.totalInterest), color: 'text-rose-600 dark:text-rose-400' },
        { label: 'Total Payments', value: `${tenure * 12}`, color: 'text-slate-900 dark:text-white' },
        { label: 'Cost Per Lakh', value: formatPrice(Math.round((result.emi / loanAmount) * 100000)), color: 'text-amber-600 dark:text-amber-400' },
    ];

    return (
        <CalculatorLayout
            title="Loan EMI Calculator"
            description="Calculate monthly loan payments and view amortization schedule"
            category="Finance & Loans"
            insights={insights}
            results={
                <div className="space-y-5">
                    {/* Hero Result + Donut */}
                    <div className="flex flex-col md:flex-row items-center gap-5">
                        {/* Donut */}
                        <div className="relative flex-shrink-0">
                            <svg width="140" height="140" viewBox="0 0 128 128" className="-rotate-90">
                                <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="14" className="stroke-slate-100 dark:stroke-slate-700/50" />
                                <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="14" className="stroke-blue-500" strokeDasharray={`${principalArc} ${circumference}`} strokeLinecap="round" />
                                <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="14" className="stroke-rose-500" strokeDasharray={`${interestArc} ${circumference}`} strokeDashoffset={`-${principalArc}`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">Monthly EMI</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white"><PriceDisplay amount={result.emi} /></span>
                            </div>
                        </div>

                        {/* Breakdown cards */}
                        <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/40">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0"><Landmark size={16} className="text-blue-500" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Principal Amount</p>
                                    <p className="text-base font-bold text-slate-900 dark:text-white"><PriceDisplay amount={loanAmount} /></p>
                                </div>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded-md">{principalPct}%</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/40">
                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0"><TrendingDown size={16} className="text-rose-500" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Interest</p>
                                    <p className="text-base font-bold text-rose-600 dark:text-rose-400"><PriceDisplay amount={result.totalInterest} /></p>
                                </div>
                                <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 px-2 py-0.5 rounded-md">{interestPct}%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800">
                                <span className="text-xs text-slate-400">Total Payment</span>
                                <span className="text-base font-bold text-white"><PriceDisplay amount={result.totalPayment} /></span>
                            </div>
                        </div>
                    </div>

                    {/* Amortization Schedule */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/40 overflow-hidden">
                        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-200/70 dark:border-slate-700/40">
                            <ArrowUpRight size={13} className="text-emerald-500" />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">First Year Amortization</span>
                        </div>
                        <div className="overflow-x-auto max-h-48">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                                    <tr className="text-slate-500 dark:text-slate-400">
                                        <th className="text-left px-3 py-2 font-medium">Month</th>
                                        <th className="text-right px-3 py-2 font-medium">Principal</th>
                                        <th className="text-right px-3 py-2 font-medium">Interest</th>
                                        <th className="text-right px-3 py-2 font-medium">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.schedule.map((row) => (
                                        <tr key={row.month} className="border-t border-slate-100 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-3 py-1.5 text-slate-600 dark:text-slate-300 font-medium">{row.month}</td>
                                            <td className="px-3 py-1.5 text-right text-blue-600 dark:text-blue-400 font-medium"><PriceDisplay amount={row.principal} /></td>
                                            <td className="px-3 py-1.5 text-right text-rose-600 dark:text-rose-400"><PriceDisplay amount={row.interest} /></td>
                                            <td className="px-3 py-1.5 text-right text-slate-700 dark:text-slate-200"><PriceDisplay amount={row.balance} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Loan Amount */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <IndianRupee size={13} className="text-emerald-500" /> Loan Amount
                    </label>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {formatPrice(loanAmount)}
                    </span>
                </div>
                <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    min={10000} max={100000000} step={10000}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                <input
                    type="range"
                    min={100000} max={10000000} step={100000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full mt-1.5 accent-emerald-500 h-1.5"
                />
            </div>

            {/* Interest Rate */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Percent size={13} className="text-rose-500" /> Interest Rate
                    </label>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md">
                        {interestRate}% p.a.
                    </span>
                </div>
                <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    min={1} max={30} step={0.25}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                <input
                    type="range"
                    min={5} max={20} step={0.25}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full mt-1.5 accent-rose-500 h-1.5"
                />
            </div>

            {/* Loan Tenure */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar size={13} className="text-amber-500" /> Loan Tenure
                    </label>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
                        {tenure} yrs
                    </span>
                </div>
                <input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    min={1} max={30} step={1}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                <input
                    type="range"
                    min={1} max={30} step={1}
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full mt-1.5 accent-amber-500 h-1.5"
                />
            </div>
        </CalculatorLayout>
    );
}
