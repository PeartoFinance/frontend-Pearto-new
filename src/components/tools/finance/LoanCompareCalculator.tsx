'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Calculator, CreditCard } from 'lucide-react';

export default function LoanCompareCalculator() {
    const [loanAmount, setLoanAmount] = useState(3000000);
    const [loan1Rate, setLoan1Rate] = useState(8.5);
    const [loan2Rate, setLoan2Rate] = useState(9.0);
    const [tenure, setTenure] = useState(240); // months

    const calculateEMI = (principal: number, rate: number, months: number) => {
        const monthlyRate = rate / 100 / 12;
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalPayment = emi * months;
        const totalInterest = totalPayment - principal;
        return { emi: Math.round(emi), totalPayment: Math.round(totalPayment), totalInterest: Math.round(totalInterest) };
    };

    const result = useMemo(() => {
        const loan1 = calculateEMI(loanAmount, loan1Rate, tenure);
        const loan2 = calculateEMI(loanAmount, loan2Rate, tenure);
        const savings = loan2.totalPayment - loan1.totalPayment;
        const betterOption = loan1.totalPayment < loan2.totalPayment ? 1 : 2;

        return { loan1, loan2, savings: Math.abs(savings), betterOption };
    }, [loanAmount, loan1Rate, loan2Rate, tenure]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Loan Comparison"
            description="Compare two loan offers to find the best deal"
            category="Finance & Loans"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-slate-500 mb-1">You Save with Loan {result.betterOption}</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.savings)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl ${result.betterOption === 1 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-400' : 'bg-white dark:bg-slate-800'}`}>
                            <span className="text-xs text-slate-500">Loan 1 ({loan1Rate}%)</span>
                            <p className="text-lg font-semibold">{formatCurrency(result.loan1.emi)}/mo</p>
                            <p className="text-xs text-slate-500">Total: {formatCurrency(result.loan1.totalPayment)}</p>
                            {result.betterOption === 1 && <p className="text-xs text-emerald-600 mt-1">✓ Best Option</p>}
                        </div>
                        <div className={`p-4 rounded-xl ${result.betterOption === 2 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-400' : 'bg-white dark:bg-slate-800'}`}>
                            <span className="text-xs text-slate-500">Loan 2 ({loan2Rate}%)</span>
                            <p className="text-lg font-semibold">{formatCurrency(result.loan2.emi)}/mo</p>
                            <p className="text-xs text-slate-500">Total: {formatCurrency(result.loan2.totalPayment)}</p>
                            {result.betterOption === 2 && <p className="text-xs text-emerald-600 mt-1">✓ Best Option</p>}
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Loan Amount</label>
                <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} min={100000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Loan 1 Rate (%)</label>
                    <input type="number" value={loan1Rate} onChange={(e) => setLoan1Rate(Number(e.target.value))} min={5} max={20} step={0.1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Loan 2 Rate (%)</label>
                    <input type="number" value={loan2Rate} onChange={(e) => setLoan2Rate(Number(e.target.value))} min={5} max={20} step={0.1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tenure (Months)</label>
                <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} min={12} max={360}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={12} max={360} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
