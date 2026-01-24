'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Briefcase, DollarSign, PieChart, Calendar } from 'lucide-react';

interface Asset {
    name: string;
    value: number;
    allocation: number;
}

export default function AssetAllocationCalculator() {
    const [totalValue, setTotalValue] = useState(100000);
    const [age, setAge] = useState(35);
    const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

    const allocation = useMemo(() => {
        // Rule of thumb: stocks = 110 - age, adjusted for risk tolerance
        let stockPercent = 110 - age;

        if (riskTolerance === 'conservative') stockPercent -= 15;
        else if (riskTolerance === 'aggressive') stockPercent += 10;

        stockPercent = Math.max(20, Math.min(90, stockPercent));
        const bondPercent = 100 - stockPercent - 10;
        const cashPercent = 10;

        // Further breakdown
        const assets: Asset[] = [
            { name: 'Domestic Stocks', value: totalValue * (stockPercent * 0.6) / 100, allocation: stockPercent * 0.6 },
            { name: 'International Stocks', value: totalValue * (stockPercent * 0.4) / 100, allocation: stockPercent * 0.4 },
            { name: 'Bonds', value: totalValue * bondPercent / 100, allocation: bondPercent },
            { name: 'Cash/Money Market', value: totalValue * cashPercent / 100, allocation: cashPercent },
        ];

        // Expected returns (simplified)
        const expectedReturn =
            (stockPercent * 0.6 * 0.10) + // Domestic stocks ~10%
            (stockPercent * 0.4 * 0.08) + // International ~8%
            (bondPercent * 0.04) +         // Bonds ~4%
            (cashPercent * 0.02);          // Cash ~2%

        return {
            assets,
            stockPercent,
            bondPercent,
            cashPercent,
            expectedReturn,
            projectedValue10yr: totalValue * Math.pow(1 + expectedReturn / 100, 10)
        };
    }, [totalValue, age, riskTolerance]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];

    return (
        <CalculatorLayout
            title="Asset Allocation Calculator"
            description="Get recommended portfolio allocation based on age and risk"
            category="Portfolio Analysis"
            results={
                <div className="space-y-4">
                    {/* Visual allocation bar */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Recommended Allocation
                        </p>
                        <div className="flex rounded-lg overflow-hidden h-8 mb-3">
                            {allocation.assets.map((asset, i) => (
                                <div
                                    key={asset.name}
                                    className={`${colors[i]} h-full flex items-center justify-center text-xs text-white font-medium`}
                                    style={{ width: `${asset.allocation}%` }}
                                    title={asset.name}
                                >
                                    {asset.allocation > 15 && `${asset.allocation.toFixed(0)}%`}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {allocation.assets.map((asset, i) => (
                                <div key={asset.name} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${colors[i]}`} />
                                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                        {asset.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Investment amounts */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Investment Amounts
                        </p>
                        <div className="space-y-2">
                            {allocation.assets.map((asset, i) => (
                                <div key={asset.name} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${colors[i]}`} />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {asset.name}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {formatCurrency(asset.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Projections */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Expected Return</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {allocation.expectedReturn.toFixed(1)}%
                            </p>
                            <p className="text-xs text-slate-400">per year</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">10-Year Projection</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(allocation.projectedValue10yr)}
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 text-center">
                        Based on historical averages. Actual returns may vary.
                    </p>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Total Portfolio Value ($)
                    </label>
                    <input
                        type="number"
                        value={totalValue}
                        onChange={(e) => setTotalValue(Number(e.target.value))}
                        step={10000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Age: {age} years
                    </label>
                    <input
                        type="range"
                        min={18}
                        max={80}
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>18</span>
                        <span>80</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Risk Tolerance
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['conservative', 'moderate', 'aggressive'] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => setRiskTolerance(level)}
                                className={`py-2 text-sm font-medium rounded-lg transition ${riskTolerance === level
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    }`}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2">Rule of Thumb:</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        "110 minus your age" = % in stocks. Adjust based on your risk tolerance and goals.
                    </p>
                </div>
            </div>
        </CalculatorLayout>
    );
}
