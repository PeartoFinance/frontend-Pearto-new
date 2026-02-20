'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { IndianRupee, TrendingUp, Calendar, Landmark, ArrowUpRight, Zap } from 'lucide-react';

interface CompoundResult {
    principal: number;
    totalInterest: number;
    totalValue: number;
    wealthMultiplier: number;
    yearlyBreakdown: { year: number; principal: number; value: number }[];
}

const FREQ_OPTIONS = [
    { value: 1, label: 'Yearly' },
    { value: 2, label: 'Half-Yearly' },
    { value: 4, label: 'Quarterly' },
    { value: 12, label: 'Monthly' },
    { value: 365, label: 'Daily' },
];

export default function CompoundCalculator() {
    const [principal, setPrincipal] = useState(100000);
    const [rate, setRate] = useState(10);
    const [years, setYears] = useState(10);
    const [compoundFreq, setCompoundFreq] = useState(12);
    const { formatPrice } = useCurrency();

    const result = useMemo<CompoundResult>(() => {
        const n = compoundFreq;
        const r = rate / 100;

        const totalValue = principal * Math.pow(1 + r / n, n * years);
        const totalInterest = totalValue - principal;

        const yearlyBreakdown = [];
        for (let y = 1; y <= years; y++) {
            yearlyBreakdown.push({
                year: y,
                principal,
                value: Math.round(principal * Math.pow(1 + r / n, n * y)),
            });
        }

        return {
            principal,
            totalInterest: Math.round(totalInterest),
            totalValue: Math.round(totalValue),
            wealthMultiplier: principal > 0 ? totalValue / principal : 0,
            yearlyBreakdown,
        };
    }, [principal, rate, years, compoundFreq]);

    const principalPct = result.totalValue > 0 ? Math.round((principal / result.totalValue) * 100) : 0;
    const interestPct = 100 - principalPct;

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const principalArc = (principalPct / 100) * circumference;
    const interestArc = (interestPct / 100) * circumference;

    const insights = [
        { label: 'Wealth Multiplier', value: `${result.wealthMultiplier.toFixed(1)}x`, color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Interest Earned', value: formatPrice(result.totalInterest), color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Compounding', value: FREQ_OPTIONS.find(f => f.value === compoundFreq)?.label || '', color: 'text-slate-900 dark:text-white' },
        { label: 'Effective Rate', value: `${((Math.pow(1 + rate / 100 / compoundFreq, compoundFreq) - 1) * 100).toFixed(2)}%`, color: 'text-amber-600 dark:text-amber-400' },
    ];

    return (
        <CalculatorLayout
            title="Compound Interest Calculator"
            description="Visualize how your investments grow with compound interest over time"
            category="Investing"
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
                                <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="14" className="stroke-emerald-500" strokeDasharray={`${interestArc} ${circumference}`} strokeDashoffset={`-${principalArc}`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">Total</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white"><PriceDisplay amount={result.totalValue} /></span>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/40">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0"><Landmark size={16} className="text-blue-500" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Principal</p>
                                    <p className="text-base font-bold text-slate-900 dark:text-white"><PriceDisplay amount={result.principal} /></p>
                                </div>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded-md">{principalPct}%</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/40">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0"><TrendingUp size={16} className="text-emerald-500" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Interest Earned</p>
                                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400"><PriceDisplay amount={result.totalInterest} /></p>
                                </div>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-md">{interestPct}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Growth Chart */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/40 p-4">
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                            <ArrowUpRight size={13} className="text-emerald-500" />
                            Growth Over Time
                        </h4>
                        <div className="flex items-end gap-[3px] h-28">
                            {result.yearlyBreakdown.map((item) => {
                                const maxVal = result.totalValue || 1;
                                const principalH = (item.principal / maxVal) * 100;
                                const interestH = ((item.value - item.principal) / maxVal) * 100;
                                return (
                                    <div key={item.year} className="flex-1 flex flex-col items-stretch justify-end h-full group relative cursor-default">
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                                            Y{item.year}: {formatPrice(item.value)}
                                        </div>
                                        <div className="bg-emerald-500/80 rounded-t-sm transition-all" style={{ height: `${interestH}%` }} />
                                        <div className="bg-blue-500/80 rounded-b-sm transition-all" style={{ height: `${principalH}%` }} />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-1.5 text-[9px] text-slate-400">
                            <span>Yr 1</span>
                            <span>Yr {years}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/80" />Principal</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/80" />Interest</span>
                        </div>
                    </div>

                    {/* Power of compounding banner */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 dark:border-emerald-500/15">
                        <Zap size={16} className="text-emerald-500 flex-shrink-0" />
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{result.wealthMultiplier.toFixed(1)}x growth</span>
                            {' '}— your {formatPrice(principal)} becomes {formatPrice(result.totalValue)} in {years} years at {rate}% compounded {FREQ_OPTIONS.find(f => f.value === compoundFreq)?.label?.toLowerCase()}.
                        </p>
                    </div>
                </div>
            }
        >
            {/* Principal Amount */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <IndianRupee size={13} className="text-emerald-500" /> Principal Amount
                    </label>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {formatPrice(principal)}
                    </span>
                </div>
                <input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    min={1000} max={10000000} step={1000}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                <input
                    type="range"
                    min={1000} max={1000000} step={1000}
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="w-full mt-1.5 accent-emerald-500 h-1.5"
                />
            </div>

            {/* Interest Rate */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <TrendingUp size={13} className="text-blue-500" /> Interest Rate
                    </label>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                        {rate}% p.a.
                    </span>
                </div>
                <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    min={1} max={30} step={0.5}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                <input
                    type="range"
                    min={1} max={30} step={0.5}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
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
                        {years} yrs
                    </span>
                </div>
                <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    min={1} max={50} step={1}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                <input
                    type="range"
                    min={1} max={50} step={1}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full mt-1.5 accent-amber-500 h-1.5"
                />
            </div>

            {/* Compounding Frequency — Segmented Pills */}
            <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Compounding Frequency
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {FREQ_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setCompoundFreq(opt.value)}
                            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                                compoundFreq === opt.value
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
