'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Building2, Percent, DollarSign } from 'lucide-react';

export default function HRACalculator() {
    const [basicSalary, setBasicSalary] = useState(50000);
    const [receivedHRA, setReceivedHRA] = useState(20000);
    const [rentPaid, setRentPaid] = useState(25000);
    const [isMetro, setIsMetro] = useState(true);

    const result = useMemo(() => {
        const yearlyBasic = basicSalary * 12;
        const yearlyHRA = receivedHRA * 12;
        const yearlyRent = rentPaid * 12;

        // Three conditions for HRA exemption
        const condition1 = yearlyHRA;
        const condition2 = yearlyRent - (0.1 * yearlyBasic);
        const condition3 = isMetro ? 0.5 * yearlyBasic : 0.4 * yearlyBasic;

        const exemption = Math.max(0, Math.min(condition1, condition2, condition3));
        const taxableHRA = yearlyHRA - exemption;
        const monthlySavings = exemption / 12;

        return {
            exemption: Math.round(exemption),
            taxableHRA: Math.round(taxableHRA),
            monthlySavings: Math.round(monthlySavings),
            condition1: Math.round(condition1),
            condition2: Math.round(Math.max(0, condition2)),
            condition3: Math.round(condition3)
        };
    }, [basicSalary, receivedHRA, rentPaid, isMetro]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="HRA Calculator"
            description="Calculate your HRA tax exemption"
            category="Taxation"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-slate-500 mb-1">Yearly HRA Exemption</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.exemption)}</p>
                        <p className="text-sm text-emerald-600 mt-1">{formatCurrency(result.monthlySavings)}/month</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Exemption Calculation (Minimum of)</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Actual HRA Received</span>
                                <span className="font-medium">{formatCurrency(result.condition1)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Rent - 10% of Basic</span>
                                <span className="font-medium">{formatCurrency(result.condition2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">{isMetro ? '50%' : '40%'} of Basic</span>
                                <span className="font-medium">{formatCurrency(result.condition3)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                        <span className="text-slate-500">Taxable HRA</span>
                        <span className="font-semibold text-amber-600">{formatCurrency(result.taxableHRA)}</span>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly Basic Salary</label>
                <input type="number" value={basicSalary} onChange={(e) => setBasicSalary(Number(e.target.value))} min={10000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">HRA Received (Monthly)</label>
                <input type="number" value={receivedHRA} onChange={(e) => setReceivedHRA(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly Rent Paid</label>
                <input type="number" value={rentPaid} onChange={(e) => setRentPaid(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City Type</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setIsMetro(true)} className={`py-3 px-4 rounded-lg font-medium ${isMetro ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        Metro (50%)
                    </button>
                    <button onClick={() => setIsMetro(false)} className={`py-3 px-4 rounded-lg font-medium ${!isMetro ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        Non-Metro (40%)
                    </button>
                </div>
            </div>
        </CalculatorLayout>
    );
}
