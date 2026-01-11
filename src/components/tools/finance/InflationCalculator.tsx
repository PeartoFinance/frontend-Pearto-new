'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';

export default function InflationCalculator() {
    const [currentAmount, setCurrentAmount] = useState(100000);
    const [inflationRate, setInflationRate] = useState(6);
    const [years, setYears] = useState(10);

    const result = useMemo(() => {
        const futureValue = currentAmount * Math.pow(1 + inflationRate / 100, years);
        const purchasingPowerLoss = currentAmount - (currentAmount / Math.pow(1 + inflationRate / 100, years));
        const realValue = currentAmount / Math.pow(1 + inflationRate / 100, years);
        const lossPct = ((currentAmount - realValue) / currentAmount) * 100;

        return {
            futureValue: Math.round(futureValue),
            purchasingPowerLoss: Math.round(purchasingPowerLoss),
            realValue: Math.round(realValue),
            lossPct: Math.round(lossPct)
        };
    }, [currentAmount, inflationRate, years]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Inflation Calculator"
            description="See how inflation erodes your money's value over time"
            category="Personal Finance"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Real Value After {years} Years</p>
                        <p className="text-4xl font-bold text-red-600">{formatCurrency(result.realValue)}</p>
                        <p className="text-sm text-red-500 mt-1">-{result.lossPct}% purchasing power</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <span className="font-medium text-amber-700 dark:text-amber-400">What this means</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            You'll need {formatCurrency(result.futureValue)} in {years} years to buy what {formatCurrency(currentAmount)} buys today.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex h-6 rounded-full overflow-hidden">
                            <div className="bg-emerald-500" style={{ width: `${100 - result.lossPct}%` }} />
                            <div className="bg-red-400" style={{ width: `${result.lossPct}%` }} />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>Retained Value</span>
                            <span>Lost to Inflation</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Amount</label>
                <input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(Number(e.target.value))} min={1000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={10000} max={10000000} step={10000} value={currentAmount} onChange={(e) => setCurrentAmount(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Inflation Rate (% p.a.)</label>
                <input type="number" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} min={1} max={20} step={0.5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1} max={15} step={0.5} value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time Period (Years)</label>
                <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} min={1} max={50}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1} max={30} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
