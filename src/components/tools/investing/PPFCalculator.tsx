'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import VendorList from '@/components/vendors/VendorList';

export default function PPFCalculator() {
    const [yearlyDeposit, setYearlyDeposit] = useState(150000);
    const [interestRate, setInterestRate] = useState(7.1);
    const [tenure, setTenure] = useState(15);

    const result = useMemo(() => {
        let balance = 0;
        const totalDeposit = yearlyDeposit * tenure;
        const r = interestRate / 100;

        for (let year = 1; year <= tenure; year++) {
            balance = (balance + yearlyDeposit) * (1 + r);
        }

        const totalInterest = balance - totalDeposit;

        return {
            maturityValue: Math.round(balance),
            totalDeposit: Math.round(totalDeposit),
            totalInterest: Math.round(totalInterest),
            effectiveReturn: Math.round(((balance / totalDeposit) - 1) * 100 * 10) / 10
        };
    }, [yearlyDeposit, interestRate, tenure]);



    return (
        <CalculatorLayout
            title="PPF Calculator"
            description="Calculate Public Provident Fund maturity amount"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Maturity Value</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            <PriceDisplay amount={result.maturityValue} />
                        </p>
                        <p className="text-sm text-emerald-500 mt-1">Tax-free returns</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Deposit</span>
                            <p className="text-lg font-semibold text-blue-600">
                                <PriceDisplay amount={result.totalDeposit} />
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Interest</span>
                            <p className="text-lg font-semibold text-emerald-600">
                                <PriceDisplay amount={result.totalInterest} />
                            </p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                        <span className="text-slate-500">Effective Return</span>
                        <span className="font-semibold text-emerald-600">+{result.effectiveReturn}%</span>
                    </div>
                </div>
            }
            rightColumn={
                <VendorList
                    category="Tax Services"
                    title="PPF Specialists"
                    description="Get help with PPF accounts"
                />
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Yearly Deposit (Max ₹1.5L)</label>
                <input type="number" value={yearlyDeposit} onChange={(e) => setYearlyDeposit(Math.min(Number(e.target.value), 150000))} min={500} max={150000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={500} max={150000} step={1000} value={yearlyDeposit} onChange={(e) => setYearlyDeposit(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Interest Rate (%)</label>
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} min={5} max={12} step={0.1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-slate-400 mt-1">Current rate: 7.1% (as of 2024)</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tenure (Years)</label>
                <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} min={15} max={50}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-slate-400 mt-1">Minimum tenure: 15 years (can extend in 5-year blocks)</p>
            </div>
        </CalculatorLayout>
    );
}
