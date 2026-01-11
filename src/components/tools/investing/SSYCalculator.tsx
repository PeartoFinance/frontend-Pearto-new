'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Baby, TrendingUp } from 'lucide-react';

export default function SSYCalculator() {
    const [yearlyDeposit, setYearlyDeposit] = useState(150000);
    const [interestRate, setInterestRate] = useState(8.2);
    const [depositYears, setDepositYears] = useState(15);
    const [currentAge, setCurrentAge] = useState(5);

    const result = useMemo(() => {
        // SSY: Deposit for 15 years, matures when girl turns 21
        const maturityYear = 21 - currentAge;
        const r = interestRate / 100;
        let balance = 0;

        // Deposit phase (first 15 years)
        for (let year = 1; year <= depositYears; year++) {
            balance = (balance + yearlyDeposit) * (1 + r);
        }

        // Growth phase (remaining years till maturity)
        const remainingYears = maturityYear - depositYears;
        for (let year = 1; year <= remainingYears; year++) {
            balance = balance * (1 + r);
        }

        const totalDeposit = yearlyDeposit * depositYears;
        const totalInterest = balance - totalDeposit;
        const maturityAge = 21;

        return {
            maturityValue: Math.round(balance),
            totalDeposit: Math.round(totalDeposit),
            totalInterest: Math.round(totalInterest),
            maturityAge
        };
    }, [yearlyDeposit, interestRate, depositYears, currentAge]);

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Sukanya Samriddhi Calculator"
            description="Calculate SSY returns for your daughter's future"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
                        <Baby className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 mb-1">Maturity at Age 21</p>
                        <p className="text-4xl font-bold text-pink-600">{formatCurrency(result.maturityValue)}</p>
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
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400">
                        <p>✓ Tax-free under Section 80C</p>
                        <p>✓ 50% withdrawal at age 18 for education</p>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Girl's Current Age</label>
                <input type="number" value={currentAge} onChange={(e) => setCurrentAge(Math.min(10, Number(e.target.value)))} min={0} max={10}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-slate-400 mt-1">Account can be opened till age 10</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Yearly Deposit (Max ₹1.5L)</label>
                <input type="number" value={yearlyDeposit} onChange={(e) => setYearlyDeposit(Math.min(150000, Number(e.target.value)))} min={250} max={150000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1000} max={150000} step={1000} value={yearlyDeposit} onChange={(e) => setYearlyDeposit(Number(e.target.value))} className="w-full mt-2 accent-pink-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Interest Rate (% p.a.)</label>
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} min={5} max={12} step={0.1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-slate-400 mt-1">Current rate: 8.2% (as of 2024)</p>
            </div>
        </CalculatorLayout>
    );
}
