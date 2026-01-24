'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { CreditCard, DollarSign, TrendingDown, Calendar } from 'lucide-react';

export default function DebtPayoffCalculator() {
    const [balance, setBalance] = useState(5000);
    const [interestRate, setInterestRate] = useState(18);
    const [monthlyPayment, setMonthlyPayment] = useState(200);

    const results = useMemo(() => {
        const monthlyRate = interestRate / 100 / 12;

        // Calculate months to pay off
        if (monthlyPayment <= balance * monthlyRate) {
            return {
                monthsToPayoff: Infinity,
                totalInterest: Infinity,
                totalPayment: Infinity,
                payoffDate: null,
                minimumPayment: balance * monthlyRate * 1.1,
                canPayoff: false
            };
        }

        const monthsToPayoff = -Math.log(1 - (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate);
        const totalPayment = monthlyPayment * monthsToPayoff;
        const totalInterest = totalPayment - balance;

        // Payoff date
        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + Math.ceil(monthsToPayoff));

        const minimumPayment = balance * monthlyRate * 1.1;

        return {
            monthsToPayoff: Math.ceil(monthsToPayoff),
            totalInterest,
            totalPayment,
            payoffDate,
            minimumPayment,
            canPayoff: true
        };
    }, [balance, interestRate, monthlyPayment]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

    return (
        <CalculatorLayout
            title="Debt Payoff Calculator"
            description="Calculate how long to pay off debt and total interest"
            category="Debt"
            results={
                <div className="space-y-4">
                    {results.canPayoff ? (
                        <>
                            <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                                <Calendar className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">Time to Debt Freedom</p>
                                <p className="text-4xl font-bold text-emerald-600">
                                    {Math.floor(results.monthsToPayoff / 12)}y {results.monthsToPayoff % 12}m
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                    ({results.monthsToPayoff} months)
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 mb-1">Total Interest</p>
                                    <p className="text-xl font-bold text-red-500">{formatCurrency(results.totalInterest)}</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 mb-1">Total Payment</p>
                                    <p className="text-xl font-bold text-blue-600">{formatCurrency(results.totalPayment)}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Payoff Timeline
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Starting Balance</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                            {formatCurrency(balance)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Interest Rate</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                            {interestRate}% APR
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Monthly Payment</span>
                                        <span className="font-medium text-emerald-600">
                                            {formatCurrency(monthlyPayment)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">Debt Free Date</span>
                                        <span className="font-bold text-emerald-600">
                                            {results.payoffDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                            <CreditCard className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <p className="text-lg font-bold text-red-600 mb-2">Payment Too Low</p>
                            <p className="text-sm text-red-600">
                                Your payment doesn't cover the monthly interest.
                                Minimum payment needed: {formatCurrency(results.minimumPayment)}
                            </p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Current Balance ($)
                    </label>
                    <input
                        type="number"
                        value={balance}
                        onChange={(e) => setBalance(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Interest Rate (APR %): {interestRate}%
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={30}
                        step={0.5}
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Monthly Payment ($)
                    </label>
                    <input
                        type="number"
                        value={monthlyPayment}
                        onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                        Min payment to make progress: {formatCurrency(balance * interestRate / 100 / 12)}
                    </p>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">
                        💡 Tip: Pay More!
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">
                        Adding just $50/month could save you thousands in interest and months of payments.
                    </p>
                </div>
            </div>
        </CalculatorLayout>
    );
}
