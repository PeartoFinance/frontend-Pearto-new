'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Percent, Calculator } from 'lucide-react';

export default function MarginCalculator() {
    const [mode, setMode] = useState<'profit' | 'cost'>('cost');
    const [cost, setCost] = useState(100);
    const [sellingPrice, setSellingPrice] = useState(150);
    const [margin, setMargin] = useState(33);

    const result = useMemo(() => {
        if (mode === 'cost') {
            // Given cost and selling price, calculate margins
            const profit = sellingPrice - cost;
            const profitMargin = (profit / sellingPrice) * 100;
            const markup = (profit / cost) * 100;

            return {
                profit: Math.round(profit * 100) / 100,
                profitMargin: Math.round(profitMargin * 100) / 100,
                markup: Math.round(markup * 100) / 100,
                cost,
                sellingPrice
            };
        } else {
            // Given cost and desired margin, calculate selling price
            const calculatedPrice = cost / (1 - margin / 100);
            const profit = calculatedPrice - cost;
            const markup = (profit / cost) * 100;

            return {
                profit: Math.round(profit * 100) / 100,
                profitMargin: margin,
                markup: Math.round(markup * 100) / 100,
                cost,
                sellingPrice: Math.round(calculatedPrice * 100) / 100
            };
        }
    }, [mode, cost, sellingPrice, margin]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Profit Margin Calculator"
            description="Calculate profit margins, markups, and selling prices"
            category="Business"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Profit Margin</p>
                        <p className="text-4xl font-bold text-emerald-600">{result.profitMargin}%</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Profit</span>
                            <p className="text-lg font-semibold text-emerald-600">{formatCurrency(result.profit)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Markup</span>
                            <p className="text-lg font-semibold">{result.markup}%</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                        <span className="text-slate-500">Selling Price</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(result.sellingPrice)}</span>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Calculation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setMode('cost')} className={`py-3 px-4 rounded-lg font-medium text-sm ${mode === 'cost' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        From Prices
                    </button>
                    <button onClick={() => setMode('profit')} className={`py-3 px-4 rounded-lg font-medium text-sm ${mode === 'profit' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        From Margin
                    </button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cost Price</label>
                <input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} min={0} step={0.01}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            {mode === 'cost' ? (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Selling Price</label>
                    <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} min={cost} step={0.01}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Desired Margin (%)</label>
                    <input type="number" value={margin} onChange={(e) => setMargin(Number(e.target.value))} min={1} max={99} step={0.1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                    <input type="range" min={5} max={80} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
                </div>
            )}
        </CalculatorLayout>
    );
}
