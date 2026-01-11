'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

export default function CAGRCalculator() {
    const [beginningValue, setBeginningValue] = useState(100000);
    const [endingValue, setEndingValue] = useState(200000);
    const [years, setYears] = useState(5);

    const result = useMemo(() => {
        const cagr = (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
        const totalReturn = ((endingValue - beginningValue) / beginningValue) * 100;
        const absoluteGain = endingValue - beginningValue;

        return {
            cagr: Math.round(cagr * 100) / 100,
            totalReturn: Math.round(totalReturn * 100) / 100,
            absoluteGain: Math.round(absoluteGain)
        };
    }, [beginningValue, endingValue, years]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const isPositive = result.cagr >= 0;

    return (
        <CalculatorLayout
            title="CAGR Calculator"
            description="Calculate Compound Annual Growth Rate of your investments"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">CAGR</p>
                        <p className={`text-4xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{result.cagr}%
                        </p>
                        <p className="text-sm text-slate-500 mt-1">per annum</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Return</span>
                            <p className={`text-lg font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isPositive ? '+' : ''}{result.totalReturn}%
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Absolute Gain</span>
                            <p className={`text-lg font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isPositive ? '+' : ''}{formatCurrency(result.absoluteGain)}
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Beginning Value</label>
                <input type="number" value={beginningValue} onChange={(e) => setBeginningValue(Number(e.target.value))} min={1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={10000} max={10000000} step={10000} value={beginningValue} onChange={(e) => setBeginningValue(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ending Value</label>
                <input type="number" value={endingValue} onChange={(e) => setEndingValue(Number(e.target.value))} min={1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={10000} max={10000000} step={10000} value={endingValue} onChange={(e) => setEndingValue(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Number of Years</label>
                <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} min={1} max={50}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1} max={30} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
