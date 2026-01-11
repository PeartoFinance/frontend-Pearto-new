'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function NSSCalculator() {
    const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
    const [interestRate, setInterestRate] = useState(7.7);

    const result = useMemo(() => {
        // NSS: 5-year scheme with annual compounding
        const years = 5;
        const r = interestRate / 100;
        let maturityValue = 0;
        const totalDeposit = monthlyDeposit * 12 * years;

        // Calculate compounding for each monthly deposit
        for (let month = 0; month < years * 12; month++) {
            const yearsRemaining = (years * 12 - month) / 12;
            maturityValue += monthlyDeposit * Math.pow(1 + r, yearsRemaining);
        }

        const totalInterest = maturityValue - totalDeposit;

        return {
            maturityValue: Math.round(maturityValue),
            totalDeposit: Math.round(totalDeposit),
            totalInterest: Math.round(totalInterest)
        };
    }, [monthlyDeposit, interestRate]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="NSC Calculator"
            description="Calculate National Savings Certificate returns"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Maturity Value (5 Years)</p>
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
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                            ✓ Tax deduction under Section 80C (up to ₹1.5 Lakh)
                        </p>
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
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} min={5} max={12} step={0.1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-slate-400 mt-1">Current rate: 7.7% (as of 2024)</p>
            </div>
        </CalculatorLayout>
    );
}
