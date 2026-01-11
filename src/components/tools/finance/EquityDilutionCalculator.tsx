'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Users, Percent } from 'lucide-react';

export default function EquityDilutionCalculator() {
    const [currentShares, setCurrentShares] = useState(1000000);
    const [newShares, setNewShares] = useState(200000);
    const [yourShares, setYourShares] = useState(100000);
    const [preMoneyValuation, setPreMoneyValuation] = useState(10000000);

    const result = useMemo(() => {
        const totalSharesAfter = currentShares + newShares;
        const currentOwnership = (yourShares / currentShares) * 100;
        const newOwnership = (yourShares / totalSharesAfter) * 100;
        const dilution = currentOwnership - newOwnership;

        const pricePerShare = preMoneyValuation / currentShares;
        const investmentAmount = newShares * pricePerShare;
        const postMoneyValuation = preMoneyValuation + investmentAmount;
        const yourValueBefore = yourShares * pricePerShare;
        const yourValueAfter = yourShares * (postMoneyValuation / totalSharesAfter);

        return {
            currentOwnership: Math.round(currentOwnership * 100) / 100,
            newOwnership: Math.round(newOwnership * 100) / 100,
            dilution: Math.round(dilution * 100) / 100,
            investmentAmount: Math.round(investmentAmount),
            postMoneyValuation: Math.round(postMoneyValuation),
            yourValueBefore: Math.round(yourValueBefore),
            yourValueAfter: Math.round(yourValueAfter)
        };
    }, [currentShares, newShares, yourShares, preMoneyValuation]);

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Equity Dilution Calculator"
            description="Calculate ownership dilution after funding rounds"
            category="Business"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Your New Ownership</p>
                        <p className="text-4xl font-bold text-emerald-600">{result.newOwnership}%</p>
                        <p className="text-sm text-red-500 mt-1">-{result.dilution}% dilution</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Before</span>
                            <p className="text-lg font-semibold">{result.currentOwnership}%</p>
                            <p className="text-sm text-slate-500">{formatCurrency(result.yourValueBefore)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">After</span>
                            <p className="text-lg font-semibold text-emerald-600">{result.newOwnership}%</p>
                            <p className="text-sm text-emerald-600">{formatCurrency(result.yourValueAfter)}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Post-Money Valuation</span>
                            <span className="font-semibold text-emerald-600">{formatCurrency(result.postMoneyValuation)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Investment Amount</span>
                            <span className="font-semibold">{formatCurrency(result.investmentAmount)}</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Total Shares</label>
                <input type="number" value={currentShares} onChange={(e) => setCurrentShares(Number(e.target.value))} min={1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Shares</label>
                <input type="number" value={yourShares} onChange={(e) => setYourShares(Number(e.target.value))} min={1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Shares Issued</label>
                <input type="number" value={newShares} onChange={(e) => setNewShares(Number(e.target.value))} min={1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pre-Money Valuation</label>
                <input type="number" value={preMoneyValuation} onChange={(e) => setPreMoneyValuation(Number(e.target.value))} min={100000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
