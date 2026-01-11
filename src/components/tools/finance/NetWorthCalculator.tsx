'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';

export default function NetWorthCalculator() {
    const [assets, setAssets] = useState({
        cash: 100000,
        investments: 500000,
        property: 2000000,
        vehicle: 500000,
        gold: 200000,
        other: 50000
    });

    const [liabilities, setLiabilities] = useState({
        homeLoan: 1500000,
        carLoan: 200000,
        personalLoan: 50000,
        creditCard: 20000,
        otherDebt: 0
    });

    const result = useMemo(() => {
        const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0);
        const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + b, 0);
        const netWorth = totalAssets - totalLiabilities;
        const debtToAsset = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

        return {
            totalAssets: Math.round(totalAssets),
            totalLiabilities: Math.round(totalLiabilities),
            netWorth: Math.round(netWorth),
            debtToAsset: Math.round(debtToAsset)
        };
    }, [assets, liabilities]);

    const formatCurrency = (amount: number) => {
        if (Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const isPositive = result.netWorth >= 0;

    return (
        <CalculatorLayout
            title="Net Worth Calculator"
            description="Calculate your total net worth (assets minus liabilities)"
            category="Personal Finance"
            results={
                <div className="space-y-6">
                    <div className={`text-center p-6 rounded-xl ${isPositive ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200' : 'bg-red-50 dark:bg-red-900/20 border border-red-200'}`}>
                        <Wallet className={`w-8 h-8 mx-auto mb-2 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`} />
                        <p className="text-sm text-slate-500 mb-1">Your Net Worth</p>
                        <p className={`text-4xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(result.netWorth)}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Assets</span>
                            <p className="text-lg font-semibold text-emerald-600">{formatCurrency(result.totalAssets)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Liabilities</span>
                            <p className="text-lg font-semibold text-red-600">{formatCurrency(result.totalLiabilities)}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Debt-to-Asset Ratio</span>
                            <span className={result.debtToAsset < 50 ? 'text-emerald-600' : 'text-red-600'}>{result.debtToAsset}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${result.debtToAsset < 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, result.debtToAsset)}%` }} />
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-3">
                <p className="text-sm font-medium text-emerald-600">Assets</p>
                {Object.entries(assets).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                        <label className="w-24 text-xs text-slate-600 capitalize">{key}</label>
                        <input type="number" value={value} onChange={(e) => setAssets({ ...assets, [key]: Number(e.target.value) })} min={0}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                ))}
            </div>
            <div className="space-y-3">
                <p className="text-sm font-medium text-red-600">Liabilities</p>
                {Object.entries(liabilities).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                        <label className="w-24 text-xs text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <input type="number" value={value} onChange={(e) => setLiabilities({ ...liabilities, [key]: Number(e.target.value) })} min={0}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                ))}
            </div>
        </CalculatorLayout>
    );
}
