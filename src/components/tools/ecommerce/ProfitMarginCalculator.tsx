'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Package, TrendingUp, BarChart3 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function ProfitMarginCalculator() {
    const [mode, setMode] = useState<'margin' | 'markup'>('margin');
    const [cost, setCost] = useState(50);
    const [sellingPrice, setSellingPrice] = useState(100);
    const [desiredMargin, setDesiredMargin] = useState(30);
    const [desiredMarkup, setDesiredMarkup] = useState(50);

    const metrics = useMemo(() => {
        const profit = sellingPrice - cost;
        const marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
        const markupPercent = cost > 0 ? (profit / cost) * 100 : 0;

        // Calculate required selling price for desired margin
        const priceForDesiredMargin = cost / (1 - desiredMargin / 100);
        const profitForDesiredMargin = priceForDesiredMargin - cost;

        // Calculate required selling price for desired markup
        const priceForDesiredMarkup = cost * (1 + desiredMarkup / 100);
        const profitForDesiredMarkup = priceForDesiredMarkup - cost;

        return {
            profit,
            marginPercent,
            markupPercent,
            priceForDesiredMargin,
            profitForDesiredMargin,
            priceForDesiredMarkup,
            profitForDesiredMarkup
        };
    }, [cost, sellingPrice, desiredMargin, desiredMarkup]);

    const { formatPrice: formatCurrency } = useCurrency();

    return (
        <CalculatorLayout
            title="Profit Margin Calculator"
            description="Calculate profit margin, markup, and optimal pricing"
            category="E-commerce"
            results={
                <div className="space-y-4">
                    {/* Main Results */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Profit Margin</p>
                            <p className={`text-3xl font-bold ${metrics.marginPercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {metrics.marginPercent.toFixed(1)}%
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Markup</p>
                            <p className={`text-3xl font-bold ${metrics.markupPercent >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                                {metrics.markupPercent.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl text-center">
                        <p className="text-sm text-slate-500 mb-1">Profit per Unit</p>
                        <p className={`text-4xl font-bold ${metrics.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {formatCurrency(metrics.profit)}
                        </p>
                    </div>

                    {/* Pricing Suggestions */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Pricing Calculator
                        </p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div>
                                    <p className="text-xs text-slate-500">For {desiredMargin}% Margin</p>
                                    <p className="text-sm font-medium text-emerald-600">
                                        Sell at {formatCurrency(metrics.priceForDesiredMargin)}
                                    </p>
                                </div>
                                <p className="text-sm text-slate-500">
                                    {formatCurrency(metrics.profitForDesiredMargin)} profit
                                </p>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div>
                                    <p className="text-xs text-slate-500">For {desiredMarkup}% Markup</p>
                                    <p className="text-sm font-medium text-blue-600">
                                        Sell at {formatCurrency(metrics.priceForDesiredMarkup)}
                                    </p>
                                </div>
                                <p className="text-sm text-slate-500">
                                    {formatCurrency(metrics.profitForDesiredMarkup)} profit
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Formula Explanation */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">Formulas:</p>
                        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                            <p>Margin = (Price - Cost) / Price × 100</p>
                            <p>Markup = (Price - Cost) / Cost × 100</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Product Cost ($)
                    </label>
                    <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(Math.max(0, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Selling Price ($)
                    </label>
                    <input
                        type="number"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Target Pricing
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Desired Margin: {desiredMargin}%
                            </label>
                            <input
                                type="range"
                                min={5}
                                max={80}
                                value={desiredMargin}
                                onChange={(e) => setDesiredMargin(Number(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Desired Markup: {desiredMarkup}%
                            </label>
                            <input
                                type="range"
                                min={10}
                                max={200}
                                value={desiredMarkup}
                                onChange={(e) => setDesiredMarkup(Number(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
