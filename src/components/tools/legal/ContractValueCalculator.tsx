'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Scale, FileText, DollarSign, Calendar } from 'lucide-react';

export default function ContractValueCalculator() {
    const [baseValue, setBaseValue] = useState(100000);
    const [duration, setDuration] = useState(12);
    const [escalation, setEscalation] = useState(3);
    const [discountRate, setDiscountRate] = useState(8);
    const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

    const results = useMemo(() => {
        const periodsPerYear = paymentFrequency === 'monthly' ? 12 : paymentFrequency === 'quarterly' ? 4 : 1;
        const totalPeriods = duration;
        const periodicPayment = baseValue / periodsPerYear;
        const periodicDiscount = discountRate / 100 / periodsPerYear;
        const annualEscalation = escalation / 100;

        let totalNominal = 0;
        let totalPV = 0;
        let currentPayment = periodicPayment;
        let year = 1;

        for (let i = 1; i <= totalPeriods; i++) {
            const currentYear = Math.ceil(i / periodsPerYear);
            if (currentYear > year) {
                currentPayment *= (1 + annualEscalation);
                year = currentYear;
            }
            totalNominal += currentPayment;
            totalPV += currentPayment / Math.pow(1 + periodicDiscount, i);
        }

        const avgMonthlyValue = totalNominal / (duration / (12 / periodsPerYear));

        return {
            totalNominal,
            totalPV,
            avgMonthlyValue,
            totalPeriods,
            periodicPayment
        };
    }, [baseValue, duration, escalation, discountRate, paymentFrequency]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

    return (
        <CalculatorLayout
            title="Contract Value Calculator"
            description="Calculate total and present value of contracts"
            category="Legal"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <Scale className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Total Contract Value</p>
                        <p className="text-4xl font-bold text-blue-600">{formatCurrency(results.totalNominal)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Present Value</p>
                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(results.totalPV)}</p>
                            <p className="text-xs text-slate-400">@ {discountRate}% discount</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Avg Monthly Value</p>
                            <p className="text-xl font-bold text-purple-600">{formatCurrency(results.avgMonthlyValue)}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Contract Summary
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Duration</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {duration} {paymentFrequency === 'monthly' ? 'months' : paymentFrequency === 'quarterly' ? 'quarters' : 'years'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Payment per Period</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {formatCurrency(results.periodicPayment)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Annual Escalation</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {escalation}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">NPV Discount</span>
                                <span className="font-medium text-amber-600">
                                    {formatCurrency(results.totalNominal - results.totalPV)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Annual Base Value ($)
                    </label>
                    <input
                        type="number"
                        value={baseValue}
                        onChange={(e) => setBaseValue(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Duration (periods)
                        </label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Payment Frequency
                        </label>
                        <select
                            value={paymentFrequency}
                            onChange={(e) => setPaymentFrequency(e.target.value as 'monthly' | 'quarterly' | 'annual')}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annual">Annual</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Annual Escalation (%)
                        </label>
                        <input
                            type="number"
                            value={escalation}
                            onChange={(e) => setEscalation(Number(e.target.value))}
                            step={0.5}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Discount Rate (%)
                        </label>
                        <input
                            type="number"
                            value={discountRate}
                            onChange={(e) => setDiscountRate(Number(e.target.value))}
                            step={0.5}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
