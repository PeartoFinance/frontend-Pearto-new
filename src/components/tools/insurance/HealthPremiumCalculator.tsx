'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Heart, Users, MapPin } from 'lucide-react';

export default function HealthPremiumCalculator() {
    const [age, setAge] = useState(35);
    const [sumInsured, setSumInsured] = useState(500000);
    const [familySize, setFamilySize] = useState<'individual' | 'floater'>('floater');
    const [cityTier, setCityTier] = useState<1 | 2 | 3>(1);

    const result = useMemo(() => {
        // Base premium factors by age group
        let ageFactor = 1;
        if (age < 25) ageFactor = 0.7;
        else if (age < 35) ageFactor = 0.85;
        else if (age < 45) ageFactor = 1;
        else if (age < 55) ageFactor = 1.3;
        else if (age < 65) ageFactor = 1.8;
        else ageFactor = 2.5;

        // Sum insured factor (higher cover = slightly lower per-lakh rate)
        const coverFactor = sumInsured >= 1000000 ? 0.9 : sumInsured >= 500000 ? 1 : 1.1;

        // Family factor
        const familyFactor = familySize === 'floater' ? 1.5 : 1;

        // City tier factor
        const cityFactor = cityTier === 1 ? 1.2 : cityTier === 2 ? 1 : 0.85;

        // Base rate: ₹500 per lakh
        const baseRate = (sumInsured / 100000) * 500;
        const annualPremium = baseRate * ageFactor * coverFactor * familyFactor * cityFactor;
        const gst = annualPremium * 0.18;
        const totalPremium = annualPremium + gst;
        const monthlyPremium = totalPremium / 12;

        return {
            basePremium: Math.round(annualPremium),
            gst: Math.round(gst),
            totalPremium: Math.round(totalPremium),
            monthlyPremium: Math.round(monthlyPremium)
        };
    }, [age, sumInsured, familySize, cityTier]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Health Insurance Premium"
            description="Estimate your health insurance premium"
            category="Insurance"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Annual Premium</p>
                        <p className="text-4xl font-bold text-purple-600">{formatCurrency(result.totalPremium)}</p>
                        <p className="text-sm text-slate-500 mt-1">{formatCurrency(result.monthlyPremium)}/month</p>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                            <span className="text-slate-500">Base Premium</span>
                            <span className="font-semibold">{formatCurrency(result.basePremium)}</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                            <span className="text-slate-500">GST (18%)</span>
                            <span className="font-semibold">{formatCurrency(result.gst)}</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-sm text-slate-500">
                        <p>Cover: {formatCurrency(sumInsured)} | {familySize === 'floater' ? 'Family Floater' : 'Individual'}</p>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Age</label>
                <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} min={18} max={75}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={18} max={75} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full mt-2 accent-purple-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sum Insured</label>
                <select value={sumInsured} onChange={(e) => setSumInsured(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500">
                    <option value={300000}>₹3 Lakhs</option>
                    <option value={500000}>₹5 Lakhs</option>
                    <option value={1000000}>₹10 Lakhs</option>
                    <option value={2000000}>₹20 Lakhs</option>
                    <option value={5000000}>₹50 Lakhs</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Plan Type</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setFamilySize('individual')} className={`py-3 px-4 rounded-lg font-medium transition ${familySize === 'individual' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        Individual
                    </button>
                    <button onClick={() => setFamilySize('floater')} className={`py-3 px-4 rounded-lg font-medium transition ${familySize === 'floater' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        Family Floater
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City Tier</label>
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((tier) => (
                        <button key={tier} onClick={() => setCityTier(tier as 1 | 2 | 3)} className={`py-2 px-3 rounded-lg font-medium transition ${cityTier === tier ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            Tier {tier}
                        </button>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
