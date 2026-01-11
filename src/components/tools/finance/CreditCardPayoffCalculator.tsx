'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { CreditCard, DollarSign, Minus } from 'lucide-react';

export default function CreditCardPayoffCalculator() {
    const [balance, setBalance] = useState(50000);
    const [interestRate, setInterestRate] = useState(36);
    const [minPaymentPct, setMinPaymentPct] = useState(5);
    const [extraPayment, setExtraPayment] = useState(0);

    const result = useMemo(() => {
        const monthlyRate = interestRate / 100 / 12;
        let remaining = balance;
        let totalInterest = 0;
        let months = 0;
        const maxMonths = 600;

        const minPayment = Math.max(balance * minPaymentPct / 100, 200);
        const actualPayment = minPayment + extraPayment;

        while (remaining > 0 && months < maxMonths) {
            const interest = remaining * monthlyRate;
            totalInterest += interest;
            const principal = actualPayment - interest;

            if (principal <= 0) break;

            remaining = Math.max(0, remaining - principal);
            months++;
        }

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        const totalPayment = balance + totalInterest;

        return {
            months,
            years,
            remainingMonths,
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(totalPayment),
            payableMonths: months < maxMonths
        };
    }, [balance, interestRate, minPaymentPct, extraPayment]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Credit Card Payoff"
            description="Calculate how long to pay off credit card debt"
            category="Debt"
            results={
                <div className="space-y-6">
                    {result.payableMonths ? (
                        <>
                            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                                <p className="text-sm text-slate-500 mb-1">Debt Free In</p>
                                <p className="text-4xl font-bold text-emerald-600">
                                    {result.years}y {result.remainingMonths}m
                                </p>
                                <p className="text-sm text-slate-500 mt-1">{result.months} months total</p>
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
                        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                            <p className="text-red-600 font-semibold">Payment too low!</p>
                            <p className="text-sm text-slate-600 mt-1">Increase payment to pay off debt</p>
                        </div>
                    )}
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Credit Card Balance</label>
                <input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} min={1000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={5000} max={500000} step={1000} value={balance} onChange={(e) => setBalance(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Interest Rate (% p.a.)</label>
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} min={12} max={48}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Extra Monthly Payment</label>
                <input type="number" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={50000} step={500} value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
