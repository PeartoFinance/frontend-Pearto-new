'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { TrendingUp, DollarSign, PieChart, BarChart2 } from 'lucide-react';

export default function ROASCalculator() {
    const [adSpend, setAdSpend] = useState(5000);
    const [revenue, setRevenue] = useState(15000);
    const [cogs, setCogs] = useState(6000);
    const [targetROAS, setTargetROAS] = useState(3);

    const results = useMemo(() => {
        const roas = adSpend > 0 ? revenue / adSpend : 0;
        const profit = revenue - cogs - adSpend;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const breakEvenROAS = revenue > 0 ? (adSpend + cogs) / revenue : 0;
        const revenueNeeded = adSpend * targetROAS;
        const acos = revenue > 0 ? (adSpend / revenue) * 100 : 0;
        const cpa = revenue > 0 ? adSpend / (revenue / 50) : 0; // Assuming $50 avg order

        return {
            roas,
            profit,
            profitMargin,
            breakEvenROAS,
            revenueNeeded,
            acos,
            cpa,
            isProfit: profit > 0,
            meetsTarget: roas >= targetROAS
        };
    }, [adSpend, revenue, cogs, targetROAS]);



    return (
        <CalculatorLayout
            title="ROAS Calculator"
            description="Calculate return on ad spend and campaign profitability"
            category="Marketing"
            results={
                <div className="space-y-4">
                    <div className={`text-center p-6 rounded-xl ${results.meetsTarget
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
                        : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'
                        }`}>
                        <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${results.meetsTarget ? 'text-emerald-500' : 'text-red-500'}`} />
                        <p className="text-sm text-slate-500">Return on Ad Spend</p>
                        <p className={`text-5xl font-bold ${results.meetsTarget ? 'text-emerald-600' : 'text-red-600'}`}>
                            {results.roas.toFixed(2)}x
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {results.meetsTarget ? '✓ Meeting target' : `✗ Below ${targetROAS}x target`}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Net Profit</p>
                            <p className={`text-xl font-bold ${results.isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
                                <PriceDisplay amount={results.profit} maximumFractionDigits={0} />
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">ACoS</p>
                            <p className="text-xl font-bold text-blue-600">{results.acos.toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Performance Metrics
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Revenue</span>
                                <span className="font-medium text-emerald-600"><PriceDisplay amount={revenue} maximumFractionDigits={0} /></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Ad Spend</span>
                                <span className="font-medium text-red-500">-<PriceDisplay amount={adSpend} maximumFractionDigits={0} /></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Cost of Goods</span>
                                <span className="font-medium text-amber-600">-<PriceDisplay amount={cogs} maximumFractionDigits={0} /></span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                <span className="text-slate-700 dark:text-slate-300 font-medium">Net Profit</span>
                                <span className={`font-bold ${results.isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
                                    <PriceDisplay amount={results.profit} maximumFractionDigits={0} />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">To achieve {targetROAS}x ROAS:</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Generate <PriceDisplay amount={results.revenueNeeded} maximumFractionDigits={0} /> in revenue
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Current: <PriceDisplay amount={revenue} maximumFractionDigits={0} /> ({results.meetsTarget ? 'Target met! ✓' : <><PriceDisplay amount={results.revenueNeeded - revenue} maximumFractionDigits={0} /> more needed</>})
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Ad Spend ($)
                    </label>
                    <input
                        type="number"
                        value={adSpend}
                        onChange={(e) => setAdSpend(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Revenue Generated ($)
                    </label>
                    <input
                        type="number"
                        value={revenue}
                        onChange={(e) => setRevenue(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Cost of Goods Sold ($)
                    </label>
                    <input
                        type="number"
                        value={cogs}
                        onChange={(e) => setCogs(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Target ROAS: {targetROAS}x
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={10}
                        step={0.5}
                        value={targetROAS}
                        onChange={(e) => setTargetROAS(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>1x</span>
                        <span>10x</span>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
