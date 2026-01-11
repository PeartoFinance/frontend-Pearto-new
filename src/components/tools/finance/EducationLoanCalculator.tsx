'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, GraduationCap, Clock } from 'lucide-react';

export default function EducationLoanCalculator() {
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(84); // months
    const [moratorium, setMoratorium] = useState(12); // grace period

    const result = useMemo(() => {
        const monthlyRate = interestRate / 100 / 12;
        const repaymentMonths = tenure - moratorium;

        // Interest during moratorium
        const moratoriumInterest = loanAmount * monthlyRate * moratorium;
        const principalWithMoratoriumInterest = loanAmount + moratoriumInterest;

        // EMI calculation
        const emi = principalWithMoratoriumInterest * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths) / (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
        const totalPayment = emi * repaymentMonths;
        const totalInterest = totalPayment - loanAmount;

        return {
            emi: Math.round(emi),
            moratoriumInterest: Math.round(moratoriumInterest),
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(totalPayment),
            repaymentMonths
        };
    }, [loanAmount, interestRate, tenure, moratorium]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Education Loan Calculator"
            description="Calculate education loan EMI with moratorium period"
            category="Education"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <GraduationCap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 mb-1">Monthly EMI</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.emi)}</p>
                        <p className="text-sm text-slate-500 mt-1">for {result.repaymentMonths} months</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Moratorium Interest</span>
                            <p className="text-lg font-semibold text-amber-600">{formatCurrency(result.moratoriumInterest)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Interest</span>
                            <p className="text-lg font-semibold">{formatCurrency(result.totalInterest)}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400">
                        ✓ Interest paid on education loans is tax deductible under Section 80E
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Loan Amount</label>
                <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} min={100000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={100000} max={5000000} step={50000} value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rate (%)</label>
                    <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} min={5} max={15} step={0.1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tenure (Months)</label>
                    <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} min={24} max={180}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Moratorium Period: {moratorium} months</label>
                <input type="range" min={0} max={24} value={moratorium} onChange={(e) => setMoratorium(Number(e.target.value))} className="w-full accent-emerald-500" />
                <p className="text-xs text-slate-400 mt-1">Grace period before EMI starts</p>
            </div>
        </CalculatorLayout>
    );
}
