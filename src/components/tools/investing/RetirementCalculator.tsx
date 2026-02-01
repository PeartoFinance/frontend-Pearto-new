'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { DollarSign, TrendingUp, Calendar, Target } from 'lucide-react';

interface RetirementResult {
    currentSavings: number;
    monthlyNeeded: number;
    totalCorpus: number;
    yearlyExpense: number;
}

export default function RetirementCalculator() {
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(60);
    const [monthlyExpense, setMonthlyExpense] = useState(50000);
    const [expectedReturn, setExpectedReturn] = useState(10);
    const [inflation, setInflation] = useState(6);

    const result = useMemo<RetirementResult>(() => {
        const yearsToRetire = retirementAge - currentAge;
        const yearsInRetirement = 25; // Assume 25 years post-retirement

        // Future monthly expense (adjusted for inflation)
        const futureMonthlyExpense = monthlyExpense * Math.pow(1 + inflation / 100, yearsToRetire);
        const yearlyExpense = futureMonthlyExpense * 12;

        // Real rate of return during retirement
        const realReturn = (expectedReturn - inflation) / 100;

        // Corpus needed at retirement (present value of annuity)
        const totalCorpus = yearlyExpense * ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn);

        // Monthly SIP needed (to reach the corpus)
        const monthlyReturn = expectedReturn / 100 / 12;
        const months = yearsToRetire * 12;
        const monthlyNeeded = totalCorpus / (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn));

        return {
            currentSavings: 0,
            monthlyNeeded: Math.round(monthlyNeeded),
            totalCorpus: Math.round(totalCorpus),
            yearlyExpense: Math.round(yearlyExpense)
        };
    }, [currentAge, retirementAge, monthlyExpense, expectedReturn, inflation]);



    return (
        <CalculatorLayout
            title="Retirement Calculator"
            description="Plan your retirement corpus and monthly savings required"
            category="Retirement"
            results={
                <div className="space-y-6">
                    {/* Main Result */}
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Retirement Corpus Needed</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            <PriceDisplay amount={result.totalCorpus} />
                        </p>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-slate-500">Monthly SIP</span>
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                <PriceDisplay amount={result.monthlyNeeded} />
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-amber-500" />
                                <span className="text-xs text-slate-500">Yearly Expense</span>
                            </div>
                            <p className="text-lg font-semibold text-amber-600">
                                <PriceDisplay amount={result.yearlyExpense} />
                            </p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Years to Retirement</span>
                            <span className="font-semibold text-emerald-600">{retirementAge - currentAge} years</span>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Current Age */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Age
                </label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(Number(e.target.value))}
                        min={18}
                        max={60}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input type="range" min={18} max={60} value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Retirement Age */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Retirement Age
                </label>
                <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={retirementAge}
                        onChange={(e) => setRetirementAge(Number(e.target.value))}
                        min={currentAge + 1}
                        max={80}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input type="range" min={currentAge + 1} max={80} value={retirementAge} onChange={(e) => setRetirementAge(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Monthly Expense */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Monthly Expense
                </label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={monthlyExpense}
                        onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                        min={10000}
                        max={1000000}
                        step={5000}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input type="range" min={10000} max={200000} step={5000} value={monthlyExpense} onChange={(e) => setMonthlyExpense(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Expected Return & Inflation */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Return (%)</label>
                    <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} min={5} max={20} step={0.5}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Inflation (%)</label>
                    <input type="number" value={inflation} onChange={(e) => setInflation(Number(e.target.value))} min={2} max={12} step={0.5}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
