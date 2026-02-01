'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { TrendingUp, DollarSign, Calculator } from 'lucide-react';

export default function DividendYieldCalculator() {
    const [stockPrice, setStockPrice] = useState(100);
    const [annualDividend, setAnnualDividend] = useState(4);
    const [sharesOwned, setSharesOwned] = useState(100);

    const result = useMemo(() => {
        const dividendYield = (annualDividend / stockPrice) * 100;
        const totalAnnualIncome = annualDividend * sharesOwned;
        const monthlyIncome = totalAnnualIncome / 12;
        const investmentValue = stockPrice * sharesOwned;

        return {
            dividendYield: Math.round(dividendYield * 100) / 100,
            totalAnnualIncome: Math.round(totalAnnualIncome),
            monthlyIncome: Math.round(monthlyIncome),
            investmentValue: Math.round(investmentValue)
        };
    }, [stockPrice, annualDividend, sharesOwned]);



    return (
        <CalculatorLayout
            title="Dividend Yield Calculator"
            description="Calculate dividend yield and annual income from stocks"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Dividend Yield</p>
                        <p className="text-4xl font-bold text-emerald-600">{result.dividendYield}%</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Annual Income</span>
                            <p className="text-lg font-semibold text-emerald-600">
                                <PriceDisplay amount={result.totalAnnualIncome} />
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Monthly Income</span>
                            <p className="text-lg font-semibold"><PriceDisplay amount={result.monthlyIncome} /></p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                        <span className="text-slate-500">Investment Value</span>
                        <span className="font-semibold"><PriceDisplay amount={result.investmentValue} /></span>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Stock Price (₹)</label>
                <input type="number" value={stockPrice} onChange={(e) => setStockPrice(Number(e.target.value))} min={1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={10} max={5000} value={stockPrice} onChange={(e) => setStockPrice(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Annual Dividend Per Share (₹)</label>
                <input type="number" value={annualDividend} onChange={(e) => setAnnualDividend(Number(e.target.value))} min={0} step={0.5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shares Owned</label>
                <input type="number" value={sharesOwned} onChange={(e) => setSharesOwned(Number(e.target.value))} min={1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1} max={1000} value={sharesOwned} onChange={(e) => setSharesOwned(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
