'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Globe, Shield, Calendar, HeartPulse } from 'lucide-react';

const COUNTRIES = [
    { code: 'US', name: 'United States', factor: 1.0 },
    { code: 'UK', name: 'United Kingdom', factor: 1.05 },
    { code: 'AE', name: 'UAE', factor: 0.95 },
    { code: 'SG', name: 'Singapore', factor: 1.1 },
    { code: 'CA', name: 'Canada', factor: 1.08 },
    { code: 'AU', name: 'Australia', factor: 1.12 },
    { code: 'DE', name: 'Germany', factor: 1.06 },
    { code: 'SA', name: 'Saudi Arabia', factor: 0.9 },
    { code: 'QA', name: 'Qatar', factor: 0.92 },
    { code: 'MY', name: 'Malaysia', factor: 0.88 },
    { code: 'OTHER', name: 'Other', factor: 1.15 },
];

export default function NRITermCalculator() {
    const { formatPrice } = useCurrency();
    const [country, setCountry] = useState('US');
    const [age, setAge] = useState(32);
    const [sumAssured, setSumAssured] = useState(20000000);
    const [policyTerm, setPolicyTerm] = useState(25);
    const [isSmoker, setIsSmoker] = useState(false);

    const result = useMemo(() => {
        // Base rate per 1L sum assured by age
        let baseRatePerLakh = 7;
        if (age < 25) baseRatePerLakh = 5;
        else if (age < 30) baseRatePerLakh = 6;
        else if (age < 35) baseRatePerLakh = 7;
        else if (age < 40) baseRatePerLakh = 11;
        else if (age < 45) baseRatePerLakh = 17;
        else if (age < 50) baseRatePerLakh = 26;
        else if (age < 55) baseRatePerLakh = 40;
        else baseRatePerLakh = 60;

        const smokerMultiplier = isSmoker ? 1.5 : 1;
        const termFactor = 1 + (policyTerm - 10) * 0.008;

        const countryInfo = COUNTRIES.find(c => c.code === country) || COUNTRIES[COUNTRIES.length - 1];
        const countryFactor = countryInfo.factor;

        // NRI loading (additional charge for NRI policies)
        const nriLoading = 1.15;

        const sumInLakhs = sumAssured / 100000;
        const annualPremium = Math.round(sumInLakhs * baseRatePerLakh * smokerMultiplier * termFactor * countryFactor * nriLoading);
        const monthlyPremium = Math.round(annualPremium / 12);
        const totalPremiumPaid = annualPremium * policyTerm;
        const coverageRatio = totalPremiumPaid > 0 ? Math.round(sumAssured / totalPremiumPaid) : 0;

        return {
            annualPremium,
            monthlyPremium,
            totalPremiumPaid,
            coverageRatio,
            countryName: countryInfo.name,
            countryFactor,
            nriLoading: Math.round((nriLoading - 1) * 100),
            countryAdjustment: Math.round((countryFactor - 1) * 100),
        };
    }, [country, age, sumAssured, policyTerm, isSmoker]);

    // Donut: premium breakdown
    const basePct = 60;
    const countryPct = 20;
    const nriPct = 20;
    const segments = [
        { label: 'Base Premium', value: basePct, color: '#3b82f6' },
        { label: 'Country Adj.', value: countryPct, color: '#f59e0b' },
        { label: 'NRI Loading', value: nriPct, color: '#8b5cf6' },
    ];
    const r = 42, circ = 2 * Math.PI * r;
    let cumulativeOffset = 0;

    return (
        <CalculatorLayout
            title="NRI Term Insurance Calculator"
            description="Estimate term insurance premium for NRIs with country-based adjustments"
            category="Insurance"
            insights={[
                { label: 'Annual Premium', value: formatPrice(result.annualPremium), color: 'text-purple-600' },
                { label: 'Monthly', value: formatPrice(result.monthlyPremium) },
                { label: 'Country Adj.', value: `${result.countryAdjustment >= 0 ? '+' : ''}${result.countryAdjustment}%`, color: 'text-amber-600' },
                { label: 'Coverage Ratio', value: `${result.coverageRatio}x`, color: 'text-emerald-600' },
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
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="110" height="110" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            {segments.map((seg, i) => {
                                const segLen = (seg.value / 100) * circ;
                                const rotation = -90 + (cumulativeOffset / 100) * 360;
                                cumulativeOffset += seg.value;
                                return (
                                    <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="8" strokeDasharray={`${segLen} ${circ - segLen}`} strokeLinecap="butt" transform={`rotate(${rotation} 50 50)`} />
                                );
                            })}
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[10px] font-bold">{result.coverageRatio}x</text>
                            <text x="50" y="60" textAnchor="middle" className="fill-slate-500 text-[8px]">Cover</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Premium Factors</p>
                            {segments.map((seg, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">{seg.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{seg.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Breakdown cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Sum Assured</span>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatPrice(sumAssured)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Total Premium</span>
                            <p className="text-lg font-semibold text-purple-600">{formatPrice(result.totalPremiumPaid)}</p>
                        </div>
                    </div>

                    {/* Currency note */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                            📌 Country: {result.countryName} — Premium includes {result.nriLoading}% NRI loading and {result.countryAdjustment >= 0 ? '+' : ''}{result.countryAdjustment}% country adjustment. Premiums are payable in INR. Currency conversion rates may vary at the time of payment.
                        </p>
                    </div>
                </div>
            }
        >
            {/* Country of Residence */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Country of Residence</label>
                <select value={country} onChange={e => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm">
                    {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                </select>
            </div>

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
                <input type="number" value={sumAssured} onChange={e => setSumAssured(Number(e.target.value))} min={1000000} step={1000000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1000000} max={100000000} step={1000000} value={sumAssured} onChange={e => setSumAssured(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
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
        </CalculatorLayout>
    );
}
