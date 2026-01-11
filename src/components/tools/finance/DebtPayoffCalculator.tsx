'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, CreditCard, Calendar } from 'lucide-react';

export default function DebtPayoffCalculator() {
    const [totalDebt, setTotalDebt] = useState(500000);
    const [interestRate, setInterestRate] = useState(12);
    const [monthlyPayment, setMonthlyPayment] = useState(15000);

    const result = useMemo(() => {
        const monthlyRate = interestRate / 100 / 12;
        let balance = totalDebt;
        let totalInterest = 0;
        let months = 0;
        const maxMonths = 600;

        while (balance > 0 && months < maxMonths) {
            const interestCharge = balance * monthlyRate;
            totalInterest += interestCharge;
            const principalPayment = monthlyPayment - interestCharge;

            if (principalPayment <= 0) break; // Can't pay off

            balance -= principalPayment;
            months++;
        }

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        const totalPayment = monthlyPayment * months;

        return {
            months,
            years,
            remainingMonths,
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(totalPayment),
            payoffPossible: months < maxMonths
        };
    }, [totalDebt, interestRate, monthlyPayment]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Debt Payoff Calculator"
            description="Calculate time to become debt-free"
            category="Debt"
            results={
                <div className="space-y-6">
                    {result.payoffPossible ? (
                        <>
                            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                                <p className="text-sm text-slate-500 mb-1">Debt Freedom In</p>
                                <p className="text-4xl font-bold text-emerald-600">
                                    {result.years}y {result.remainingMonths}m
                                </p>
                                <p className="text-sm text-slate-500 mt-1">{result.months} total months</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                    <span className="text-xs text-slate-500">Total Interest</span>
                                    <p className="text-lg font-semibold text-red-600">{formatCurrency(result.totalInterest)}</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                    <span className="text-xs text-slate-500">Total Payment</span>
                                    <p className="text-lg font-semibold">{formatCurrency(result.totalPayment)}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <p className="text-red-600 font-semibold">Payment too low!</p>
                            <p className="text-sm text-slate-600">Increase monthly payment to pay off debt</p>
                        </div>
                    )}
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Debt</label>
                <input type="number" value={totalDebt} onChange={(e) => setTotalDebt(Number(e.target.value))} min={1000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={10000} max={5000000} step={10000} value={totalDebt} onChange={(e) => setTotalDebt(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Interest Rate (% p.a.)</label>
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} min={1} max={36} step={0.5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly Payment</label>
                <input type="number" value={monthlyPayment} onChange={(e) => setMonthlyPayment(Number(e.target.value))} min={1000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1000} max={100000} step={1000} value={monthlyPayment} onChange={(e) => setMonthlyPayment(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
