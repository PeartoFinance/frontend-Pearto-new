'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { DollarSign, TrendingUp, Download } from 'lucide-react';

export default function SWPCalculator() {
    const [corpus, setCorpus] = useState(5000000);
    const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(30000);
    const [expectedReturn, setExpectedReturn] = useState(8);

    const result = useMemo(() => {
        const monthlyRate = expectedReturn / 100 / 12;
        let balance = corpus;
        let months = 0;
        let totalWithdrawn = 0;
        const maxMonths = 600;

        while (balance > 0 && months < maxMonths) {
            const interest = balance * monthlyRate;
            balance = balance + interest - monthlyWithdrawal;
            if (balance > 0) {
                totalWithdrawn += monthlyWithdrawal;
                months++;
            } else {
                totalWithdrawn += monthlyWithdrawal + balance;
                balance = 0;
            }
        }

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        const sustainable = months >= maxMonths;
        const maxWithdrawal = (corpus * monthlyRate * 0.9); // 90% of monthly growth

        return {
            months,
            years,
            remainingMonths,
            totalWithdrawn: Math.round(totalWithdrawn),
            sustainable,
            maxWithdrawal: Math.round(maxWithdrawal)
        };
    }, [corpus, monthlyWithdrawal, expectedReturn]);



    return (
        <CalculatorLayout
            title="SWP Calculator"
            description="Calculate systematic withdrawal plan duration"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className={`text-center p-6 rounded-xl ${result.sustainable ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200' : 'bg-white dark:bg-slate-800'}`}>
                        <p className="text-sm text-slate-500 mb-1">Corpus Lasts</p>
                        {result.sustainable ? (
                            <p className="text-4xl font-bold text-emerald-600">Forever! ♾️</p>
                        ) : (
                            <>
                                <p className="text-4xl font-bold text-blue-600">{result.years}y {result.remainingMonths}m</p>
                                <p className="text-sm text-slate-500 mt-1">{result.months} months</p>
                            </>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Withdrawn</span>
                            <p className="text-lg font-semibold"><PriceDisplay amount={result.totalWithdrawn} /></p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Max Sustainable</span>
                            <p className="text-lg font-semibold text-emerald-600">
                                <PriceDisplay amount={result.maxWithdrawal} />/mo
                            </p>
                        </div>
                    </div>
                    {!result.sustainable && monthlyWithdrawal > result.maxWithdrawal && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 text-sm text-amber-700">
                            💡 Reduce withdrawal to <PriceDisplay amount={result.maxWithdrawal} />/mo for perpetual income
                        </div>
                    )}
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Initial Corpus</label>
                <input type="number" value={corpus} onChange={(e) => setCorpus(Number(e.target.value))} min={100000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={500000} max={50000000} step={100000} value={corpus} onChange={(e) => setCorpus(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly Withdrawal</label>
                <input type="number" value={monthlyWithdrawal} onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))} min={1000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={5000} max={200000} step={1000} value={monthlyWithdrawal} onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Expected Return (% p.a.)</label>
                <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} min={3} max={15} step={0.5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
