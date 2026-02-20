'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { IndianRupee, TrendingUp, Calendar, PiggyBank, Zap, Target, ArrowUpRight } from 'lucide-react';

interface SIPResult {
    investedAmount: number;
    estimatedReturns: number;
    totalValue: number;
    wealthMultiplier: number;
    yearlyBreakdown: { year: number; invested: number; value: number }[];
}

export default function SIPCalculator() {
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);
    const { formatPrice } = useCurrency();

    const result = useMemo<SIPResult>(() => {
        const P = monthlyInvestment;
        const r = expectedReturn / 100 / 12;
        const n = timePeriod * 12;

        const totalValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const investedAmount = P * n;
        const estimatedReturns = totalValue - investedAmount;

        const yearlyBreakdown = [];
        for (let y = 1; y <= timePeriod; y++) {
            const months = y * 12;
            const val = P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
            yearlyBreakdown.push({ year: y, invested: P * months, value: Math.round(val) });
        }

        return {
            investedAmount: Math.round(investedAmount),
            estimatedReturns: Math.round(estimatedReturns),
            totalValue: Math.round(totalValue),
            wealthMultiplier: investedAmount > 0 ? totalValue / investedAmount : 0,
            yearlyBreakdown,
        };
    }, [monthlyInvestment, expectedReturn, timePeriod]);

    const principalPct = result.totalValue > 0 ? Math.round((result.investedAmount / result.totalValue) * 100) : 0;
    const returnsPct = 100 - principalPct;

    // SVG donut values
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const principalArc = (principalPct / 100) * circumference;
    const returnsArc = (returnsPct / 100) * circumference;

    const insights = [
        { label: 'Wealth Multiplier', value: `${result.wealthMultiplier.toFixed(1)}x`, color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Monthly Returns (Avg)', value: formatPrice(Math.round(result.estimatedReturns / (timePeriod * 12))), color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Total Months', value: `${timePeriod * 12}`, color: 'text-slate-900 dark:text-white' },
        { label: 'Effective Yearly Return', value: `${expectedReturn}%`, color: 'text-amber-600 dark:text-amber-400' },
    ];

    return (
        <CalculatorLayout
            title="SIP Calculator"
            description="Calculate the future value of your Systematic Investment Plan"
            category="Investing"
            insights={insights}
            results={
                <div className="space-y-5">
                    {/* Hero Result + Donut */}
                    <div className="flex flex-col md:flex-row items-center gap-5">
                        {/* Donut Chart */}
                        <div className="relative flex-shrink-0">
                            <svg width="140" height="140" viewBox="0 0 128 128" className="-rotate-90">
                                <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="14" className="stroke-slate-100 dark:stroke-slate-700/50" />
                                <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="14" className="stroke-blue-500" strokeDasharray={`${principalArc} ${circumference}`} strokeLinecap="round" />
                                <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="14" className="stroke-emerald-500" strokeDasharray={`${returnsArc} ${circumference}`} strokeDashoffset={`-${principalArc}`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">Total</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white"><PriceDisplay amount={result.totalValue} /></span>
                            </div>
                        </div>

                        {/* Breakdown cards */}
                        <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/40">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0"><PiggyBank size={16} className="text-blue-500" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Amount Invested</p>
                                    <p className="text-base font-bold text-slate-900 dark:text-white"><PriceDisplay amount={result.investedAmount} /></p>
                                </div>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded-md">{principalPct}%</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/40">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0"><TrendingUp size={16} className="text-emerald-500" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Estimated Returns</p>
                                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400"><PriceDisplay amount={result.estimatedReturns} /></p>
                                </div>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-md">{returnsPct}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Growth Chart */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/40 p-4">
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                            <ArrowUpRight size={13} className="text-emerald-500" />
                            Year-by-Year Growth
                        </h4>
                        <div className="flex items-end gap-[3px] h-28">
                            {result.yearlyBreakdown.map((item) => {
                                const maxVal = result.totalValue || 1;
                                const investedH = (item.invested / maxVal) * 100;
                                const returnsH = ((item.value - item.invested) / maxVal) * 100;
                                return (
                                    <div key={item.year} className="flex-1 flex flex-col items-stretch justify-end h-full group relative cursor-default">
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                                            Y{item.year}: {formatPrice(item.value)}
                                        </div>
                                        <div className="bg-emerald-500/80 rounded-t-sm transition-all" style={{ height: `${returnsH}%` }} />
                                        <div className="bg-blue-500/80 rounded-b-sm transition-all" style={{ height: `${investedH}%` }} />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-1.5 text-[9px] text-slate-400">
                            <span>Yr 1</span>
                            <span>Yr {timePeriod}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/80" />Invested</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/80" />Returns</span>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Monthly Investment */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <IndianRupee size={13} className="text-emerald-500" /> Monthly Investment
                    </label>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {formatPrice(monthlyInvestment)}
                    </span>
                </div>
                <input
                    type="number"
                    value={monthlyInvestment}
                    onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                    min={500}
                    max={1000000}
                    step={500}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white"
                />
                <input
                    type="range"
                    min={500} max={100000} step={500}
                    value={monthlyInvestment}
                    onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                    className="w-full mt-1.5 accent-emerald-500 h-1.5"
                />
            </div>

            {/* Expected Return */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <TrendingUp size={13} className="text-blue-500" /> Expected Return
                    </label>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                        {expectedReturn}% p.a.
                    </span>
                </div>
                <input
                    type="number"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    min={1} max={30} step={0.5}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white"
                />
                <input
                    type="range"
                    min={1} max={30} step={0.5}
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full mt-1.5 accent-blue-500 h-1.5"
                />
            </div>

            {/* Time Period */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar size={13} className="text-amber-500" /> Time Period
                    </label>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
                        {timePeriod} yrs
                    </span>
                </div>
                <input
                    type="number"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(Number(e.target.value))}
                    min={1} max={40} step={1}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white"
                />
                <input
                    type="range"
                    min={1} max={40} step={1}
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(Number(e.target.value))}
                    className="w-full mt-1.5 accent-amber-500 h-1.5"
                />
            </div>
        </CalculatorLayout>
    );
}
