'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Users, Shield } from 'lucide-react';

interface LifeInsuranceResult {
    incomeReplacement: number;
    liabilities: number;
    childrenExpenses: number;
    totalCoverage: number;
    existingGap: number;
}

export default function LifeInsuranceCalculator() {
    const [annualIncome, setAnnualIncome] = useState(1200000);
    const [yearsToReplace, setYearsToReplace] = useState(15);
    const [outstandingLoans, setOutstandingLoans] = useState(2000000);
    const [childrenEducation, setChildrenEducation] = useState(2500000);
    const [existingCover, setExistingCover] = useState(500000);

    const result = useMemo<LifeInsuranceResult>(() => {
        const incomeReplacement = annualIncome * yearsToReplace;
        const liabilities = outstandingLoans;
        const childrenExpenses = childrenEducation;
        const totalCoverage = incomeReplacement + liabilities + childrenExpenses;
        const existingGap = Math.max(0, totalCoverage - existingCover);

        return { incomeReplacement, liabilities, childrenExpenses, totalCoverage, existingGap };
    }, [annualIncome, yearsToReplace, outstandingLoans, childrenEducation, existingCover]);

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Life Insurance Calculator"
            description="Calculate how much life insurance coverage you need"
            category="Insurance"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Coverage Gap</p>
                        <p className="text-4xl font-bold text-purple-600">{formatCurrency(result.existingGap)}</p>
                        <p className="text-sm text-slate-500 mt-2">Total Need: {formatCurrency(result.totalCoverage)}</p>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                            <span className="text-slate-500">Income Replacement</span>
                            <span className="font-semibold">{formatCurrency(result.incomeReplacement)}</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                            <span className="text-slate-500">Outstanding Loans</span>
                            <span className="font-semibold">{formatCurrency(result.liabilities)}</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                            <span className="text-slate-500">Children's Education</span>
                            <span className="font-semibold">{formatCurrency(result.childrenExpenses)}</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                            <span className="text-slate-500">Existing Cover</span>
                            <span className="font-semibold text-emerald-600">-{formatCurrency(existingCover)}</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Annual Income</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                </div>
                <input type="range" min={200000} max={5000000} step={50000} value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Years of Income Replacement</label>
                <input type="number" value={yearsToReplace} onChange={(e) => setYearsToReplace(Number(e.target.value))} min={5} max={30}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={5} max={30} value={yearsToReplace} onChange={(e) => setYearsToReplace(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Outstanding Loans</label>
                <input type="number" value={outstandingLoans} onChange={(e) => setOutstandingLoans(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Children's Education Fund</label>
                <input type="number" value={childrenEducation} onChange={(e) => setChildrenEducation(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Existing Coverage</label>
                <input type="number" value={existingCover} onChange={(e) => setExistingCover(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
