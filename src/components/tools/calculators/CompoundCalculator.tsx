'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { IndianRupee, TrendingUp, Calendar, PiggyBank, Landmark } from 'lucide-react';

interface CompoundResult {
    principal: number;
    totalInterest: number;
    totalValue: number;
    yearlyBreakdown: { year: number; value: number }[];
}

export default function CompoundCalculator() {
    const [principal, setPrincipal] = useState(100000);
    const [rate, setRate] = useState(10);
    const [years, setYears] = useState(10);
    const [compoundFreq, setCompoundFreq] = useState(12); // Monthly
    const { formatPrice } = useCurrency();

    const result = useMemo<CompoundResult>(() => {
        const n = compoundFreq;
        const r = rate / 100;

        // A = P(1 + r/n)^(nt)
        const totalValue = principal * Math.pow(1 + r / n, n * years);
        const totalInterest = totalValue - principal;

        // Yearly breakdown for visualization
        const yearlyBreakdown = [];
        for (let y = 1; y <= years; y++) {
            yearlyBreakdown.push({
                year: y,
                value: Math.round(principal * Math.pow(1 + r / n, n * y))
            });
        }

        return {
            principal,
            totalInterest: Math.round(totalInterest),
            totalValue: Math.round(totalValue),
            yearlyBreakdown
        };
    }, [principal, rate, years, compoundFreq]);



    return (
        <CalculatorLayout
            title="Compound Interest Calculator"
            description="Visualize how your investments grow with compound interest over time"
            category="Investing"
            results={
                <div className="space-y-6">
                    {/* Main Result */}
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Total Value</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            <PriceDisplay amount={result.totalValue} />
                        </p>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Landmark className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-slate-500">Principal</span>
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                <PriceDisplay amount={result.principal} />
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs text-slate-500">Interest Earned</span>
                            </div>
                            <p className="text-lg font-semibold text-emerald-600">
                                <PriceDisplay amount={result.totalInterest} />
                            </p>
                        </div>
                    </div>

                    {/* Growth Chart Placeholder */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Growth Over Time</h4>
                        <div className="flex items-end gap-1 h-32">
                            {result.yearlyBreakdown.slice(0, 10).map((item, idx) => (
                                <div
                                    key={item.year}
                                    className="flex-1 bg-emerald-500 rounded-t"
                                    style={{
                                        height: `${(item.value / result.totalValue) * 100}%`,
                                        opacity: 0.5 + (idx / 20)
                                    }}
                                    title={`Year ${item.year}: ${formatPrice(item.value)}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            {/* Principal Amount */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Principal Amount
                </label>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={principal}
                        onChange={(e) => setPrincipal(Number(e.target.value))}
                        min={1000}
                        max={10000000}
                        step={1000}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input
                    type="range"
                    min={1000}
                    max={1000000}
                    step={1000}
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                />
            </div>

            {/* Interest Rate */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Interest Rate (% p.a.)
                </label>
                <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        min={1}
                        max={30}
                        step={0.5}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input
                    type="range"
                    min={1}
                    max={30}
                    step={0.5}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                />
            </div>

            {/* Time Period */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Time Period (Years)
                </label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        min={1}
                        max={50}
                        step={1}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                />
            </div>

            {/* Compounding Frequency */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Compounding Frequency
                </label>
                <select
                    value={compoundFreq}
                    onChange={(e) => setCompoundFreq(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                    <option value={1}>Yearly</option>
                    <option value={2}>Half-Yearly</option>
                    <option value={4}>Quarterly</option>
                    <option value={12}>Monthly</option>
                    <option value={365}>Daily</option>
                </select>
            </div>
        </CalculatorLayout>
    );
}
