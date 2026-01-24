'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Home, DollarSign, TrendingUp, Calculator } from 'lucide-react';

export default function DownPaymentCalculator() {
    const [homePrice, setHomePrice] = useState(400000);
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [interestRate, setInterestRate] = useState(7);
    const [loanTerm, setLoanTerm] = useState(30);
    const [monthlyIncome, setMonthlyIncome] = useState(8000);

    const results = useMemo(() => {
        const downPayment = homePrice * (downPaymentPercent / 100);
        const loanAmount = homePrice - downPayment;

        // Monthly mortgage calculation
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTerm * 12;
        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
            / (Math.pow(1 + monthlyRate, numPayments) - 1);

        // PMI (if down payment < 20%)
        const pmi = downPaymentPercent < 20 ? loanAmount * 0.005 / 12 : 0;

        // Estimated property tax and insurance
        const propertyTax = homePrice * 0.012 / 12;
        const homeInsurance = homePrice * 0.003 / 12;

        const totalMonthly = monthlyPayment + pmi + propertyTax + homeInsurance;
        const dti = (totalMonthly / monthlyIncome) * 100;
        const totalInterest = (monthlyPayment * numPayments) - loanAmount;

        return {
            downPayment,
            loanAmount,
            monthlyPayment,
            pmi,
            propertyTax,
            homeInsurance,
            totalMonthly,
            dti,
            totalInterest,
            needsPMI: downPaymentPercent < 20
        };
    }, [homePrice, downPaymentPercent, interestRate, loanTerm, monthlyIncome]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

    return (
        <CalculatorLayout
            title="Down Payment Calculator"
            description="Calculate down payment and monthly mortgage costs"
            category="Real Estate"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                        <Home className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Down Payment Required</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(results.downPayment)}</p>
                        <p className="text-sm text-slate-500 mt-1">{downPaymentPercent}% of {formatCurrency(homePrice)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Loan Amount</p>
                            <p className="text-xl font-bold text-blue-600">{formatCurrency(results.loanAmount)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Monthly Payment</p>
                            <p className="text-xl font-bold text-purple-600">{formatCurrency(results.totalMonthly)}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Monthly Breakdown
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Principal & Interest</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {formatCurrency(results.monthlyPayment)}
                                </span>
                            </div>
                            {results.needsPMI && (
                                <div className="flex justify-between text-amber-600">
                                    <span>PMI (less than 20% down)</span>
                                    <span>{formatCurrency(results.pmi)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-500">Property Tax (est.)</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {formatCurrency(results.propertyTax)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Home Insurance (est.)</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {formatCurrency(results.homeInsurance)}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Total Monthly</span>
                                <span className="font-bold text-emerald-600">{formatCurrency(results.totalMonthly)}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl ${results.dti <= 28 ? 'bg-emerald-50 dark:bg-emerald-900/20' : results.dti <= 36 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Debt-to-Income Ratio: {results.dti.toFixed(1)}%
                        </p>
                        <p className={`text-xs ${results.dti <= 28 ? 'text-emerald-600' : results.dti <= 36 ? 'text-amber-600' : 'text-red-600'}`}>
                            {results.dti <= 28 ? '✓ Excellent - comfortable affordability' :
                                results.dti <= 36 ? '⚠ Acceptable but stretched' :
                                    '✗ High - may be over budget'}
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Home Price ($)
                    </label>
                    <input
                        type="number"
                        value={homePrice}
                        onChange={(e) => setHomePrice(Number(e.target.value))}
                        step={10000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Down Payment: {downPaymentPercent}%
                    </label>
                    <input
                        type="range"
                        min={3}
                        max={50}
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>3%</span>
                        <span className={downPaymentPercent < 20 ? 'text-amber-500' : 'text-emerald-500'}>
                            {downPaymentPercent < 20 ? 'PMI required' : 'No PMI ✓'}
                        </span>
                        <span>50%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Interest Rate (%)
                        </label>
                        <input
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            step={0.125}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Loan Term
                        </label>
                        <select
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value={15}>15 years</option>
                            <option value={20}>20 years</option>
                            <option value={30}>30 years</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Monthly Income ($)
                    </label>
                    <input
                        type="number"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>
            </div>
        </CalculatorLayout>
    );
}
