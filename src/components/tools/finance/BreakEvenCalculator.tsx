'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';

export default function BreakEvenCalculator() {
    const [fixedCosts, setFixedCosts] = useState(500000);
    const [pricePerUnit, setPricePerUnit] = useState(1000);
    const [variableCostPerUnit, setVariableCostPerUnit] = useState(600);
    const [targetProfit, setTargetProfit] = useState(200000);

    const result = useMemo(() => {
        const contributionMargin = pricePerUnit - variableCostPerUnit;
        const contributionMarginRatio = (contributionMargin / pricePerUnit) * 100;
        const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
        const breakEvenRevenue = breakEvenUnits * pricePerUnit;
        const unitsForProfit = Math.ceil((fixedCosts + targetProfit) / contributionMargin);
        const revenueForProfit = unitsForProfit * pricePerUnit;

        return {
            breakEvenUnits,
            breakEvenRevenue: Math.round(breakEvenRevenue),
            contributionMargin: Math.round(contributionMargin),
            contributionMarginRatio: Math.round(contributionMarginRatio * 10) / 10,
            unitsForProfit,
            revenueForProfit: Math.round(revenueForProfit)
        };
    }, [fixedCosts, pricePerUnit, variableCostPerUnit, targetProfit]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Break-Even Calculator"
            description="Calculate units needed to break even and reach profit targets"
            category="Business"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Break-Even Point</p>
                        <p className="text-4xl font-bold text-emerald-600">{result.breakEvenUnits.toLocaleString()}</p>
                        <p className="text-sm text-slate-500 mt-1">units ({formatCurrency(result.breakEvenRevenue)} revenue)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Contribution Margin</span>
                            <p className="text-lg font-semibold">{formatCurrency(result.contributionMargin)}</p>
                            <p className="text-xs text-emerald-600">{result.contributionMarginRatio}% per unit</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">For ₹{(targetProfit / 100000).toFixed(1)}L Profit</span>
                            <p className="text-lg font-semibold text-emerald-600">{result.unitsForProfit.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">units needed</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fixed Costs (Monthly)</label>
                <input type="number" value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Price/Unit</label>
                    <input type="number" value={pricePerUnit} onChange={(e) => setPricePerUnit(Number(e.target.value))} min={1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Variable Cost/Unit</label>
                    <input type="number" value={variableCostPerUnit} onChange={(e) => setVariableCostPerUnit(Number(e.target.value))} min={0}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Profit</label>
                <input type="number" value={targetProfit} onChange={(e) => setTargetProfit(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
