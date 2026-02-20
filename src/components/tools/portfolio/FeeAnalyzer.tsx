'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { DollarSign, TrendingDown, BarChart3, Percent } from 'lucide-react';

export default function FeeAnalyzer() {
    const { formatPrice } = useCurrency();
    const [investment, setInvestment] = useState(100000);
    const [annualFee, setAnnualFee] = useState(1.0);
    const [period, setPeriod] = useState(20);
    const [expectedReturn, setExpectedReturn] = useState(8.0);

    const result = useMemo(() => {
        const returnRate = expectedReturn / 100;
        const feeRate = annualFee / 100;

        // Year-by-year growth
        const years: { year: number; gross: number; net: number; feePaid: number; cumulativeFees: number }[] = [];
        let gross = investment;
        let net = investment;
        let cumulativeFees = 0;

        for (let y = 1; y <= period; y++) {
            gross = gross * (1 + returnRate);
            const feeThisYear = net * feeRate;
            net = net * (1 + returnRate) - net * feeRate;
            // More accurately: net grows at (returnRate - feeRate) effectively
            // Recalculate properly
            cumulativeFees += feeThisYear;
            years.push({
                year: y,
                gross: Math.round(gross),
                net: Math.round(net),
                feePaid: Math.round(feeThisYear),
                cumulativeFees: Math.round(cumulativeFees),
            });
        }

        // Re-compute precisely
        let grossVal = investment;
        let netVal = investment;
        let totalFees = 0;
        const preciseYears: typeof years = [];
        for (let y = 1; y <= period; y++) {
            grossVal *= (1 + returnRate);
            const fee = netVal * feeRate;
            netVal = netVal * (1 + returnRate - feeRate);
            totalFees += fee;
            preciseYears.push({
                year: y,
                gross: Math.round(grossVal),
                net: Math.round(netVal),
                feePaid: Math.round(fee),
                cumulativeFees: Math.round(totalFees),
            });
        }

        const finalGross = Math.round(grossVal);
        const finalNet = Math.round(netVal);
        const feeDrag = finalGross - finalNet;
        const feeDragPct = finalGross > 0 ? Math.round((feeDrag / finalGross) * 10000) / 100 : 0;

        return { years: preciseYears, finalGross, finalNet, totalFees: Math.round(totalFees), feeDrag, feeDragPct };
    }, [investment, annualFee, period, expectedReturn]);

    // SVG donut: net vs fees
    const netPct = result.finalGross > 0 ? Math.round((result.finalNet / result.finalGross) * 100) : 100;
    const feePct = 100 - netPct;
    const r = 42, circ = 2 * Math.PI * r;
    const feeOffset = circ - (feePct / 100) * circ;

    // Growth chart points
    const maxVal = Math.max(...result.years.map(y => y.gross), 1);
    const chartW = 280, chartH = 120;
    const grossPoints = result.years.map((y, i) => `${(i / (result.years.length - 1)) * chartW},${chartH - (y.gross / maxVal) * chartH}`).join(' ');
    const netPoints = result.years.map((y, i) => `${(i / (result.years.length - 1)) * chartW},${chartH - (y.net / maxVal) * chartH}`).join(' ');

    return (
        <CalculatorLayout
            title="Fee Analyzer"
            description="Understand how investment fees erode your returns over time"
            category="Portfolio Analysis"
            insights={[
                { label: 'Gross Value', value: formatPrice(result.finalGross) },
                { label: 'Net (After Fees)', value: formatPrice(result.finalNet), color: 'text-blue-600' },
                { label: 'Total Fees Paid', value: formatPrice(result.totalFees), color: 'text-rose-600' },
                { label: 'Fee Drag', value: `${result.feeDragPct}%`, color: 'text-amber-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Verdict */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 border border-rose-200/60 dark:border-rose-800/40">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Fee Drag Over {period} Years</p>
                        <p className="text-4xl font-bold text-rose-600">{formatPrice(result.feeDrag)}</p>
                        <p className="text-xs text-slate-500 mt-2">
                            Fees consume {result.feeDragPct}% of your potential growth
                        </p>
                    </div>

                    {/* Growth chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Growth Comparison</p>
                        <svg viewBox={`-10 -10 ${chartW + 20} ${chartH + 30}`} className="w-full h-36">
                            <polyline points={grossPoints} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <polyline points={netPoints} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6,3" />
                            {/* X axis labels */}
                            <text x="0" y={chartH + 16} className="fill-slate-400 text-[9px]">Yr 1</text>
                            <text x={chartW} y={chartH + 16} textAnchor="end" className="fill-slate-400 text-[9px]">Yr {period}</text>
                            {/* End labels */}
                            <text x={chartW + 5} y={(chartH - (result.finalGross / maxVal) * chartH) + 3} className="fill-emerald-600 text-[8px] font-bold">{formatPrice(result.finalGross)}</text>
                            <text x={chartW + 5} y={(chartH - (result.finalNet / maxVal) * chartH) + 3} className="fill-blue-600 text-[8px] font-bold">{formatPrice(result.finalNet)}</text>
                        </svg>
                        <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-emerald-500 inline-block" /> Gross (No Fees)</span>
                            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-blue-500 inline-block border-dashed" /> Net (After Fees)</span>
                        </div>
                    </div>

                    {/* Donut: net vs fees */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            <circle cx="50" cy="50" r={r} fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={feeOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-sm font-bold">{netPct}%</text>
                            <text x="50" y="62" textAnchor="middle" className="fill-slate-500 text-[9px]">Kept</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Final Value Split</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-600 dark:text-slate-400">Net Value</span></div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(result.finalNet)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-slate-600 dark:text-slate-400">Lost to Fees</span></div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(result.feeDrag)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Milestone snapshots */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Fee Impact Over Time</p>
                        <div className="space-y-2">
                            {result.years.filter(y => y.year === 5 || y.year === 10 || y.year === 15 || y.year === 20 || y.year === period).filter((v, i, a) => a.findIndex(x => x.year === v.year) === i).map(y => (
                                <div key={y.year} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Year {y.year}</span>
                                    <div className="flex gap-4">
                                        <span className="text-emerald-600 font-semibold">{formatPrice(y.gross)}</span>
                                        <span className="text-blue-600 font-semibold">{formatPrice(y.net)}</span>
                                        <span className="text-rose-500 font-semibold">-{formatPrice(y.gross - y.net)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            {/* Investment Amount */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Investment Amount</label>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{formatPrice(investment)}</span>
                </div>
                <input type="number" value={investment} onChange={e => setInvestment(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1000} max={1000000} step={1000} value={investment} onChange={e => setInvestment(Number(e.target.value))} className="w-full mt-2 accent-blue-500" />
            </div>

            {/* Annual Fee */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Annual Fee (%)</label>
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md">{annualFee}%</span>
                </div>
                <input type="number" value={annualFee} onChange={e => setAnnualFee(Number(e.target.value))} min={0} max={5} step={0.01}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={3} step={0.05} value={annualFee} onChange={e => setAnnualFee(Number(e.target.value))} className="w-full mt-2 accent-rose-500" />
            </div>

            {/* Investment Period */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Investment Period (Years)</label>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{period} yrs</span>
                </div>
                <input type="number" value={period} onChange={e => setPeriod(Number(e.target.value))} min={1} max={50}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1} max={50} step={1} value={period} onChange={e => setPeriod(Number(e.target.value))} className="w-full mt-2 accent-slate-400" />
            </div>

            {/* Expected Return */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Expected Annual Return (%)</label>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{expectedReturn}%</span>
                </div>
                <input type="number" value={expectedReturn} onChange={e => setExpectedReturn(Number(e.target.value))} min={0} max={30} step={0.1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={20} step={0.5} value={expectedReturn} onChange={e => setExpectedReturn(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
