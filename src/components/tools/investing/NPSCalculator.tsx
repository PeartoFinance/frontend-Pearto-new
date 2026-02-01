'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import VendorList from '@/components/vendors/VendorList';

export default function NPSCalculator() {
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(60);
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [expectedReturn, setExpectedReturn] = useState(10);
    const [annuityRate, setAnnuityRate] = useState(40);

    const result = useMemo(() => {
        const years = retirementAge - currentAge;
        const months = years * 12;
        const r = expectedReturn / 100 / 12;

        // SIP future value
        const corpusAtRetirement = monthlyInvestment * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);

        // 40% mandatory annuity, 60% lumpsum
        const annuityCorpus = corpusAtRetirement * (annuityRate / 100);
        const lumpsum = corpusAtRetirement * (1 - annuityRate / 100);

        // Estimated monthly pension (assume 6% annuity return)
        const monthlyPension = (annuityCorpus * 0.06) / 12;

        const totalInvestment = monthlyInvestment * months;
        const totalReturns = corpusAtRetirement - totalInvestment;

        // Tax savings (up to 2L per year under 80CCD)
        const yearlyTaxSaving = Math.min(monthlyInvestment * 12, 200000) * 0.3;

        return {
            corpusAtRetirement: Math.round(corpusAtRetirement),
            lumpsum: Math.round(lumpsum),
            annuityCorpus: Math.round(annuityCorpus),
            monthlyPension: Math.round(monthlyPension),
            totalInvestment: Math.round(totalInvestment),
            totalReturns: Math.round(totalReturns),
            yearlyTaxSaving: Math.round(yearlyTaxSaving)
        };
    }, [currentAge, retirementAge, monthlyInvestment, expectedReturn, annuityRate]);



    return (
        <CalculatorLayout
            title="NPS Calculator"
            description="Calculate National Pension System returns and pension"
            category="Retirement"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Total Corpus at {retirementAge}</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            <PriceDisplay amount={result.corpusAtRetirement} />
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Lumpsum ({100 - annuityRate}%)</span>
                            <p className="text-lg font-semibold"><PriceDisplay amount={result.lumpsum} /></p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Monthly Pension</span>
                            <p className="text-lg font-semibold text-emerald-600">
                                <PriceDisplay amount={result.monthlyPension} />
                            </p>
                        </div>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">Yearly Tax Savings (80CCD)</p>
                        <p className="text-lg font-bold text-emerald-600">
                            <PriceDisplay amount={result.yearlyTaxSaving} />
                        </p>
                    </div>
                </div>
            }
            rightColumn={
                <VendorList
                    category="Tax Services"
                    title="NPS Consultants"
                    description="Retirement planning experts"
                />
            }
        >
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Age</label>
                    <input type="number" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))} min={18} max={55}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Retirement Age</label>
                    <input type="number" value={retirementAge} onChange={(e) => setRetirementAge(Number(e.target.value))} min={currentAge + 1} max={75}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly Investment</label>
                <input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} min={500}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={500} max={50000} step={500} value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Return (%)</label>
                    <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} min={6} max={15}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Annuity (%)</label>
                    <input type="number" value={annuityRate} onChange={(e) => setAnnuityRate(Number(e.target.value))} min={40} max={100}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
