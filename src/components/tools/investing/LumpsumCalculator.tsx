'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function LumpsumCalculator() {
    const [principal, setPrincipal] = useState(100000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);

    const result = useMemo(() => {
        const r = expectedReturn / 100;
        const futureValue = principal * Math.pow(1 + r, timePeriod);
        const totalReturns = futureValue - principal;
        const multiplier = futureValue / principal;

        return {
            futureValue: Math.round(futureValue),
            totalReturns: Math.round(totalReturns),
            multiplier: Math.round(multiplier * 100) / 100
        };
    }, [principal, expectedReturn, timePeriod]);

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Lumpsum Calculator"
            description="Calculate future value of a one-time investment"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Future Value</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.futureValue)}</p>
                        <p className="text-sm text-emerald-500 mt-1">{result.multiplier}x growth</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Invested</span>
                            <p className="text-lg font-semibold text-blue-600">{formatCurrency(principal)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Returns</span>
                            <p className="text-lg font-semibold text-emerald-600">{formatCurrency(result.totalReturns)}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex h-6 rounded-full overflow-hidden">
                            <div className="bg-blue-500 flex items-center justify-center text-xs text-white" style={{ width: `${(principal / result.futureValue) * 100}%` }}>
                                {Math.round((principal / result.futureValue) * 100)}%
                            </div>
                            <div className="bg-emerald-500 flex items-center justify-center text-xs text-white" style={{ width: `${(result.totalReturns / result.futureValue) * 100}%` }}>
                                {Math.round((result.totalReturns / result.futureValue) * 100)}%
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Investment Amount</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} min={1000}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <input type="range" min={10000} max={10000000} step={10000} value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Expected Return (% p.a.)</label>
                <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} min={1} max={50} step={0.5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1} max={30} step={0.5} value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time Period (Years)</label>
                <input type="number" value={timePeriod} onChange={(e) => setTimePeriod(Number(e.target.value))} min={1} max={50}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1} max={40} value={timePeriod} onChange={(e) => setTimePeriod(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
