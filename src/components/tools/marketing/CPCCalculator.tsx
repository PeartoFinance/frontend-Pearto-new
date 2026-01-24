'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, MousePointer, TrendingUp } from 'lucide-react';

export default function CPCCalculator() {
    const [adSpend, setAdSpend] = useState(1000);
    const [clicks, setClicks] = useState(500);
    const [conversions, setConversions] = useState(25);
    const [revenue, setRevenue] = useState(2500);

    const metrics = useMemo(() => {
        const cpc = clicks > 0 ? adSpend / clicks : 0;
        const ctr = clicks > 0 ? (clicks / (clicks * 10)) * 100 : 0; // Assuming 10x impressions
        const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
        const cpa = conversions > 0 ? adSpend / conversions : 0;
        const roas = adSpend > 0 ? revenue / adSpend : 0;
        const profit = revenue - adSpend;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
            cpc,
            ctr,
            conversionRate,
            cpa,
            roas,
            profit,
            profitMargin,
            revenuePerClick: clicks > 0 ? revenue / clicks : 0
        };
    }, [adSpend, clicks, conversions, revenue]);

    const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

    return (
        <CalculatorLayout
            title="CPC Calculator"
            description="Calculate cost per click and other ad metrics"
            category="Marketing"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <MousePointer className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 mb-1">Cost Per Click (CPC)</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(metrics.cpc)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Cost Per Acquisition</p>
                            <p className="text-xl font-bold text-blue-600">{formatCurrency(metrics.cpa)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Conversion Rate</p>
                            <p className="text-xl font-bold text-purple-600">{metrics.conversionRate.toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">Return on Ad Spend (ROAS)</p>
                        <div className="flex items-baseline gap-2">
                            <p className={`text-3xl font-bold ${metrics.roas >= 1 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {metrics.roas.toFixed(2)}x
                            </p>
                            <span className="text-sm text-slate-500">
                                {metrics.roas >= 1 ? 'Profitable' : 'Unprofitable'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Profit/Loss</p>
                            <p className={`text-xl font-bold ${metrics.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {formatCurrency(metrics.profit)}
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Revenue per Click</p>
                            <p className="text-xl font-bold text-blue-600">
                                {formatCurrency(metrics.revenuePerClick)}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">Performance Summary</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Profit Margin</span>
                                <span className={`font-medium ${metrics.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {metrics.profitMargin.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Break-even CPC</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {formatCurrency(metrics.revenuePerClick)}
                                </span>
                            </div>
                        </div>
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
                        onChange={(e) => setAdSpend(Math.max(0, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Total Clicks
                    </label>
                    <input
                        type="number"
                        value={clicks}
                        onChange={(e) => setClicks(Math.max(0, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Conversions
                    </label>
                    <input
                        type="number"
                        value={conversions}
                        onChange={(e) => setConversions(Math.max(0, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Revenue ($)
                    </label>
                    <input
                        type="number"
                        value={revenue}
                        onChange={(e) => setRevenue(Math.max(0, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>
        </CalculatorLayout>
    );
}
