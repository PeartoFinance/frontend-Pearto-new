'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Shield, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function InsurancePremiumEstimator() {
    const { formatPrice } = useCurrency();
    const [age, setAge] = useState(35);
    const [coverageAmount, setCoverageAmount] = useState(500000);
    const [term, setTerm] = useState(20);
    const [smoker, setSmoker] = useState(false);
    const [healthRating, setHealthRating] = useState<'excellent' | 'good' | 'average' | 'poor'>('good');

    const results = useMemo(() => {
        // Base rate per $1000 of coverage (simplified)
        let baseRate = 0.15;

        // Age factor
        if (age < 30) baseRate *= 0.7;
        else if (age < 40) baseRate *= 1.0;
        else if (age < 50) baseRate *= 1.5;
        else if (age < 60) baseRate *= 2.5;
        else baseRate *= 4.0;

        // Health factor
        const healthFactors = { excellent: 0.8, good: 1.0, average: 1.3, poor: 1.8 };
        baseRate *= healthFactors[healthRating];

        // Smoker factor
        if (smoker) baseRate *= 2.0;

        // Term factor (longer terms slightly more expensive per year)
        if (term > 20) baseRate *= 1.1;
        if (term > 30) baseRate *= 1.2;

        const annualPremium = (coverageAmount / 1000) * baseRate;
        const monthlyPremium = annualPremium / 12;
        const totalPremiums = annualPremium * term;
        const costPerThousand = annualPremium / (coverageAmount / 1000);

        return {
            monthlyPremium,
            annualPremium,
            totalPremiums,
            costPerThousand,
            dailyCost: monthlyPremium / 30
        };
    }, [age, coverageAmount, term, smoker, healthRating]);

    const formatCurrency = (value: number) => formatPrice(value);

    return (
        <CalculatorLayout
            title="Insurance Premium Estimator"
            description="Estimate life insurance premium costs"
            category="Insurance"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Estimated Monthly Premium</p>
                        <p className="text-4xl font-bold text-blue-600">{formatCurrency(results.monthlyPremium)}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            ~{formatCurrency(results.dailyCost)}/day
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Annual Premium</p>
                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(results.annualPremium)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Over {term} Years</p>
                            <p className="text-xl font-bold text-amber-600">{formatCurrency(results.totalPremiums)}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Coverage Details
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Coverage Amount</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {formatPrice(coverageAmount)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Cost per {formatPrice(1000)}/year</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {formatCurrency(results.costPerThousand)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Term Length</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {term} years
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl flex items-start gap-3 ${smoker ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                        {smoker ? (
                            <>
                                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Smoker Rate Applied</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-500">
                                        Quitting could save ~50% on premiums
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Non-Smoker Discount Applied</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-500">
                                        You're getting the best rate
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Age: {age} years
                    </label>
                    <input
                        type="range"
                        min={18}
                        max={70}
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Coverage Amount ($)
                    </label>
                    <select
                        value={coverageAmount}
                        onChange={(e) => setCoverageAmount(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                        <option value={100000}>{formatPrice(100000)}</option>
                        <option value={250000}>{formatPrice(250000)}</option>
                        <option value={500000}>{formatPrice(500000)}</option>
                        <option value={750000}>{formatPrice(750000)}</option>
                        <option value={1000000}>{formatPrice(1000000)}</option>
                        <option value={2000000}>{formatPrice(2000000)}</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Term Length: {term} years
                    </label>
                    <input
                        type="range"
                        min={10}
                        max={40}
                        step={5}
                        value={term}
                        onChange={(e) => setTerm(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Health Rating
                    </label>
                    <select
                        value={healthRating}
                        onChange={(e) => setHealthRating(e.target.value as typeof healthRating)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="average">Average</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer">
                    <input
                        type="checkbox"
                        checked={smoker}
                        onChange={(e) => setSmoker(e.target.checked)}
                        className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                    />
                    <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tobacco User</span>
                        <p className="text-xs text-slate-500">Used tobacco in last 12 months</p>
                    </div>
                </label>
            </div>
        </CalculatorLayout>
    );
}
