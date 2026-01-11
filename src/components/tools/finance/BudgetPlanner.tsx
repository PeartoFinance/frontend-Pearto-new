'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, PieChart, Wallet, TrendingDown } from 'lucide-react';

interface BudgetResult {
    needs: number;
    wants: number;
    savings: number;
    totalExpenses: number;
}

export default function BudgetPlanner() {
    const [monthlyIncome, setMonthlyIncome] = useState(75000);
    const [needsPercent, setNeedsPercent] = useState(50);
    const [wantsPercent, setWantsPercent] = useState(30);
    const [savingsPercent, setSavingsPercent] = useState(20);

    const result = useMemo<BudgetResult>(() => {
        const needs = (monthlyIncome * needsPercent) / 100;
        const wants = (monthlyIncome * wantsPercent) / 100;
        const savings = (monthlyIncome * savingsPercent) / 100;
        const totalExpenses = needs + wants;

        return { needs, wants, savings, totalExpenses };
    }, [monthlyIncome, needsPercent, wantsPercent, savingsPercent]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Budget Planner"
            description="Plan your budget using the 50/30/20 rule"
            category="Personal Finance"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Monthly Savings</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.savings)}</p>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-slate-600 dark:text-slate-400">Needs ({needsPercent}%)</span>
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(result.needs)}</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-purple-500" />
                                <span className="text-slate-600 dark:text-slate-400">Wants ({wantsPercent}%)</span>
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(result.wants)}</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-slate-600 dark:text-slate-400">Savings ({savingsPercent}%)</span>
                            </div>
                            <span className="font-semibold text-emerald-600">{formatCurrency(result.savings)}</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex h-6 rounded-full overflow-hidden">
                            <div className="bg-blue-500" style={{ width: `${needsPercent}%` }} />
                            <div className="bg-purple-500" style={{ width: `${wantsPercent}%` }} />
                            <div className="bg-emerald-500" style={{ width: `${savingsPercent}%` }} />
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly Income</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} min={10000}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <input type="range" min={10000} max={500000} step={5000} value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Needs: {needsPercent}%</label>
                <input type="range" min={30} max={70} value={needsPercent} onChange={(e) => setNeedsPercent(Number(e.target.value))} className="w-full accent-blue-500" />
                <p className="text-xs text-slate-500 mt-1">Rent, utilities, groceries, insurance</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Wants: {wantsPercent}%</label>
                <input type="range" min={10} max={50} value={wantsPercent} onChange={(e) => setWantsPercent(Number(e.target.value))} className="w-full accent-purple-500" />
                <p className="text-xs text-slate-500 mt-1">Entertainment, dining, hobbies</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Savings: {savingsPercent}%</label>
                <input type="range" min={10} max={50} value={savingsPercent} onChange={(e) => setSavingsPercent(Number(e.target.value))} className="w-full accent-emerald-500" />
                <p className="text-xs text-slate-500 mt-1">Investments, emergency fund, debt</p>
            </div>
        </CalculatorLayout>
    );
}
