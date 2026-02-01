'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { GraduationCap, DollarSign, TrendingUp } from 'lucide-react';

export default function EducationCostCalculator() {
    const [currentCost, setCurrentCost] = useState(2000000);
    const [childAge, setChildAge] = useState(5);
    const [educationAge, setEducationAge] = useState(18);
    const [inflation, setInflation] = useState(8);
    const [investmentReturn, setInvestmentReturn] = useState(12);

    const result = useMemo(() => {
        const yearsToEducation = educationAge - childAge;
        const futureCost = currentCost * Math.pow(1 + inflation / 100, yearsToEducation);

        // SIP needed
        const r = investmentReturn / 100 / 12;
        const n = yearsToEducation * 12;
        const sipNeeded = futureCost / ((Math.pow(1 + r, n) - 1) / r * (1 + r));

        // Lumpsum needed
        const lumpsumNeeded = futureCost / Math.pow(1 + investmentReturn / 100, yearsToEducation);

        return {
            futureCost: Math.round(futureCost),
            sipNeeded: Math.round(sipNeeded),
            lumpsumNeeded: Math.round(lumpsumNeeded),
            yearsToEducation
        };
    }, [currentCost, childAge, educationAge, inflation, investmentReturn]);



    return (
        <CalculatorLayout
            title="Education Cost Planner"
            description="Plan for your child's higher education costs"
            category="Education"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <GraduationCap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 mb-1">Future Education Cost</p>
                        <p className="text-4xl font-bold text-blue-600">
                            <PriceDisplay amount={result.futureCost} />
                        </p>
                        <p className="text-sm text-slate-500 mt-1">in {result.yearsToEducation} years</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Monthly SIP Needed</span>
                            <p className="text-lg font-semibold text-emerald-600">
                                <PriceDisplay amount={result.sipNeeded} />
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Lumpsum Needed Today</span>
                            <p className="text-lg font-semibold">
                                <PriceDisplay amount={result.lumpsumNeeded} />
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Education Cost</label>
                <input type="number" value={currentCost} onChange={(e) => setCurrentCost(Number(e.target.value))} min={100000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={500000} max={50000000} step={100000} value={currentCost} onChange={(e) => setCurrentCost(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Child's Age</label>
                    <input type="number" value={childAge} onChange={(e) => setChildAge(Number(e.target.value))} min={0} max={17}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Education Age</label>
                    <input type="number" value={educationAge} onChange={(e) => setEducationAge(Number(e.target.value))} min={childAge + 1} max={25}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Inflation (%)</label>
                    <input type="number" value={inflation} onChange={(e) => setInflation(Number(e.target.value))} min={3} max={15}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Return (%)</label>
                    <input type="number" value={investmentReturn} onChange={(e) => setInvestmentReturn(Number(e.target.value))} min={5} max={20}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
