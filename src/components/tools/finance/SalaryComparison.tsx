'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { useCurrency } from '@/contexts/CurrencyContext';
import { DollarSign, Briefcase, TrendingUp, MapPin } from 'lucide-react';

export default function SalaryComparison() {
    const { formatPrice } = useCurrency();
    const [currentSalary, setCurrentSalary] = useState(75000);
    const [offeredSalary, setOfferedSalary] = useState(90000);
    const [currentBenefits, setCurrentBenefits] = useState(8000);
    const [offeredBenefits, setOfferedBenefits] = useState(12000);
    const [costAdjustment, setCostAdjustment] = useState(100); // 100 = same cost, 120 = 20% more expensive

    const result = useMemo(() => {
        const currentTotal = currentSalary + currentBenefits;
        const offeredTotal = offeredSalary + offeredBenefits;
        const adjustedOffered = costAdjustment > 0 ? offeredTotal * (100 / costAdjustment) : offeredTotal;
        const difference = offeredTotal - currentTotal;
        const adjustedDifference = adjustedOffered - currentTotal;
        const pctDifference = currentTotal > 0 ? Math.round((difference / currentTotal) * 10000) / 100 : 0;
        const adjustedPctDifference = currentTotal > 0 ? Math.round((adjustedDifference / currentTotal) * 10000) / 100 : 0;

        return {
            currentTotal, offeredTotal, adjustedOffered,
            difference, adjustedDifference,
            pctDifference, adjustedPctDifference,
        };
    }, [currentSalary, offeredSalary, currentBenefits, offeredBenefits, costAdjustment]);

    const isBetter = result.adjustedDifference > 0;

    // Donut: salary vs benefits for offered
    const salaryPct = result.offeredTotal > 0 ? Math.round((offeredSalary / result.offeredTotal) * 100) : 100;
    const benefitsPct = 100 - salaryPct;
    const r = 42, circ = 2 * Math.PI * r;
    const benefitsOffset = circ - (benefitsPct / 100) * circ;

    // Bar comparison
    const maxTotal = Math.max(result.currentTotal, result.offeredTotal, 1);

    return (
        <CalculatorLayout
            title="Salary Comparison"
            description="Compare total compensation packages including salary, benefits, and cost-of-living adjustments"
            category="Income & Employment"
            insights={[
                { label: 'Current Total', value: formatPrice(result.currentTotal) },
                { label: 'Offered Total', value: formatPrice(result.offeredTotal), color: 'text-blue-600' },
                { label: 'Difference', value: `${result.pctDifference > 0 ? '+' : ''}${result.pctDifference}%`, color: result.pctDifference >= 0 ? 'text-emerald-600' : 'text-rose-600' },
                { label: 'Cost-Adjusted', value: formatPrice(result.adjustedOffered), color: isBetter ? 'text-emerald-600' : 'text-rose-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Main verdict */}
                    <div className={`text-center p-6 rounded-xl ${isBetter ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/60 dark:border-emerald-800/40' : 'bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 border border-rose-200/60 dark:border-rose-800/40'}`}>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                            {costAdjustment !== 100 ? 'Cost-Adjusted Difference' : 'Total Compensation Difference'}
                        </p>
                        <p className={`text-4xl font-bold ${isBetter ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {result.adjustedDifference >= 0 ? '+' : ''}{formatPrice(Math.round(result.adjustedDifference))}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                            {isBetter ? 'The offer is better overall' : 'Your current package is better after adjustments'}
                        </p>
                    </div>

                    {/* Bar chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Total Compensation</p>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-slate-600 dark:text-slate-400">Current</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(result.currentTotal)}</span>
                                </div>
                                <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                    <div className="bg-blue-400 transition-all" style={{ width: `${(currentSalary / maxTotal) * 100}%` }} />
                                    <div className="bg-blue-600 transition-all" style={{ width: `${(currentBenefits / maxTotal) * 100}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-slate-600 dark:text-slate-400">Offered</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(result.offeredTotal)}</span>
                                </div>
                                <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                    <div className="bg-emerald-400 transition-all" style={{ width: `${(offeredSalary / maxTotal) * 100}%` }} />
                                    <div className="bg-emerald-600 transition-all" style={{ width: `${(offeredBenefits / maxTotal) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-3 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" /> Salary</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" /> Benefits</span>
                        </div>
                    </div>

                    {/* Donut: offered breakdown */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            <circle cx="50" cy="50" r={r} fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={benefitsOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-sm font-bold">{salaryPct}%</text>
                            <text x="50" y="62" textAnchor="middle" className="fill-slate-500 text-[9px]">Salary</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Offered Breakdown</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-600 dark:text-slate-400">Salary</span></div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(offeredSalary)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400" /><span className="text-xs text-slate-600 dark:text-slate-400">Benefits</span></div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(offeredBenefits)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cost adjustment note */}
                    {costAdjustment !== 100 && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-amber-600" />
                                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                                    Cost of living adjustment: {costAdjustment}% — offered value is equivalent to {formatPrice(Math.round(result.adjustedOffered))} in your current location.
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            {/* Current Salary */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Salary</label>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{formatPrice(currentSalary)}</span>
                </div>
                <input type="number" value={currentSalary} onChange={e => setCurrentSalary(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={300000} step={1000} value={currentSalary} onChange={e => setCurrentSalary(Number(e.target.value))} className="w-full mt-2 accent-blue-500" />
            </div>

            {/* Offered Salary */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Offered Salary</label>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(offeredSalary)}</span>
                </div>
                <input type="number" value={offeredSalary} onChange={e => setOfferedSalary(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={300000} step={1000} value={offeredSalary} onChange={e => setOfferedSalary(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Benefits */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Benefits Value</label>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{formatPrice(currentBenefits)}</span>
                </div>
                <input type="number" value={currentBenefits} onChange={e => setCurrentBenefits(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={50000} step={500} value={currentBenefits} onChange={e => setCurrentBenefits(Number(e.target.value))} className="w-full mt-2 accent-slate-400" />
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Offered Benefits Value</label>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{formatPrice(offeredBenefits)}</span>
                </div>
                <input type="number" value={offeredBenefits} onChange={e => setOfferedBenefits(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={50000} step={500} value={offeredBenefits} onChange={e => setOfferedBenefits(Number(e.target.value))} className="w-full mt-2 accent-slate-400" />
            </div>

            {/* Cost of living adjustment */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cost of Living Index</label>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{costAdjustment}%</span>
                </div>
                <input type="number" value={costAdjustment} onChange={e => setCostAdjustment(Number(e.target.value))} min={50} max={200} step={1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={50} max={200} step={1} value={costAdjustment} onChange={e => setCostAdjustment(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
                <p className="text-[10px] text-slate-500 mt-1">100% = same cost. 120% = new location is 20% more expensive.</p>
            </div>
        </CalculatorLayout>
    );
}
