'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { IndianRupee, Percent, Calendar, CreditCard } from 'lucide-react';

interface EMIResult {
    emi: number;
    totalInterest: number;
    totalPayment: number;
    schedule: { month: number; principal: number; interest: number; balance: number }[];
}

export default function EMICalculator() {
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(10);
    const [tenure, setTenure] = useState(20);

    const result = useMemo<EMIResult>(() => {
        const P = loanAmount;
        const r = interestRate / 100 / 12; // Monthly rate
        const n = tenure * 12; // Total months

        // EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
        const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - P;

        // Generate amortization schedule (first 12 months)
        const schedule = [];
        let balance = P;
        for (let month = 1; month <= Math.min(n, 12); month++) {
            const interestPayment = balance * r;
            const principalPayment = emi - interestPayment;
            balance -= principalPayment;
            schedule.push({
                month,
                principal: Math.round(principalPayment),
                interest: Math.round(interestPayment),
                balance: Math.max(0, Math.round(balance))
            });
        }

        return {
            emi: Math.round(emi),
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(totalPayment),
            schedule
        };
    }, [loanAmount, interestRate, tenure]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Loan EMI Calculator"
            description="Calculate monthly loan payments and view amortization schedule"
            category="Finance & Loans"
            results={
                <div className="space-y-6">
                    {/* EMI Result */}
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Monthly EMI</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            {formatCurrency(result.emi)}
                        </p>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Principal</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {formatCurrency(loanAmount)}
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Total Interest</p>
                            <p className="text-lg font-semibold text-rose-600">
                                {formatCurrency(result.totalInterest)}
                            </p>
                        </div>
                    </div>

                    {/* Total Payment */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Total Payment</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                {formatCurrency(result.totalPayment)}
                            </span>
                        </div>
                        <div className="mt-3 flex h-4 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-500"
                                style={{ width: `${(loanAmount / result.totalPayment) * 100}%` }}
                            />
                            <div
                                className="bg-rose-500"
                                style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-slate-500">
                            <span>Principal ({Math.round((loanAmount / result.totalPayment) * 100)}%)</span>
                            <span>Interest ({Math.round((result.totalInterest / result.totalPayment) * 100)}%)</span>
                        </div>
                    </div>

                    {/* Schedule Preview */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            First Year Schedule
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto text-xs">
                            {result.schedule.map(row => (
                                <div key={row.month} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-slate-500">Month {row.month}</span>
                                    <span className="text-blue-600">P: {formatCurrency(row.principal)}</span>
                                    <span className="text-rose-600">I: {formatCurrency(row.interest)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            {/* Loan Amount */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Loan Amount
                </label>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        min={10000}
                        max={100000000}
                        step={10000}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input
                    type="range"
                    min={100000}
                    max={10000000}
                    step={100000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                />
            </div>

            {/* Interest Rate */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Interest Rate (% p.a.)
                </label>
                <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        min={1}
                        max={30}
                        step={0.25}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input
                    type="range"
                    min={5}
                    max={20}
                    step={0.25}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                />
            </div>

            {/* Loan Tenure */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Loan Tenure (Years)
                </label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        min={1}
                        max={30}
                        step={1}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                />
            </div>
        </CalculatorLayout>
    );
}
