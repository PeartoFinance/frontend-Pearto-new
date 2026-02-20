'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { User, TrendingUp, Calendar, Minus, DollarSign } from 'lucide-react';

export default function HumanLifeValue() {
    const { formatPrice } = useCurrency();
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(60);
    const [annualIncome, setAnnualIncome] = useState(1200000);
    const [expectedGrowth, setExpectedGrowth] = useState(6);
    const [annualExpenses, setAnnualExpenses] = useState(500000);
    const [discountRate, setDiscountRate] = useState(8);

    const result = useMemo(() => {
        const workingYears = Math.max(0, retirementAge - currentAge);
        const growthRate = expectedGrowth / 100;
        const discount = discountRate / 100;
        let hlv = 0;
        const projection: { year: number; age: number; income: number; expenses: number; net: number; pv: number }[] = [];

        for (let i = 0; i < workingYears; i++) {
            const income = annualIncome * Math.pow(1 + growthRate, i);
            const expenses = annualExpenses * Math.pow(1 + growthRate * 0.5, i); // Expenses grow at half the rate
            const net = income - expenses;
            const pv = net / Math.pow(1 + discount, i + 1);
            hlv += pv;
            projection.push({
                year: i + 1,
                age: currentAge + i,
                income: Math.round(income),
                expenses: Math.round(expenses),
                net: Math.round(net),
                pv: Math.round(pv),
            });
        }

        const totalFutureIncome = projection.reduce((s, p) => s + p.income, 0);
        const totalFutureExpenses = projection.reduce((s, p) => s + p.expenses, 0);

        return {
            hlv: Math.round(hlv),
            workingYears,
            totalFutureIncome: Math.round(totalFutureIncome),
            totalFutureExpenses: Math.round(totalFutureExpenses),
            projection,
        };
    }, [currentAge, retirementAge, annualIncome, expectedGrowth, annualExpenses, discountRate]);

    // Donut: income vs expenses proportion
    const incomePct = result.totalFutureIncome > 0
        ? Math.round((result.totalFutureIncome / (result.totalFutureIncome + result.totalFutureExpenses)) * 100)
        : 50;
    const expensesPct = 100 - incomePct;
    const r = 45, circ = 2 * Math.PI * r;
    const expensesOffset = circ - (expensesPct / 100) * circ;

    // Show first 5 and last 5 years of projection
    const showProjection = result.projection.length <= 12
        ? result.projection
        : [...result.projection.slice(0, 5), ...result.projection.slice(-5)];

    return (
        <CalculatorLayout
            title="Human Life Value Calculator"
            description="Calculate the economic value of your life based on present value of future earnings minus expenses"
            category="Insurance"
            insights={[
                { label: 'Human Life Value', value: formatPrice(result.hlv), color: 'text-emerald-600' },
                { label: 'Working Years', value: `${result.workingYears} yrs` },
                { label: 'Total Future Income', value: formatPrice(result.totalFutureIncome), color: 'text-blue-600' },
                { label: 'Total Future Expenses', value: formatPrice(result.totalFutureExpenses), color: 'text-rose-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Main HLV display */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/60 dark:border-emerald-800/40">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Human Life Value (HLV)</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatPrice(result.hlv)}</p>
                        <p className="text-xs text-slate-500 mt-2">Present value of future net earnings over {result.workingYears} years</p>
                    </div>

                    {/* Donut chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 flex items-center gap-6">
                        <svg width="110" height="110" viewBox="0 0 110 110" className="flex-shrink-0">
                            <circle cx="55" cy="55" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-700" />
                            <circle cx="55" cy="55" r={r} fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={0} strokeLinecap="butt" transform="rotate(-90 55 55)" />
                            <circle cx="55" cy="55" r={r} fill="none" stroke="#ef4444" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={expensesOffset} strokeLinecap="butt" transform="rotate(-90 55 55)" />
                            <text x="55" y="52" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[10px] font-bold">HLV</text>
                            <text x="55" y="64" textAnchor="middle" className="fill-emerald-600 text-[8px] font-semibold">{formatPrice(result.hlv).length > 10 ? '...' : formatPrice(result.hlv)}</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Future Income</span>
                                </div>
                                <span className="text-sm font-semibold text-blue-600">{formatPrice(result.totalFutureIncome)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Future Expenses</span>
                                </div>
                                <span className="text-sm font-semibold text-rose-600">{formatPrice(result.totalFutureExpenses)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">HLV (PV)</span>
                                </div>
                                <span className="text-sm font-semibold text-emerald-600">{formatPrice(result.hlv)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Working Years</span>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{result.workingYears} yrs</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Discount Rate</span>
                            <p className="text-lg font-semibold text-amber-600">{discountRate}%</p>
                        </div>
                    </div>

                    {/* Year-by-year projection */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Year-by-Year Projection</p>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                            <div className="grid grid-cols-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-700">
                                <span>Age</span>
                                <span className="text-right">Income</span>
                                <span className="text-right">Expenses</span>
                                <span className="text-right">PV Net</span>
                            </div>
                            {showProjection.map((row, i) => (
                                <div key={i} className="grid grid-cols-4 text-xs py-1">
                                    <span className="text-slate-600 dark:text-slate-400">{row.age}</span>
                                    <span className="text-right text-blue-600">{formatPrice(row.income)}</span>
                                    <span className="text-right text-rose-500">{formatPrice(row.expenses)}</span>
                                    <span className="text-right font-semibold text-emerald-600">{formatPrice(row.pv)}</span>
                                </div>
                            ))}
                            {result.projection.length > 12 && (
                                <p className="text-[10px] text-center text-slate-400 py-1">... {result.projection.length - 10} more years ...</p>
                            )}
                        </div>
                    </div>
                </div>
            }
        >
            {/* Current Age */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Age</label>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">{currentAge} years</span>
                </div>
                <input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} min={18} max={70}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={18} max={70} value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} className="w-full mt-2 accent-purple-500" />
            </div>

            {/* Retirement Age */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Retirement Age</label>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{retirementAge} years</span>
                </div>
                <input type="number" value={retirementAge} onChange={e => setRetirementAge(Number(e.target.value))} min={currentAge + 1} max={80}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={currentAge + 1} max={80} value={retirementAge} onChange={e => setRetirementAge(Number(e.target.value))} className="w-full mt-2 accent-blue-500" />
            </div>

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

            {/* Expected Growth */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Expected Income Growth %</label>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{expectedGrowth}%</span>
                </div>
                <input type="number" value={expectedGrowth} onChange={e => setExpectedGrowth(Number(e.target.value))} min={0} max={25} step={0.5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={25} step={0.5} value={expectedGrowth} onChange={e => setExpectedGrowth(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
            </div>

            {/* Annual Expenses */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Annual Expenses</label>
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md">{formatPrice(annualExpenses)}</span>
                </div>
                <input type="number" value={annualExpenses} onChange={e => setAnnualExpenses(Number(e.target.value))} min={0} step={50000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={5000000} step={50000} value={annualExpenses} onChange={e => setAnnualExpenses(Number(e.target.value))} className="w-full mt-2 accent-rose-500" />
            </div>

            {/* Discount Rate */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Discount Rate %</label>
                    <span className="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-md">{discountRate}%</span>
                </div>
                <input type="number" value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))} min={1} max={20} step={0.5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1} max={20} step={0.5} value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))} className="w-full mt-2 accent-violet-500" />
            </div>
        </CalculatorLayout>
    );
}
