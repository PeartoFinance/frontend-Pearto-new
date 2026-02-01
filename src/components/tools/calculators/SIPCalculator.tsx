'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { IndianRupee, TrendingUp, Calendar, PiggyBank } from 'lucide-react';

interface SIPResult {
    investedAmount: number;
    estimatedReturns: number;
    totalValue: number;
}

export default function SIPCalculator() {
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);

    // Calculate SIP
    const result = useMemo<SIPResult>(() => {
        const P = monthlyInvestment;
        const r = expectedReturn / 100 / 12; // Monthly rate
        const n = timePeriod * 12; // Total months

        // SIP Formula: P × ((1 + r)^n - 1) / r × (1 + r)
        const totalValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const investedAmount = P * n;
        const estimatedReturns = totalValue - investedAmount;

        return {
            investedAmount: Math.round(investedAmount),
            estimatedReturns: Math.round(estimatedReturns),
            totalValue: Math.round(totalValue)
        };
    }, [monthlyInvestment, expectedReturn, timePeriod]);



    return (
        <CalculatorLayout
            title="SIP Calculator"
            description="Calculate the future value of your Systematic Investment Plan"
            category="Investing"
            results={
                <div className="space-y-6">
                    {/* Main Result */}
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Total Value</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            <PriceDisplay amount={result.totalValue} />
                        </p>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <PiggyBank className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-slate-500">Invested</span>
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                <PriceDisplay amount={result.investedAmount} />
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs text-slate-500">Returns</span>
                            </div>
                            <p className="text-lg font-semibold text-emerald-600">
                                <PriceDisplay amount={result.estimatedReturns} />
                            </p>
                        </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex h-6 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${(result.investedAmount / result.totalValue) * 100}%` }}
                            >
                                {Math.round((result.investedAmount / result.totalValue) * 100)}%
                            </div>
                            <div
                                className="bg-emerald-500 flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${(result.estimatedReturns / result.totalValue) * 100}%` }}
                            >
                                {Math.round((result.estimatedReturns / result.totalValue) * 100)}%
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>Principal</span>
                            <span>Returns</span>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Monthly Investment */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Monthly Investment
                </label>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={monthlyInvestment}
                        onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                        min={500}
                        max={1000000}
                        step={500}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                <input
                    type="range"
                    min={500}
                    max={100000}
                    step={500}
                    value={monthlyInvestment}
                    onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                />
            </div>

            {/* Expected Return */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Expected Return Rate (% p.a.)
                </label>
                <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={expectedReturn}
                        onChange={(e) => setExpectedReturn(Number(e.target.value))}
                        min={1}
                        max={30}
                        step={0.5}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                <input
                    type="range"
                    min={1}
                    max={30}
                    step={0.5}
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                />
            </div>

            {/* Time Period */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Time Period (Years)
                </label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(Number(e.target.value))}
                        min={1}
                        max={40}
                        step={1}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                <input
                    type="range"
                    min={1}
                    max={40}
                    step={1}
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                />
            </div>
        </CalculatorLayout>
    );
}
