'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, FileText, Calculator } from 'lucide-react';

interface TaxResult {
    taxableIncome: number;
    taxPayable: number;
    effectiveRate: number;
    netIncome: number;
}

export default function IncomeTaxCalculator() {
    const [annualIncome, setAnnualIncome] = useState(1000000);
    const [deductions, setDeductions] = useState(150000);
    const [regime, setRegime] = useState<'old' | 'new'>('new');

    const result = useMemo<TaxResult>(() => {
        const taxableIncome = Math.max(0, annualIncome - (regime === 'old' ? deductions : 50000));
        let taxPayable = 0;

        if (regime === 'new') {
            // New Tax Regime (2024-25)
            if (taxableIncome > 1500000) taxPayable += (taxableIncome - 1500000) * 0.30;
            if (taxableIncome > 1200000) taxPayable += Math.min(taxableIncome - 1200000, 300000) * 0.20;
            if (taxableIncome > 900000) taxPayable += Math.min(taxableIncome - 900000, 300000) * 0.15;
            if (taxableIncome > 600000) taxPayable += Math.min(taxableIncome - 600000, 300000) * 0.10;
            if (taxableIncome > 300000) taxPayable += Math.min(taxableIncome - 300000, 300000) * 0.05;
        } else {
            // Old Tax Regime
            if (taxableIncome > 1000000) taxPayable += (taxableIncome - 1000000) * 0.30;
            if (taxableIncome > 500000) taxPayable += Math.min(taxableIncome - 500000, 500000) * 0.20;
            if (taxableIncome > 250000) taxPayable += Math.min(taxableIncome - 250000, 250000) * 0.05;
        }

        // Add cess
        taxPayable += taxPayable * 0.04;
        const effectiveRate = annualIncome > 0 ? (taxPayable / annualIncome) * 100 : 0;
        const netIncome = annualIncome - taxPayable;

        return {
            taxableIncome: Math.round(taxableIncome),
            taxPayable: Math.round(taxPayable),
            effectiveRate: Math.round(effectiveRate * 100) / 100,
            netIncome: Math.round(netIncome)
        };
    }, [annualIncome, deductions, regime]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Income Tax Calculator"
            description="Calculate your income tax under old and new regime"
            category="Taxation"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Tax Payable</p>
                        <p className="text-4xl font-bold text-red-600">{formatCurrency(result.taxPayable)}</p>
                        <p className="text-sm text-slate-500 mt-1">Effective Rate: {result.effectiveRate}%</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Taxable Income</span>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(result.taxableIncome)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Net Income</span>
                            <p className="text-lg font-semibold text-emerald-600">{formatCurrency(result.netIncome)}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex h-6 rounded-full overflow-hidden">
                            <div className="bg-emerald-500" style={{ width: `${100 - result.effectiveRate}%` }} />
                            <div className="bg-red-400" style={{ width: `${result.effectiveRate}%` }} />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>Take Home</span>
                            <span>Tax</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tax Regime</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setRegime('new')} className={`py-3 px-4 rounded-lg font-medium transition ${regime === 'new' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        New Regime
                    </button>
                    <button onClick={() => setRegime('old')} className={`py-3 px-4 rounded-lg font-medium transition ${regime === 'old' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        Old Regime
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Annual Income</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))} min={0}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <input type="range" min={0} max={5000000} step={50000} value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {regime === 'old' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Deductions (80C, 80D, etc.)</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="number" value={deductions} onChange={(e) => setDeductions(Number(e.target.value))} min={0} max={500000}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <input type="range" min={0} max={500000} step={10000} value={deductions} onChange={(e) => setDeductions(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
                </div>
            )}
        </CalculatorLayout>
    );
}
