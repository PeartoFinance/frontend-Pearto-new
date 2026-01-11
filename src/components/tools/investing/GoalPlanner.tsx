'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Target, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface GoalResult {
    monthlyRequired: number;
    totalInvestment: number;
    totalReturns: number;
    inflationAdjustedGoal: number;
}

export default function GoalPlanner() {
    const [goalAmount, setGoalAmount] = useState(1000000);
    const [timeHorizon, setTimeHorizon] = useState(5);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [inflation, setInflation] = useState(6);

    const result = useMemo<GoalResult>(() => {
        // Adjust goal for inflation
        const inflationAdjustedGoal = goalAmount * Math.pow(1 + inflation / 100, timeHorizon);

        // Calculate monthly SIP needed
        const r = expectedReturn / 100 / 12; // Monthly rate
        const n = timeHorizon * 12; // Total months

        // Rearranged SIP formula: P = FV / (((1 + r)^n - 1) / r) * (1 + r))
        const monthlyRequired = inflationAdjustedGoal / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
        const totalInvestment = monthlyRequired * n;
        const totalReturns = inflationAdjustedGoal - totalInvestment;

        return {
            monthlyRequired: Math.round(monthlyRequired),
            totalInvestment: Math.round(totalInvestment),
            totalReturns: Math.round(totalReturns),
            inflationAdjustedGoal: Math.round(inflationAdjustedGoal)
        };
    }, [goalAmount, timeHorizon, expectedReturn, inflation]);

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Goal Planner"
            description="Plan your investment to achieve financial goals"
            category="Investing"
            results={
                <div className="space-y-6">
                    {/* Main Result */}
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Monthly SIP Required</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            {formatCurrency(result.monthlyRequired)}
                        </p>
                    </div>

                    {/* Goal Info */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Inflation-Adjusted Goal</span>
                            <span className="font-semibold text-amber-600">{formatCurrency(result.inflationAdjustedGoal)}</span>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-slate-500">Your Investment</span>
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {formatCurrency(result.totalInvestment)}
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs text-slate-500">Expected Returns</span>
                            </div>
                            <p className="text-lg font-semibold text-emerald-600">
                                {formatCurrency(result.totalReturns)}
                            </p>
                        </div>
                    </div>

                    {/* Visual Progress */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex h-6 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${(result.totalInvestment / result.inflationAdjustedGoal) * 100}%` }}
                            >
                                {Math.round((result.totalInvestment / result.inflationAdjustedGoal) * 100)}%
                            </div>
                            <div
                                className="bg-emerald-500 flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${(result.totalReturns / result.inflationAdjustedGoal) * 100}%` }}
                            >
                                {Math.round((result.totalReturns / result.inflationAdjustedGoal) * 100)}%
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>Investment</span>
                            <span>Returns</span>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Goal Amount */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Goal Amount (Today's Value)
                </label>
                <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(Number(e.target.value))}
                        min={10000}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input type="range" min={100000} max={10000000} step={100000} value={goalAmount} onChange={(e) => setGoalAmount(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Time Horizon */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Time Horizon (Years)
                </label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={timeHorizon}
                        onChange={(e) => setTimeHorizon(Number(e.target.value))}
                        min={1}
                        max={30}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input type="range" min={1} max={30} value={timeHorizon} onChange={(e) => setTimeHorizon(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Return & Inflation */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Return (%)</label>
                    <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} min={5} max={25} step={0.5}
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
