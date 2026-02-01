'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function EPFCalculator() {
    const [basicSalary, setBasicSalary] = useState(50000);
    const [currentAge, setCurrentAge] = useState(25);
    const [retirementAge, setRetirementAge] = useState(58);
    const [existingBalance, setExistingBalance] = useState(100000);
    const [epfRate, setEpfRate] = useState(8.25);

    const result = useMemo(() => {
        const yearsToRetirement = retirementAge - currentAge;
        const monthlyContribution = basicSalary * 0.24; // 12% employee + 12% employer (8.33% EPS goes separately)
        const yearlyContribution = monthlyContribution * 12;
        const r = epfRate / 100;

        let balance = existingBalance;
        const totalContribution = yearlyContribution * yearsToRetirement;

        // Monthly compounding approximation
        for (let year = 1; year <= yearsToRetirement; year++) {
            balance = (balance + yearlyContribution) * (1 + r);
        }

        const totalInterest = balance - existingBalance - totalContribution;

        return {
            maturityValue: Math.round(balance),
            totalContribution: Math.round(totalContribution + existingBalance),
            totalInterest: Math.round(totalInterest),
            monthlyContribution: Math.round(monthlyContribution)
        };
    }, [basicSalary, currentAge, retirementAge, existingBalance, epfRate]);



    return (
        <CalculatorLayout
            title="EPF Calculator"
            description="Calculate your Employee Provident Fund corpus at retirement"
            category="Retirement"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">EPF Corpus at {retirementAge}</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            <PriceDisplay amount={result.maturityValue} />
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Monthly Contribution</span>
                            <p className="text-lg font-semibold"><PriceDisplay amount={result.monthlyContribution} /></p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Interest Earned</span>
                            <p className="text-lg font-semibold text-emerald-600">
                                <PriceDisplay amount={result.totalInterest} />
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Basic Salary (Monthly)</label>
                <input type="number" value={basicSalary} onChange={(e) => setBasicSalary(Number(e.target.value))} min={15000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={15000} max={200000} step={5000} value={basicSalary} onChange={(e) => setBasicSalary(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Age</label>
                    <input type="number" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))} min={18} max={55}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Retirement Age</label>
                    <input type="number" value={retirementAge} onChange={(e) => setRetirementAge(Number(e.target.value))} min={currentAge + 1} max={60}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current EPF Balance</label>
                <input type="number" value={existingBalance} onChange={(e) => setExistingBalance(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
