'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Clock, Percent } from 'lucide-react';

export default function ELSSCalculator() {
    const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [years, setYears] = useState(5);
    const [taxBracket, setTaxBracket] = useState(30);

    const result = useMemo(() => {
        const r = expectedReturn / 100 / 12;
        const n = years * 12;
        const totalInvestment = monthlyInvestment * n;

        // SIP future value
        const futureValue = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const returns = futureValue - totalInvestment;

        // Tax savings under 80C (max 1.5L per year)
        const yearlyInvestment = Math.min(monthlyInvestment * 12, 150000);
        const yearlySavings = yearlyInvestment * (taxBracket / 100);
        const totalTaxSavings = yearlySavings * years;

        // Effective returns including tax benefit
        const effectiveValue = futureValue + totalTaxSavings;

        return {
            totalInvestment: Math.round(totalInvestment),
            futureValue: Math.round(futureValue),
            returns: Math.round(returns),
            yearlyTaxSavings: Math.round(yearlySavings),
            totalTaxSavings: Math.round(totalTaxSavings),
            effectiveValue: Math.round(effectiveValue)
        };
    }, [monthlyInvestment, expectedReturn, years, taxBracket]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="ELSS Calculator"
            description="Calculate ELSS returns and tax savings"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Maturity Value</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.futureValue)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Investment</span>
                            <p className="text-lg font-semibold text-blue-600">{formatCurrency(result.totalInvestment)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Returns</span>
                            <p className="text-lg font-semibold text-emerald-600">{formatCurrency(result.returns)}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">Tax Benefits (80C)</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-slate-500">Yearly Savings</span>
                                <p className="text-lg font-semibold text-emerald-600">{formatCurrency(result.yearlyTaxSavings)}</p>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500">Total Savings</span>
                                <p className="text-lg font-semibold text-emerald-600">{formatCurrency(result.totalTaxSavings)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly SIP</label>
                <input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} min={500}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={500} max={50000} step={500} value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Return (%)</label>
                    <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} min={5} max={20}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Years (Min 3)</label>
                    <input type="number" value={years} onChange={(e) => setYears(Math.max(3, Number(e.target.value)))} min={3} max={30}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tax Bracket (%)</label>
                <div className="grid grid-cols-3 gap-2">
                    {[5, 20, 30].map((rate) => (
                        <button key={rate} onClick={() => setTaxBracket(rate)} className={`py-2 px-3 rounded-lg font-medium ${taxBracket === rate ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            {rate}%
                        </button>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
