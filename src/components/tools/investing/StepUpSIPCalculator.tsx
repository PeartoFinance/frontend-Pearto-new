'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';

export default function StepUpSIPCalculator() {
    const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
    const [annualStepUp, setAnnualStepUp] = useState(10);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [timePeriod, setTimePeriod] = useState(15);

    const result = useMemo(() => {
        let totalInvested = 0;
        let futureValue = 0;
        let currentSIP = monthlyInvestment;
        const monthlyRate = expectedReturn / 100 / 12;

        for (let year = 1; year <= timePeriod; year++) {
            for (let month = 1; month <= 12; month++) {
                const monthsRemaining = (timePeriod - year) * 12 + (12 - month) + 1;
                futureValue += currentSIP * Math.pow(1 + monthlyRate, monthsRemaining);
                totalInvested += currentSIP;
            }
            currentSIP = currentSIP * (1 + annualStepUp / 100);
        }

        // Compare with regular SIP
        let regularFV = 0;
        const n = timePeriod * 12;
        regularFV = monthlyInvestment * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
        const regularInvested = monthlyInvestment * n;

        return {
            futureValue: Math.round(futureValue),
            totalInvested: Math.round(totalInvested),
            returns: Math.round(futureValue - totalInvested),
            regularFV: Math.round(regularFV),
            regularInvested: Math.round(regularInvested),
            extraGains: Math.round(futureValue - regularFV)
        };
    }, [monthlyInvestment, annualStepUp, expectedReturn, timePeriod]);

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Step-Up SIP Calculator"
            description="Calculate returns with annually increasing SIP amount"
            category="Investing"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Step-Up SIP Value</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.futureValue)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Invested</span>
                            <p className="text-lg font-semibold">{formatCurrency(result.totalInvested)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Returns</span>
                            <p className="text-lg font-semibold text-emerald-600">{formatCurrency(result.returns)}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Extra gains vs Regular SIP</p>
                        <p className="text-2xl font-bold text-emerald-600">+{formatCurrency(result.extraGains)}</p>
                        <p className="text-xs text-slate-500 mt-1">Regular SIP would give {formatCurrency(result.regularFV)}</p>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Starting Monthly SIP</label>
                <input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} min={500}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={500} max={100000} step={500} value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Annual Step-Up (%)</label>
                <input type="number" value={annualStepUp} onChange={(e) => setAnnualStepUp(Number(e.target.value))} min={0} max={50}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={25} value={annualStepUp} onChange={(e) => setAnnualStepUp(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Return (%)</label>
                    <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} min={1} max={30}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Years</label>
                    <input type="number" value={timePeriod} onChange={(e) => setTimePeriod(Number(e.target.value))} min={1} max={40}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
