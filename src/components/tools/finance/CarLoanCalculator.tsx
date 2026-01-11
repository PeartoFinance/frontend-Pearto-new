'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Car, Calendar } from 'lucide-react';

export default function CarLoanCalculator() {
    const [carPrice, setCarPrice] = useState(800000);
    const [downPayment, setDownPayment] = useState(200000);
    const [interestRate, setInterestRate] = useState(9.5);
    const [tenure, setTenure] = useState(60);

    const result = useMemo(() => {
        const loanAmount = carPrice - downPayment;
        const monthlyRate = interestRate / 100 / 12;
        const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
        const totalPayment = emi * tenure;
        const totalInterest = totalPayment - loanAmount;

        return {
            loanAmount: Math.round(loanAmount),
            emi: Math.round(emi),
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest)
        };
    }, [carPrice, downPayment, interestRate, tenure]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Car Loan Calculator"
            description="Calculate your car loan EMI and total cost"
            category="Finance & Loans"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Monthly EMI</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.emi)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Loan Amount</span>
                            <p className="text-lg font-semibold">{formatCurrency(result.loanAmount)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Interest</span>
                            <p className="text-lg font-semibold text-amber-600">{formatCurrency(result.totalInterest)}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                        <span className="text-slate-500">Total Cost of Car</span>
                        <span className="font-semibold">{formatCurrency(downPayment + result.totalPayment)}</span>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Car Price</label>
                <input type="number" value={carPrice} onChange={(e) => setCarPrice(Number(e.target.value))} min={100000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={200000} max={5000000} step={50000} value={carPrice} onChange={(e) => setCarPrice(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Down Payment ({Math.round((downPayment / carPrice) * 100)}%)</label>
                <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} min={0} max={carPrice}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={carPrice * 0.5} step={10000} value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rate (%)</label>
                    <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} min={5} max={20} step={0.1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Months</label>
                    <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} min={12} max={84}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
