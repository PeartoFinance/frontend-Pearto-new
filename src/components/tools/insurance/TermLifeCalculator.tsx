'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Shield, Banknote, Home, GraduationCap, Users } from 'lucide-react';

export default function TermLifeCalculator() {
    const { formatPrice } = useCurrency();
    const [annualIncome, setAnnualIncome] = useState(1200000);
    const [yearsToRetirement, setYearsToRetirement] = useState(25);
    const [outstandingDebts, setOutstandingDebts] = useState(2000000);
    const [dependentsCount, setDependentsCount] = useState(2);
    const [existingCover, setExistingCover] = useState(0);

    const result = useMemo(() => {
        // DIME Method
        const debt = outstandingDebts;
        const incomeReplacement = annualIncome * yearsToRetirement;
        const mortgage = outstandingDebts * 0.5; // Assume mortgage is roughly half of total debt
        const education = dependentsCount * 2500000; // ~25L per child for education

        const totalDIME = debt + incomeReplacement + mortgage + education;
        const recommendedCover = Math.max(0, totalDIME - existingCover);

        const breakdown = [
            { label: 'Debt Repayment', value: debt, color: '#ef4444' },
            { label: 'Income Replacement', value: incomeReplacement, color: '#3b82f6' },
            { label: 'Mortgage / Housing', value: mortgage, color: '#f59e0b' },
            { label: 'Education Fund', value: education, color: '#10b981' },
        ];

        const gapVsExisting = existingCover > 0
            ? Math.round(((totalDIME - existingCover) / totalDIME) * 100)
            : 100;

        return { totalDIME, recommendedCover, breakdown, gapVsExisting };
    }, [annualIncome, yearsToRetirement, outstandingDebts, dependentsCount, existingCover]);

    // Donut chart
    const segments = result.breakdown;
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const r = 42, circ = 2 * Math.PI * r;
    let cumulativeOffset = 0;

    return (
        <CalculatorLayout
            title="Term Life Coverage Calculator"
            description="Calculate your ideal life cover using the DIME method — Debt, Income, Mortgage, Education"
            category="Insurance"
            insights={[
                { label: 'Recommended Cover', value: formatPrice(result.recommendedCover), color: 'text-emerald-600' },
                { label: 'Total DIME Need', value: formatPrice(result.totalDIME) },
                { label: 'Existing Cover', value: formatPrice(existingCover), color: 'text-blue-600' },
                { label: 'Coverage Gap', value: `${result.gapVsExisting}%`, color: 'text-rose-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Main display */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/60 dark:border-emerald-800/40">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Recommended Life Cover</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatPrice(result.recommendedCover)}</p>
                        <p className="text-xs text-slate-500 mt-2">After accounting for existing coverage</p>
                    </div>

                    {/* Donut chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="110" height="110" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            {segments.map((seg, i) => {
                                const pct = total > 0 ? seg.value / total : 0;
                                const segLen = pct * circ;
                                const rotation = -90 + (cumulativeOffset / total) * 360;
                                cumulativeOffset += seg.value;
                                return (
                                    <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="8" strokeDasharray={`${segLen} ${circ - segLen}`} strokeLinecap="butt" transform={`rotate(${rotation} 50 50)`} />
                                );
                            })}
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[9px] font-bold">DIME</text>
                            <text x="50" y="58" textAnchor="middle" className="fill-slate-500 text-[7px]">Breakdown</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">DIME Breakdown</p>
                            {segments.map((seg, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">{seg.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(seg.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Total DIME Need</span>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatPrice(result.totalDIME)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Existing Cover</span>
                            <p className="text-lg font-semibold text-blue-600">{formatPrice(existingCover)}</p>
                        </div>
                    </div>

                    {/* Gap bar */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Coverage Gap</p>
                        <div className="flex h-4 rounded-full overflow-hidden">
                            <div className="bg-blue-500 transition-all" style={{ width: `${100 - result.gapVsExisting}%` }} />
                            <div className="bg-rose-400 transition-all" style={{ width: `${result.gapVsExisting}%` }} />
                        </div>
                        <div className="flex justify-between mt-2 text-[11px] text-slate-500">
                            <span>Covered ({100 - result.gapVsExisting}%)</span>
                            <span>Gap ({result.gapVsExisting}%)</span>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Annual Income */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Annual Income</label>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(annualIncome)}</span>
                </div>
                <input type="number" value={annualIncome} onChange={e => setAnnualIncome(Number(e.target.value))} min={0} step={100000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={10000000} step={100000} value={annualIncome} onChange={e => setAnnualIncome(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Years Until Retirement */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Years Until Retirement</label>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{yearsToRetirement} yrs</span>
                </div>
                <input type="number" value={yearsToRetirement} onChange={e => setYearsToRetirement(Number(e.target.value))} min={1} max={45}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1} max={45} value={yearsToRetirement} onChange={e => setYearsToRetirement(Number(e.target.value))} className="w-full mt-2 accent-blue-500" />
            </div>

            {/* Outstanding Debts */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Outstanding Debts</label>
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md">{formatPrice(outstandingDebts)}</span>
                </div>
                <input type="number" value={outstandingDebts} onChange={e => setOutstandingDebts(Number(e.target.value))} min={0} step={100000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={20000000} step={100000} value={outstandingDebts} onChange={e => setOutstandingDebts(Number(e.target.value))} className="w-full mt-2 accent-rose-500" />
            </div>

            {/* Dependents Count */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Number of Dependents</label>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{dependentsCount}</span>
                </div>
                <input type="number" value={dependentsCount} onChange={e => setDependentsCount(Number(e.target.value))} min={0} max={10}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={10} value={dependentsCount} onChange={e => setDependentsCount(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
            </div>

            {/* Existing Cover */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Existing Cover</label>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{formatPrice(existingCover)}</span>
                </div>
                <input type="number" value={existingCover} onChange={e => setExistingCover(Number(e.target.value))} min={0} step={500000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={50000000} step={500000} value={existingCover} onChange={e => setExistingCover(Number(e.target.value))} className="w-full mt-2 accent-blue-500" />
            </div>
        </CalculatorLayout>
    );
}
