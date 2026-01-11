'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';

export default function RDCalculator() {
    const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
    const [interestRate, setInterestRate] = useState(6.5);
    const [tenure, setTenure] = useState(36);

    const result = useMemo(() => {
        const r = interestRate / 100 / 4; // Quarterly rate
        const n = tenure / 3; // Quarters
        const totalDeposit = monthlyDeposit * tenure;

        // RD formula with quarterly compounding
        let maturityValue = 0;
        for (let month = 0; month < tenure; month++) {
            const quartersRemaining = (tenure - month - 1) / 3 + 1;
            maturityValue += monthlyDeposit * Math.pow(1 + r, quartersRemaining);
        }

        const totalInterest = maturityValue - totalDeposit;

        return {
            maturityValue: Math.round(maturityValue),
            totalDeposit: Math.round(totalDeposit),
            totalInterest: Math.round(totalInterest)
        };
    }, [monthlyDeposit, interestRate, tenure]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="RD Calculator"
            description="Calculate Recurring Deposit maturity amount"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Maturity Value</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.maturityValue)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Deposit</span>
                            <p className="text-lg font-semibold text-blue-600">{formatCurrency(result.totalDeposit)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Interest Earned</span>
                            <p className="text-lg font-semibold text-emerald-600">{formatCurrency(result.totalInterest)}</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly Deposit</label>
                <input type="number" value={monthlyDeposit} onChange={(e) => setMonthlyDeposit(Number(e.target.value))} min={100}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={500} max={50000} step={500} value={monthlyDeposit} onChange={(e) => setMonthlyDeposit(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Interest Rate (% p.a.)</label>
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} min={3} max={12} step={0.1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tenure (Months)</label>
                <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} min={6} max={120}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={6} max={120} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
