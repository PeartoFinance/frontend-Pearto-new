'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { DollarSign, TrendingUp, Percent } from 'lucide-react';

export default function GoldInvestmentCalculator() {
    const [investmentAmount, setInvestmentAmount] = useState(100000);
    const [goldPrice, setGoldPrice] = useState(6500); // per gram
    const [years, setYears] = useState(5);
    const [expectedReturn, setExpectedReturn] = useState(8);

    const result = useMemo(() => {
        const gramsOfGold = investmentAmount / goldPrice;
        const futureGoldPrice = goldPrice * Math.pow(1 + expectedReturn / 100, years);
        const futureValue = gramsOfGold * futureGoldPrice;
        const totalReturns = futureValue - investmentAmount;
        const absoluteReturn = (totalReturns / investmentAmount) * 100;

        return {
            gramsOfGold: Math.round(gramsOfGold * 100) / 100,
            futureValue: Math.round(futureValue),
            totalReturns: Math.round(totalReturns),
            futureGoldPrice: Math.round(futureGoldPrice),
            absoluteReturn: Math.round(absoluteReturn)
        };
    }, [investmentAmount, goldPrice, years, expectedReturn]);



    return (
        <CalculatorLayout
            title="Gold Investment Calculator"
            description="Calculate gold investment returns over time"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-slate-500 mb-1">Future Value</p>
                        <p className="text-4xl font-bold text-amber-600">
                            <PriceDisplay amount={result.futureValue} />
                        </p>
                        <p className="text-sm text-amber-600 mt-1">+{result.absoluteReturn}% returns</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Gold Quantity</span>
                            <p className="text-lg font-semibold">{result.gramsOfGold} grams</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Profit</span>
                            <p className="text-lg font-semibold text-emerald-600">
                                <PriceDisplay amount={result.totalReturns} />
                            </p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <span className="text-xs text-slate-500">Projected Gold Price in {years} Years</span>
                        <p className="text-lg font-semibold">₹{result.futureGoldPrice}/gram</p>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Investment Amount</label>
                <input type="number" value={investmentAmount} onChange={(e) => setInvestmentAmount(Number(e.target.value))} min={10000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={10000} max={5000000} step={10000} value={investmentAmount} onChange={(e) => setInvestmentAmount(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Gold Price (₹/gram)</label>
                <input type="number" value={goldPrice} onChange={(e) => setGoldPrice(Number(e.target.value))} min={4000} max={10000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Years</label>
                    <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} min={1} max={30}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Return (%)</label>
                    <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} min={2} max={20}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
