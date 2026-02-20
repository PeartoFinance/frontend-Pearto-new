'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Shield, Calendar, HeartPulse, User } from 'lucide-react';

export default function TermInsuranceCalculator() {
    const { formatPrice } = useCurrency();
    const [age, setAge] = useState(30);
    const [sumAssured, setSumAssured] = useState(10000000);
    const [policyTerm, setPolicyTerm] = useState(30);
    const [isSmoker, setIsSmoker] = useState(false);
    const [gender, setGender] = useState<'male' | 'female'>('male');

    const result = useMemo(() => {
        // Base rate per 1 Lakh of sum assured (varies by age)
        let baseRatePerLakh = 8;
        if (age < 25) baseRatePerLakh = 5;
        else if (age < 30) baseRatePerLakh = 6;
        else if (age < 35) baseRatePerLakh = 8;
        else if (age < 40) baseRatePerLakh = 12;
        else if (age < 45) baseRatePerLakh = 18;
        else if (age < 50) baseRatePerLakh = 28;
        else if (age < 55) baseRatePerLakh = 42;
        else baseRatePerLakh = 65;

        // Smoker multiplier
        const smokerMultiplier = isSmoker ? 1.5 : 1;

        // Gender multiplier (females statistically lower risk)
        const genderMultiplier = gender === 'female' ? 0.85 : 1;

        // Term factor (longer term = slightly higher rate)
        const termFactor = 1 + (policyTerm - 10) * 0.008;

        const sumInLakhs = sumAssured / 100000;
        const annualPremium = Math.round(sumInLakhs * baseRatePerLakh * smokerMultiplier * genderMultiplier * termFactor);
        const monthlyPremium = Math.round(annualPremium / 12);
        const totalPremiumPaid = annualPremium * policyTerm;
        const coverageRatio = totalPremiumPaid > 0 ? Math.round(sumAssured / totalPremiumPaid) : 0;

        return { annualPremium, monthlyPremium, totalPremiumPaid, coverageRatio };
    }, [age, sumAssured, policyTerm, isSmoker, gender]);

    // Donut chart: premium vs coverage
    const premiumPct = result.totalPremiumPaid > 0
        ? Math.min(Math.round((result.totalPremiumPaid / sumAssured) * 100), 100)
        : 0;
    const coveragePct = 100 - premiumPct;
    const r = 45, circ = 2 * Math.PI * r;
    const premiumOffset = circ - (premiumPct / 100) * circ;

    return (
        <CalculatorLayout
            title="Term Insurance Calculator"
            description="Estimate your term insurance premium based on age, coverage, and lifestyle factors"
            category="Insurance"
            insights={[
                { label: 'Annual Premium', value: formatPrice(result.annualPremium), color: 'text-purple-600' },
                { label: 'Monthly', value: formatPrice(result.monthlyPremium) },
                { label: 'Coverage Ratio', value: `${result.coverageRatio}x`, color: 'text-emerald-600' },
                { label: 'Total Paid', value: formatPrice(result.totalPremiumPaid), color: 'text-blue-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Main display */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200/60 dark:border-purple-800/40">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Estimated Annual Premium</p>
                        <p className="text-4xl font-bold text-purple-600">{formatPrice(result.annualPremium)}</p>
                        <p className="text-sm text-slate-500 mt-1">{formatPrice(result.monthlyPremium)}/month</p>
                    </div>

                    {/* Donut chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 flex items-center gap-6">
                        <svg width="110" height="110" viewBox="0 0 110 110" className="flex-shrink-0">
                            <circle cx="55" cy="55" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-700" />
                            <circle cx="55" cy="55" r={r} fill="none" stroke="#a855f7" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={premiumOffset} strokeLinecap="round" transform="rotate(-90 55 55)" />
                            <text x="55" y="52" textAnchor="middle" className="fill-slate-900 dark:fill-white text-sm font-bold">{result.coverageRatio}x</text>
                            <text x="55" y="66" textAnchor="middle" className="fill-slate-500 text-[9px]">Coverage</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Sum Assured</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(sumAssured)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Total Premium</span>
                                </div>
                                <span className="text-sm font-semibold text-purple-600">{formatPrice(result.totalPremiumPaid)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Coverage Ratio</span>
                                </div>
                                <span className="text-sm font-semibold text-blue-600">{result.coverageRatio}x</span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Annual Premium</span>
                            <p className="text-lg font-semibold text-purple-600">{formatPrice(result.annualPremium)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Monthly Premium</span>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatPrice(result.monthlyPremium)}</p>
                        </div>
                    </div>

                    {/* Info card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-sm text-slate-500">
                        <p>Cover: {formatPrice(sumAssured)} | Term: {policyTerm} yrs | {isSmoker ? 'Smoker' : 'Non-Smoker'} | {gender === 'male' ? 'Male' : 'Female'}</p>
                    </div>
                </div>
            }
        >
            {/* Age */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">{age} years</span>
                </div>
                <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} min={18} max={65}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={18} max={65} value={age} onChange={e => setAge(Number(e.target.value))} className="w-full mt-2 accent-purple-500" />
            </div>

            {/* Sum Assured */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sum Assured</label>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(sumAssured)}</span>
                </div>
                <input type="number" value={sumAssured} onChange={e => setSumAssured(Number(e.target.value))} min={500000} step={500000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={500000} max={50000000} step={500000} value={sumAssured} onChange={e => setSumAssured(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Policy Term */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Policy Term</label>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{policyTerm} years</span>
                </div>
                <input type="number" value={policyTerm} onChange={e => setPolicyTerm(Number(e.target.value))} min={5} max={40}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={5} max={40} value={policyTerm} onChange={e => setPolicyTerm(Number(e.target.value))} className="w-full mt-2 accent-blue-500" />
            </div>

            {/* Smoker Status */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Smoker Status</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setIsSmoker(false)}
                        className={`py-3 px-4 rounded-lg font-medium transition-colors ${!isSmoker ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                        Non-Smoker
                    </button>
                    <button onClick={() => setIsSmoker(true)}
                        className={`py-3 px-4 rounded-lg font-medium transition-colors ${isSmoker ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                        Smoker
                    </button>
                </div>
            </div>

            {/* Gender */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setGender('male')}
                        className={`py-3 px-4 rounded-lg font-medium transition-colors ${gender === 'male' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                        Male
                    </button>
                    <button onClick={() => setGender('female')}
                        className={`py-3 px-4 rounded-lg font-medium transition-colors ${gender === 'female' ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                        Female
                    </button>
                </div>
            </div>
        </CalculatorLayout>
    );
}
