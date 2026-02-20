'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { RefreshCw, TrendingDown, DollarSign, Clock } from 'lucide-react';

export default function MortgageRefinance() {
    const { formatPrice } = useCurrency();
    const [currentBalance, setCurrentBalance] = useState(250000);
    const [currentRate, setCurrentRate] = useState(6.5);
    const [currentRemainingTerm, setCurrentRemainingTerm] = useState(25);
    const [newRate, setNewRate] = useState(5.0);
    const [newTerm, setNewTerm] = useState(30);
    const [closingCosts, setClosingCosts] = useState(5000);

    const calcEmi = (principal: number, rate: number, termYears: number) => {
        const r = rate / 100 / 12;
        const n = termYears * 12;
        if (r === 0) return principal / n;
        return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    };

    const result = useMemo(() => {
        const currentEmi = calcEmi(currentBalance, currentRate, currentRemainingTerm);
        const currentTotalPayment = currentEmi * currentRemainingTerm * 12;
        const currentTotalInterest = currentTotalPayment - currentBalance;

        const newLoanAmount = currentBalance + closingCosts;
        const newEmi = calcEmi(newLoanAmount, newRate, newTerm);
        const newTotalPayment = newEmi * newTerm * 12;
        const newTotalInterest = newTotalPayment - newLoanAmount;

        const monthlySavings = currentEmi - newEmi;
        const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;
        const breakEvenYears = breakEvenMonths / 12;

        // Total savings = current remaining cost - new total cost
        const totalSavings = currentTotalPayment - newTotalPayment;
        const lifetimeSavings = totalSavings;

        return {
            currentEmi,
            currentTotalPayment,
            currentTotalInterest,
            newEmi,
            newTotalPayment,
            newTotalInterest,
            newLoanAmount,
            monthlySavings,
            breakEvenMonths,
            breakEvenYears,
            lifetimeSavings,
            worthIt: monthlySavings > 0 && breakEvenMonths < newTerm * 12,
        };
    }, [currentBalance, currentRate, currentRemainingTerm, newRate, newTerm, closingCosts]);

    // Donut for current vs new
    const segments = [
        { label: 'New Principal', value: result.newLoanAmount, color: '#3b82f6' },
        { label: 'New Interest', value: Math.max(0, result.newTotalInterest), color: '#f59e0b' },
    ];
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const r = 42, circ = 2 * Math.PI * r;
    let cumulativeOffset = 0;

    return (
        <CalculatorLayout
            title="Mortgage Refinance Calculator"
            description="See if refinancing your mortgage will save you money"
            category="Real Estate"
            insights={[
                { label: 'New EMI', value: formatPrice(result.newEmi), color: 'text-blue-600' },
                { label: 'Monthly Savings', value: formatPrice(result.monthlySavings), color: result.monthlySavings > 0 ? 'text-emerald-600' : 'text-red-500' },
                { label: 'Break Even', value: result.breakEvenMonths < Infinity ? `${result.breakEvenMonths} mo` : 'Never', color: result.breakEvenMonths < 60 ? 'text-emerald-600' : 'text-amber-600' },
                { label: 'Lifetime Savings', value: formatPrice(result.lifetimeSavings), color: result.lifetimeSavings > 0 ? 'text-emerald-600' : 'text-red-500' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Hero — monthly savings */}
                    <div className={`text-center p-6 rounded-xl ${result.monthlySavings > 0 ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20' : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'}`}>
                        {result.monthlySavings > 0 ? (
                            <TrendingDown className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        ) : (
                            <DollarSign className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        )}
                        <p className="text-sm text-slate-500">Monthly Savings</p>
                        <p className={`text-4xl font-bold ${result.monthlySavings > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            <PriceDisplay amount={result.monthlySavings} maximumFractionDigits={0} />
                        </p>
                        <p className="text-sm text-slate-500 mt-1">/month</p>
                    </div>

                    {/* Side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">Current EMI</p>
                            <p className="text-xl font-bold text-slate-600 dark:text-slate-300">
                                <PriceDisplay amount={result.currentEmi} maximumFractionDigits={0} />
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{currentRate}% · {currentRemainingTerm} yrs left</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-slate-500 mb-1">New EMI</p>
                            <p className="text-xl font-bold text-blue-600">
                                <PriceDisplay amount={result.newEmi} maximumFractionDigits={0} />
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{newRate}% · {newTerm} yrs</p>
                        </div>
                    </div>

                    {/* Break even & savings */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                            <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                            <p className="text-xs text-slate-500 mb-1">Break Even</p>
                            <p className="text-xl font-bold text-amber-600">
                                {result.breakEvenMonths < Infinity ? `${result.breakEvenYears.toFixed(1)} yrs` : 'Never'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                {result.breakEvenMonths < Infinity ? `${result.breakEvenMonths} months` : 'No savings'}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl text-center ${result.lifetimeSavings > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                            <DollarSign className={`w-5 h-5 mx-auto mb-1 ${result.lifetimeSavings > 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                            <p className="text-xs text-slate-500 mb-1">Total Savings</p>
                            <p className={`text-xl font-bold ${result.lifetimeSavings > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                <PriceDisplay amount={result.lifetimeSavings} maximumFractionDigits={0} />
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">over loan life</p>
                        </div>
                    </div>

                    {/* Donut — new loan */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="110" height="110" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            {segments.map((seg, i) => {
                                const pct = total > 0 ? seg.value / total : 0;
                                const segLen = pct * circ;
                                const rotation = -90 + (cumulativeOffset / (total || 1)) * 360;
                                cumulativeOffset += seg.value;
                                return (
                                    <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="8"
                                        strokeDasharray={`${segLen} ${circ - segLen}`} strokeLinecap="butt"
                                        transform={`rotate(${rotation} 50 50)`} />
                                );
                            })}
                            <text x="50" y="54" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[9px] font-bold">
                                {formatPrice(result.newTotalPayment)}
                            </text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Loan Breakdown</p>
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

                    {/* Verdict */}
                    <div className={`p-4 rounded-xl border ${result.worthIt
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {result.worthIt ? '✓ Refinancing makes sense' : '✗ Refinancing may not be worth it'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {result.worthIt
                                ? `You'll recoup closing costs in ${result.breakEvenYears.toFixed(1)} years and save ${formatPrice(result.lifetimeSavings)} total.`
                                : 'The closing costs outweigh the interest savings, or the new rate is not low enough.'
                            }
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">Current Loan</p>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Balance</label>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{formatPrice(currentBalance)}</span>
                    </div>
                    <input type="number" value={currentBalance} onChange={(e) => setCurrentBalance(Number(e.target.value))} step={10000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={50000} max={1000000} step={10000} value={currentBalance}
                        onChange={(e) => setCurrentBalance(Number(e.target.value))} className="w-full accent-slate-500 mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate (%)</label>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{currentRate}%</span>
                        </div>
                        <input type="number" value={currentRate} onChange={(e) => setCurrentRate(Number(e.target.value))} step={0.125}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Remaining</label>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{currentRemainingTerm} yr</span>
                        </div>
                        <input type="number" value={currentRemainingTerm} onChange={(e) => setCurrentRemainingTerm(Number(e.target.value))} min={1} max={30}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    <RefreshCw size={14} className="text-blue-500" />
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </div>

                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">New Loan</p>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Rate (%)</label>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{newRate}%</span>
                        </div>
                        <input type="number" value={newRate} onChange={(e) => setNewRate(Number(e.target.value))} step={0.125}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Term</label>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{newTerm} yr</span>
                        </div>
                        <select value={newTerm} onChange={(e) => setNewTerm(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                            <option value={10}>10 years</option>
                            <option value={15}>15 years</option>
                            <option value={20}>20 years</option>
                            <option value={25}>25 years</option>
                            <option value={30}>30 years</option>
                        </select>
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Closing Costs</label>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{formatPrice(closingCosts)}</span>
                    </div>
                    <input type="number" value={closingCosts} onChange={(e) => setClosingCosts(Number(e.target.value))} step={500}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={0} max={20000} step={500} value={closingCosts}
                        onChange={(e) => setClosingCosts(Number(e.target.value))} className="w-full accent-amber-500 mt-1" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
