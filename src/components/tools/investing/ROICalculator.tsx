'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, TrendingUp, Percent } from 'lucide-react';

interface ROIResult {
    netProfit: number;
    roi: number;
    annualizedROI: number;
}

export default function ROICalculator() {
    const [initialInvestment, setInitialInvestment] = useState(100000);
    const [finalValue, setFinalValue] = useState(150000);
    const [years, setYears] = useState(3);

    const result = useMemo<ROIResult>(() => {
        const netProfit = finalValue - initialInvestment;
        const roi = (netProfit / initialInvestment) * 100;
        const annualizedROI = (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100;

        return {
            netProfit: Math.round(netProfit),
            roi: Math.round(roi * 100) / 100,
            annualizedROI: Math.round(annualizedROI * 100) / 100
        };
    }, [initialInvestment, finalValue, years]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const isProfit = result.netProfit >= 0;

    return (
        <CalculatorLayout
            title="ROI Calculator"
            description="Calculate Return on Investment and annualized returns"
            category="Investing"
            results={
                <div className="space-y-6">
                    {/* Main Result */}
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Total ROI</p>
                        <p className={`text-4xl font-bold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isProfit ? '+' : ''}{result.roi}%
                        </p>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-slate-500">Net {isProfit ? 'Profit' : 'Loss'}</span>
                            </div>
                            <p className={`text-lg font-semibold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isProfit ? '+' : ''}{formatCurrency(result.netProfit)}
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Percent className="w-4 h-4 text-purple-500" />
                                <span className="text-xs text-slate-500">Annualized</span>
                            </div>
                            <p className={`text-lg font-semibold ${isProfit ? 'text-purple-600' : 'text-red-600'}`}>
                                {isProfit ? '+' : ''}{result.annualizedROI}% p.a.
                            </p>
                        </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Investment Growth</span>
                            <span className={`font-medium ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(initialInvestment)} → {formatCurrency(finalValue)}
                            </span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${isProfit ? 'bg-emerald-500' : 'bg-red-500'} transition-all`}
                                style={{ width: `${Math.min((finalValue / initialInvestment) * 50, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            }
        >
            {/* Initial Investment */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Initial Investment
                </label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={initialInvestment}
                        onChange={(e) => setInitialInvestment(Number(e.target.value))}
                        min={1000}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input type="range" min={1000} max={1000000} step={1000} value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Final Value */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Final Value
                </label>
                <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={finalValue}
                        onChange={(e) => setFinalValue(Number(e.target.value))}
                        min={0}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input type="range" min={0} max={2000000} step={1000} value={finalValue} onChange={(e) => setFinalValue(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Investment Period */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Investment Period (Years)
                </label>
                <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    min={1}
                    max={50}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
                <input type="range" min={1} max={30} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
