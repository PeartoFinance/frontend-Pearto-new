'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Calculator, Percent, ArrowLeftRight } from 'lucide-react';

export default function TipCalculator() {
    const [billAmount, setBillAmount] = useState(1000);
    const [tipPercent, setTipPercent] = useState(15);
    const [splitBy, setSplitBy] = useState(2);

    const result = useMemo(() => {
        const tipAmount = billAmount * (tipPercent / 100);
        const totalBill = billAmount + tipAmount;
        const perPersonTotal = totalBill / splitBy;
        const perPersonTip = tipAmount / splitBy;

        return {
            tipAmount: Math.round(tipAmount),
            totalBill: Math.round(totalBill),
            perPersonTotal: Math.round(perPersonTotal),
            perPersonTip: Math.round(perPersonTip)
        };
    }, [billAmount, tipPercent, splitBy]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const tipPresets = [10, 15, 18, 20, 25];

    return (
        <CalculatorLayout
            title="Tip Calculator"
            description="Calculate tips and split bills among friends"
            category="Utilities"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Total Bill</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.totalBill)}</p>
                        <p className="text-sm text-slate-500 mt-1">Tip: {formatCurrency(result.tipAmount)}</p>
                    </div>
                    {splitBy > 1 && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">Split {splitBy} Ways</p>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Per Person</span>
                                <span className="font-bold text-emerald-600">{formatCurrency(result.perPersonTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-slate-500">Tip per person</span>
                                <span className="text-slate-600">{formatCurrency(result.perPersonTip)}</span>
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bill Amount</label>
                <input type="number" value={billAmount} onChange={(e) => setBillAmount(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={100} max={10000} step={100} value={billAmount} onChange={(e) => setBillAmount(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tip Percentage: {tipPercent}%</label>
                <div className="flex gap-2 flex-wrap mb-2">
                    {tipPresets.map((preset) => (
                        <button key={preset} onClick={() => setTipPercent(preset)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tipPercent === preset ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            {preset}%
                        </button>
                    ))}
                </div>
                <input type="range" min={0} max={50} value={tipPercent} onChange={(e) => setTipPercent(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Split By: {splitBy} {splitBy === 1 ? 'person' : 'people'}</label>
                <input type="range" min={1} max={10} value={splitBy} onChange={(e) => setSplitBy(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
