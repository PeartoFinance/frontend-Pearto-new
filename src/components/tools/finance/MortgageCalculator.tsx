'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Home, DollarSign, Calendar, Percent } from 'lucide-react';

interface MortgageResult {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    principalPercent: number;
}

export default function MortgageCalculator() {
    const [homePrice, setHomePrice] = useState(5000000);
    const [downPayment, setDownPayment] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTerm, setLoanTerm] = useState(20);

    const result = useMemo<MortgageResult>(() => {
        const principal = homePrice - downPayment;
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTerm * 12;

        // EMI Formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
        const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        const totalPayment = monthlyPayment * numPayments;
        const totalInterest = totalPayment - principal;
        const principalPercent = (principal / totalPayment) * 100;

        return {
            monthlyPayment: Math.round(monthlyPayment),
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest),
            principalPercent: Math.round(principalPercent)
        };
    }, [homePrice, downPayment, interestRate, loanTerm]);

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const downPaymentPercent = Math.round((downPayment / homePrice) * 100);

    return (
        <CalculatorLayout
            title="Mortgage Calculator"
            description="Calculate your home loan EMI and total payment"
            category="Real Estate"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Monthly EMI</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.monthlyPayment)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-slate-500">Total Payment</span>
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(result.totalPayment)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Percent className="w-4 h-4 text-red-500" />
                                <span className="text-xs text-slate-500">Total Interest</span>
                            </div>
                            <p className="text-lg font-semibold text-red-600">{formatCurrency(result.totalInterest)}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex h-6 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 flex items-center justify-center text-xs text-white font-medium" style={{ width: `${result.principalPercent}%` }}>
                                {result.principalPercent}%
                            </div>
                            <div className="bg-red-400 flex items-center justify-center text-xs text-white font-medium" style={{ width: `${100 - result.principalPercent}%` }}>
                                {100 - result.principalPercent}%
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>Principal</span>
                            <span>Interest</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Home Price</label>
                <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} min={500000}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <input type="range" min={500000} max={50000000} step={100000} value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Down Payment ({downPaymentPercent}%)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} min={0} max={homePrice}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <input type="range" min={0} max={homePrice * 0.5} step={50000} value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Interest (%)</label>
                    <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} min={5} max={20} step={0.1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Term (Years)</label>
                    <input type="number" value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))} min={5} max={30}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
