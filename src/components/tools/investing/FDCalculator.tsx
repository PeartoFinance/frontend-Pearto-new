'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { TrendingUp, Percent, DollarSign } from 'lucide-react';

export default function FDCalculator() {
    const [principal, setPrincipal] = useState(100000);
    const [interestRate, setInterestRate] = useState(7.0);
    const [tenure, setTenure] = useState(12);
    const [compounding, setCompounding] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');

    const result = useMemo(() => {
        const compoundFreq = { monthly: 12, quarterly: 4, yearly: 1 }[compounding];
        const r = interestRate / 100 / compoundFreq;
        const n = (tenure / 12) * compoundFreq;
        const maturityValue = principal * Math.pow(1 + r, n);
        const totalInterest = maturityValue - principal;
        const effectiveRate = ((maturityValue / principal) - 1) * (12 / tenure) * 100;

        return {
            maturityValue: Math.round(maturityValue),
            totalInterest: Math.round(totalInterest),
            effectiveRate: Math.round(effectiveRate * 100) / 100
        };
    }, [principal, interestRate, tenure, compounding]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="FD Calculator"
            description="Calculate Fixed Deposit maturity amount and interest"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Maturity Value</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.maturityValue)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Principal</span>
                            <p className="text-lg font-semibold">{formatCurrency(principal)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Interest Earned</span>
                            <p className="text-lg font-semibold text-emerald-600">{formatCurrency(result.totalInterest)}</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Principal Amount</label>
                <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} min={1000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={10000} max={10000000} step={10000} value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Interest Rate (% p.a.)</label>
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} min={1} max={15} step={0.1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tenure (Months)</label>
                <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} min={1} max={120}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1} max={60} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Compounding</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['monthly', 'quarterly', 'yearly'] as const).map((c) => (
                        <button key={c} onClick={() => setCompounding(c)} className={`py-2 px-3 rounded-lg text-sm font-medium ${compounding === c ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
