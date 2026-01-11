'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function EmergencyFundCalculator() {
    const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
    const [monthsCoverage, setMonthsCoverage] = useState(6);
    const [currentSavings, setCurrentSavings] = useState(100000);
    const [monthlySavings, setMonthlySavings] = useState(10000);

    const result = useMemo(() => {
        const targetFund = monthlyExpenses * monthsCoverage;
        const deficit = Math.max(0, targetFund - currentSavings);
        const monthsToTarget = deficit > 0 && monthlySavings > 0 ? Math.ceil(deficit / monthlySavings) : 0;
        const completionPercent = Math.min(100, (currentSavings / targetFund) * 100);

        return {
            targetFund: Math.round(targetFund),
            deficit: Math.round(deficit),
            monthsToTarget,
            completionPercent: Math.round(completionPercent),
            isComplete: currentSavings >= targetFund
        };
    }, [monthlyExpenses, monthsCoverage, currentSavings, monthlySavings]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Emergency Fund Calculator"
            description="Calculate how much emergency fund you need"
            category="Personal Finance"
            results={
                <div className="space-y-6">
                    <div className={`text-center p-6 rounded-xl ${result.isComplete ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200' : 'bg-white dark:bg-slate-800'}`}>
                        <p className="text-sm text-slate-500 mb-1">Target Fund ({monthsCoverage} months)</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.targetFund)}</p>
                        {result.isComplete && <p className="text-sm text-emerald-600 mt-1">✓ Goal Achieved!</p>}
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-medium text-emerald-600">{result.completionPercent}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${result.completionPercent}%` }} />
                        </div>
                    </div>

                    {!result.isComplete && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                <span className="text-xs text-slate-500">Still Need</span>
                                <p className="text-lg font-semibold text-amber-600">{formatCurrency(result.deficit)}</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                <span className="text-xs text-slate-500">Months to Target</span>
                                <p className="text-lg font-semibold">{result.monthsToTarget}</p>
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly Expenses</label>
                <input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} min={10000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={10000} max={500000} step={5000} value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Months of Coverage: {monthsCoverage}</label>
                <input type="range" min={3} max={12} value={monthsCoverage} onChange={(e) => setMonthsCoverage(Number(e.target.value))} className="w-full accent-emerald-500" />
                <p className="text-xs text-slate-400 mt-1">Recommended: 6-12 months</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Savings</label>
                <input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly Savings Capacity</label>
                <input type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
