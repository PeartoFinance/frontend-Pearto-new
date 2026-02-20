'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Heart, MapPin, AlertTriangle, Shield } from 'lucide-react';

const PRE_EXISTING_CONDITIONS = [
    { id: 'diabetes', label: 'Diabetes', factor: 1.35 },
    { id: 'hypertension', label: 'Hypertension', factor: 1.25 },
    { id: 'heart', label: 'Heart Disease', factor: 1.50 },
    { id: 'asthma', label: 'Asthma / COPD', factor: 1.20 },
    { id: 'thyroid', label: 'Thyroid', factor: 1.10 },
    { id: 'arthritis', label: 'Arthritis', factor: 1.12 },
    { id: 'kidney', label: 'Kidney Issues', factor: 1.40 },
    { id: 'none', label: 'None', factor: 1.0 },
];

export default function ParentsHealthCalculator() {
    const { formatPrice } = useCurrency();
    const [parentAge, setParentAge] = useState(58);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [cityTier, setCityTier] = useState<1 | 2 | 3>(1);
    const [coverAmount, setCoverAmount] = useState(1000000);

    const toggleCondition = (id: string) => {
        if (id === 'none') {
            setSelectedConditions([]);
            return;
        }
        setSelectedConditions(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev.filter(c => c !== 'none'), id]
        );
    };

    const result = useMemo(() => {
        // Age factor
        let ageFactor = 1;
        if (parentAge < 45) ageFactor = 1;
        else if (parentAge < 50) ageFactor = 1.3;
        else if (parentAge < 55) ageFactor = 1.6;
        else if (parentAge < 60) ageFactor = 2.0;
        else if (parentAge < 65) ageFactor = 2.5;
        else if (parentAge < 70) ageFactor = 3.2;
        else ageFactor = 4.0;

        // Conditions factor (multiplicative)
        let conditionFactor = 1;
        selectedConditions.forEach(id => {
            const cond = PRE_EXISTING_CONDITIONS.find(c => c.id === id);
            if (cond) conditionFactor *= cond.factor;
        });

        // City tier factor
        const cityFactor = cityTier === 1 ? 1.25 : cityTier === 2 ? 1.0 : 0.8;

        // Base rate: ₹600 per lakh
        const coverInLakhs = coverAmount / 100000;
        const basePremium = coverInLakhs * 600;
        const annualPremium = Math.round(basePremium * ageFactor * conditionFactor * cityFactor);
        const gst = Math.round(annualPremium * 0.18);
        const totalPremium = annualPremium + gst;
        const monthlyPremium = Math.round(totalPremium / 12);

        // Recommended cover
        let recommendedCover = 500000;
        if (parentAge < 50) recommendedCover = 1000000;
        else if (parentAge < 60) recommendedCover = 1500000;
        else if (parentAge < 65) recommendedCover = 2000000;
        else recommendedCover = 2500000;

        if (selectedConditions.length > 0) recommendedCover = Math.round(recommendedCover * 1.5);

        // Tips
        const tips: string[] = [];
        if (parentAge >= 60) tips.push('Consider a super top-up plan to extend coverage affordably.');
        if (selectedConditions.includes('diabetes') || selectedConditions.includes('hypertension'))
            tips.push('Look for policies with no co-pay on pre-existing conditions after waiting period.');
        if (selectedConditions.includes('heart'))
            tips.push('Ensure the policy covers cardiac procedures including angioplasty & bypass.');
        if (parentAge >= 65) tips.push('Check for policies specifically designed for senior citizens.');
        if (cityTier === 3) tips.push('Hospital network may be limited in Tier 3 cities — verify cashless network.');
        if (selectedConditions.length === 0) tips.push('Buying early without pre-existing conditions gives the best rates.');
        if (tips.length === 0) tips.push('Review your policy annually as healthcare costs increase.');

        return {
            basePremium: Math.round(basePremium * ageFactor * conditionFactor * cityFactor),
            gst,
            totalPremium,
            monthlyPremium,
            recommendedCover,
            tips,
            conditionFactor: Math.round((conditionFactor - 1) * 100),
        };
    }, [parentAge, selectedConditions, cityTier, coverAmount]);

    // Donut: premium composition
    const premiumBase = Math.round(result.basePremium * 0.5);
    const premiumAge = Math.round(result.basePremium * 0.25);
    const premiumConditions = Math.round(result.basePremium * 0.15);
    const premiumCity = Math.round(result.basePremium * 0.10);
    const donutSegments = [
        { label: 'Base', value: 50, color: '#3b82f6' },
        { label: 'Age Factor', value: 25, color: '#f59e0b' },
        { label: 'Conditions', value: 15, color: '#ef4444' },
        { label: 'City Tier', value: 10, color: '#10b981' },
    ];
    const r = 42, circ = 2 * Math.PI * r;
    let cumulativeOffset = 0;

    return (
        <CalculatorLayout
            title="Parents Health Insurance"
            description="Estimate health insurance premium for parents based on age, conditions, and location"
            category="Insurance"
            insights={[
                { label: 'Annual Premium', value: formatPrice(result.totalPremium), color: 'text-purple-600' },
                { label: 'Monthly', value: formatPrice(result.monthlyPremium) },
                { label: 'Recommended Cover', value: formatPrice(result.recommendedCover), color: 'text-emerald-600' },
                { label: 'Condition Loading', value: `+${result.conditionFactor}%`, color: 'text-rose-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Main display */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200/60 dark:border-purple-800/40">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Estimated Annual Premium</p>
                        <p className="text-4xl font-bold text-purple-600">{formatPrice(result.totalPremium)}</p>
                        <p className="text-sm text-slate-500 mt-1">{formatPrice(result.monthlyPremium)}/month (incl. 18% GST)</p>
                    </div>

                    {/* Donut chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="110" height="110" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            {donutSegments.map((seg, i) => {
                                const segLen = (seg.value / 100) * circ;
                                const rotation = -90 + (cumulativeOffset / 100) * 360;
                                cumulativeOffset += seg.value;
                                return (
                                    <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="8" strokeDasharray={`${segLen} ${circ - segLen}`} strokeLinecap="butt" transform={`rotate(${rotation} 50 50)`} />
                                );
                            })}
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[9px] font-bold">Premium</text>
                            <text x="50" y="58" textAnchor="middle" className="fill-slate-500 text-[7px]">Factors</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Premium Factors</p>
                            {donutSegments.map((seg, i) => (
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
                            <span className="text-xs text-slate-500 dark:text-slate-400">Base Premium</span>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatPrice(result.basePremium)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">GST (18%)</span>
                            <p className="text-lg font-semibold text-amber-600">{formatPrice(result.gst)}</p>
                        </div>
                    </div>

                    {/* Recommended cover */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-4">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Recommended Cover</p>
                        <p className="text-xl font-bold text-emerald-600">{formatPrice(result.recommendedCover)}</p>
                        <p className="text-[11px] text-emerald-600/70 mt-1">Based on parent&apos;s age and health conditions</p>
                    </div>

                    {/* Tips */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Tips & Recommendations</p>
                        <div className="space-y-2">
                            {result.tips.map((tip, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="text-amber-500 mt-0.5">💡</span>
                                    <span>{tip}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            {/* Parent's Age */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parent&apos;s Age</label>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">{parentAge} years</span>
                </div>
                <input type="number" value={parentAge} onChange={e => setParentAge(Number(e.target.value))} min={40} max={80}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={40} max={80} value={parentAge} onChange={e => setParentAge(Number(e.target.value))} className="w-full mt-2 accent-purple-500" />
            </div>

            {/* Pre-existing Conditions */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pre-existing Conditions</label>
                <div className="grid grid-cols-2 gap-2">
                    {PRE_EXISTING_CONDITIONS.map(cond => (
                        <button
                            key={cond.id}
                            onClick={() => toggleCondition(cond.id)}
                            className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors text-left ${
                                (cond.id === 'none' && selectedConditions.length === 0) || selectedConditions.includes(cond.id)
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            {cond.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* City Tier */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City Tier</label>
                <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 3] as const).map(tier => (
                        <button key={tier} onClick={() => setCityTier(tier)}
                            className={`py-3 px-4 rounded-lg font-medium transition-colors ${cityTier === tier ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                            Tier {tier}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                    {cityTier === 1 ? 'Metro cities (Mumbai, Delhi, Bangalore...)' : cityTier === 2 ? 'Mid-size cities (Jaipur, Lucknow...)' : 'Small towns & rural areas'}
                </p>
            </div>

            {/* Cover Amount */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cover Amount</label>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(coverAmount)}</span>
                </div>
                <select value={coverAmount} onChange={e => setCoverAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm">
                    <option value={300000}>₹3 Lakhs</option>
                    <option value={500000}>₹5 Lakhs</option>
                    <option value={1000000}>₹10 Lakhs</option>
                    <option value={1500000}>₹15 Lakhs</option>
                    <option value={2000000}>₹20 Lakhs</option>
                    <option value={2500000}>₹25 Lakhs</option>
                    <option value={5000000}>₹50 Lakhs</option>
                    <option value={10000000}>₹1 Crore</option>
                </select>
            </div>
        </CalculatorLayout>
    );
}
