'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Percent, DollarSign, Calculator } from 'lucide-react';

export default function GSTCalculator() {
    const [amount, setAmount] = useState(10000);
    const [gstRate, setGstRate] = useState(18);
    const [inclusive, setInclusive] = useState(false);

    const result = useMemo(() => {
        if (inclusive) {
            // Amount includes GST
            const baseAmount = amount / (1 + gstRate / 100);
            const gstAmount = amount - baseAmount;
            return {
                baseAmount: Math.round(baseAmount),
                gstAmount: Math.round(gstAmount),
                totalAmount: Math.round(amount),
                cgst: Math.round(gstAmount / 2),
                sgst: Math.round(gstAmount / 2)
            };
        } else {
            // Amount excludes GST
            const gstAmount = amount * (gstRate / 100);
            return {
                baseAmount: Math.round(amount),
                gstAmount: Math.round(gstAmount),
                totalAmount: Math.round(amount + gstAmount),
                cgst: Math.round(gstAmount / 2),
                sgst: Math.round(gstAmount / 2)
            };
        }
    }, [amount, gstRate, inclusive]);

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
    };

    return (
        <CalculatorLayout
            title="GST Calculator"
            description="Calculate GST, CGST, and SGST for your transactions"
            category="Taxation"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.totalAmount)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Base Amount</span>
                            <p className="text-lg font-semibold">{formatCurrency(result.baseAmount)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">GST ({gstRate}%)</span>
                            <p className="text-lg font-semibold text-amber-600">{formatCurrency(result.gstAmount)}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">GST Breakdown</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">CGST ({gstRate / 2}%)</span>
                            <span className="font-medium">{formatCurrency(result.cgst)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-slate-500">SGST ({gstRate / 2}%)</span>
                            <span className="font-medium">{formatCurrency(result.sgst)}</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount Type</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setInclusive(false)} className={`py-3 px-4 rounded-lg font-medium text-sm ${!inclusive ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        Excluding GST
                    </button>
                    <button onClick={() => setInclusive(true)} className={`py-3 px-4 rounded-lg font-medium text-sm ${inclusive ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        Including GST
                    </button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={100} max={1000000} step={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">GST Rate (%)</label>
                <div className="grid grid-cols-4 gap-2">
                    {[5, 12, 18, 28].map((rate) => (
                        <button key={rate} onClick={() => setGstRate(rate)} className={`py-2 px-3 rounded-lg font-medium text-sm ${gstRate === rate ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            {rate}%
                        </button>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
