'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { Receipt, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

type AssetType = 'stocks' | 'real_estate' | 'crypto' | 'collectibles';
type HoldingPeriod = 'short' | 'long';
type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household';

// 2024 Tax Brackets
const TAX_BRACKETS = {
    short_term: {
        single: [
            { max: 11600, rate: 10 },
            { max: 47150, rate: 12 },
            { max: 100525, rate: 22 },
            { max: 191950, rate: 24 },
            { max: 243725, rate: 32 },
            { max: 609350, rate: 35 },
            { max: Infinity, rate: 37 }
        ],
        married_joint: [
            { max: 23200, rate: 10 },
            { max: 94300, rate: 12 },
            { max: 201050, rate: 22 },
            { max: 383900, rate: 24 },
            { max: 487450, rate: 32 },
            { max: 731200, rate: 35 },
            { max: Infinity, rate: 37 }
        ]
    },
    long_term: {
        single: [
            { max: 47025, rate: 0 },
            { max: 518900, rate: 15 },
            { max: Infinity, rate: 20 }
        ],
        married_joint: [
            { max: 94050, rate: 0 },
            { max: 583750, rate: 15 },
            { max: Infinity, rate: 20 }
        ]
    }
};

export default function CapitalGainsTaxCalculator() {
    const [purchasePrice, setPurchasePrice] = useState(10000);
    const [salePrice, setSalePrice] = useState(15000);
    const [assetType, setAssetType] = useState<AssetType>('stocks');
    const [holdingPeriod, setHoldingPeriod] = useState<HoldingPeriod>('long');
    const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
    const [otherIncome, setOtherIncome] = useState(75000);
    const [purchaseDate, setPurchaseDate] = useState('2022-01-15');
    const [saleDate, setSaleDate] = useState('2024-06-15');

    const result = useMemo(() => {
        const gain = salePrice - purchasePrice;
        const isProfit = gain > 0;

        if (!isProfit) {
            return {
                gain,
                isProfit: false,
                taxRate: 0,
                taxOwed: 0,
                netProfit: gain,
                effectiveRate: 0,
                holdingDays: 0,
                recommendations: ['You have a capital loss. This can offset other gains or up to $3,000 of ordinary income.']
            };
        }

        // Calculate holding period
        const purchase = new Date(purchaseDate);
        const sale = new Date(saleDate);
        const holdingDays = Math.floor((sale.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
        const actualHoldingPeriod: HoldingPeriod = holdingDays > 365 ? 'long' : 'short';

        // Get tax brackets based on filing status and holding period
        const brackets = actualHoldingPeriod === 'short'
            ? TAX_BRACKETS.short_term[filingStatus === 'married_joint' ? 'married_joint' : 'single']
            : TAX_BRACKETS.long_term[filingStatus === 'married_joint' ? 'married_joint' : 'single'];

        // Calculate taxable income
        const totalIncome = otherIncome + gain;

        // Find applicable tax rate
        let taxRate = 0;
        for (const bracket of brackets) {
            if (totalIncome <= bracket.max) {
                taxRate = bracket.rate;
                break;
            }
        }

        // Calculate tax owed on gains
        const taxOwed = gain * (taxRate / 100);
        const netProfit = gain - taxOwed;
        const effectiveRate = (taxOwed / gain) * 100;

        // Generate recommendations
        const recommendations: string[] = [];
        if (actualHoldingPeriod === 'short' && holdingDays > 300) {
            const daysToWait = 366 - holdingDays;
            recommendations.push(`Wait ${daysToWait} more days for long-term rates and save ~${((gain * 0.22) - (gain * 0.15)).toFixed(0)} in taxes`);
        }
        if (assetType === 'real_estate') {
            recommendations.push('Consider a 1031 exchange to defer capital gains taxes');
        }
        if (taxRate >= 15) {
            recommendations.push('Tax-loss harvesting can offset gains with losses');
        }

        return {
            gain,
            isProfit: true,
            taxRate,
            taxOwed,
            netProfit,
            effectiveRate,
            holdingDays,
            actualHoldingPeriod,
            recommendations
        };
    }, [purchasePrice, salePrice, holdingPeriod, filingStatus, otherIncome, purchaseDate, saleDate, assetType]);



    return (
        <CalculatorLayout
            title="Capital Gains Tax Calculator"
            description="Estimate taxes on investment gains and losses"
            category="Taxation"
            results={
                <div className="space-y-4">
                    {/* Gain/Loss Summary */}
                    <div className={`text-center p-6 rounded-xl ${result.isProfit ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        {result.isProfit ? (
                            <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        ) : (
                            <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        )}
                        <p className="text-sm text-slate-500">Capital {result.isProfit ? 'Gain' : 'Loss'}</p>
                        <p className={`text-4xl font-bold ${result.isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                            {result.isProfit ? '+' : ''}<PriceDisplay amount={result.gain} maximumFractionDigits={0} />
                        </p>
                        {result.holdingDays > 0 && (
                            <p className="text-sm text-slate-500 mt-1">
                                Held for {result.holdingDays} days ({result.holdingDays > 365 ? 'Long-term' : 'Short-term'})
                            </p>
                        )}
                    </div>

                    {result.isProfit && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 mb-1">Tax Rate</p>
                                    <p className="text-2xl font-bold text-blue-600">{result.taxRate}%</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 mb-1">Tax Owed</p>
                                    <p className="text-2xl font-bold text-red-500">
                                        <PriceDisplay amount={result.taxOwed} maximumFractionDigits={0} />
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                                <p className="text-sm text-slate-500 mb-1">Net Profit After Tax</p>
                                <p className="text-3xl font-bold text-emerald-600">
                                    <PriceDisplay amount={result.netProfit} maximumFractionDigits={0} />
                                </p>
                            </div>

                            {/* Visual breakdown */}
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Profit Breakdown
                                </p>
                                <div className="h-4 rounded-full overflow-hidden flex">
                                    <div
                                        className="bg-emerald-500 h-full"
                                        style={{ width: `${(result.netProfit / result.gain) * 100}%` }}
                                    />
                                    <div
                                        className="bg-red-400 h-full"
                                        style={{ width: `${(result.taxOwed / result.gain) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs mt-2">
                                    <span className="text-emerald-600 flex items-center gap-1">Keep: <PriceDisplay amount={result.netProfit} maximumFractionDigits={0} /></span>
                                    <span className="text-red-500 flex items-center gap-1">Tax: <PriceDisplay amount={result.taxOwed} maximumFractionDigits={0} /></span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">💡 Tax Tips</p>
                            <ul className="space-y-1">
                                {result.recommendations.map((rec, i) => (
                                    <li key={i} className="text-xs text-amber-700 dark:text-amber-400">• {rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Purchase Price ($)
                        </label>
                        <input
                            type="number"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Sale Price ($)
                        </label>
                        <input
                            type="number"
                            value={salePrice}
                            onChange={(e) => setSalePrice(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Purchase Date
                        </label>
                        <input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Sale Date
                        </label>
                        <input
                            type="date"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Asset Type
                    </label>
                    <select
                        value={assetType}
                        onChange={(e) => setAssetType(e.target.value as AssetType)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                        <option value="stocks">Stocks/ETFs</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="crypto">Cryptocurrency</option>
                        <option value="collectibles">Collectibles</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Filing Status
                    </label>
                    <select
                        value={filingStatus}
                        onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                        <option value="single">Single</option>
                        <option value="married_joint">Married Filing Jointly</option>
                        <option value="married_separate">Married Filing Separately</option>
                        <option value="head_of_household">Head of Household</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Other Annual Income ($)
                    </label>
                    <input
                        type="number"
                        value={otherIncome}
                        onChange={(e) => setOtherIncome(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>
            </div>
        </CalculatorLayout>
    );
}
