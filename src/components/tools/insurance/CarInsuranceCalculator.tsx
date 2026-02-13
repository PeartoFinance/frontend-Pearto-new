'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Car, Calendar, Percent, Shield } from 'lucide-react';

export default function CarInsuranceCalculator() {
    const [carValue, setCarValue] = useState(800000);
    const [carAge, setCarAge] = useState(2);
    const [ncbYears, setNcbYears] = useState(3);
    const [coverType, setCoverType] = useState<'comprehensive' | 'tp'>('comprehensive');

    const result = useMemo(() => {
        // Depreciation based on age
        const depreciationRates: Record<number, number> = { 0: 0, 1: 0.15, 2: 0.20, 3: 0.30, 4: 0.40, 5: 0.50 };
        const depreciation = depreciationRates[Math.min(carAge, 5)] || 0.50;
        const idv = carValue * (1 - depreciation);

        // Base premium (approx 2.5% of IDV for comprehensive)
        let basePremium = coverType === 'comprehensive' ? idv * 0.025 : 2500;

        // NCB discount
        const ncbDiscounts: Record<number, number> = { 0: 0, 1: 0.20, 2: 0.25, 3: 0.35, 4: 0.45, 5: 0.50 };
        const ncbDiscount = ncbDiscounts[Math.min(ncbYears, 5)] || 0;
        const discountAmount = basePremium * ncbDiscount;
        const finalPremium = basePremium - discountAmount + 2500; // +2500 for TP

        return {
            idv: Math.round(idv),
            basePremium: Math.round(basePremium),
            ncbDiscount: Math.round(ncbDiscount * 100),
            discountAmount: Math.round(discountAmount),
            finalPremium: Math.round(finalPremium)
        };
    }, [carValue, carAge, ncbYears, coverType]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Car Insurance Calculator"
            description="Estimate your car insurance premium"
            category="Insurance"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Estimated Premium</p>
                        <p className="text-4xl font-bold text-purple-600">{formatCurrency(result.finalPremium)}</p>
                        <p className="text-sm text-slate-500 mt-1">per year</p>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                            <span className="text-slate-500">IDV (Insured Value)</span>
                            <span className="font-semibold">{formatCurrency(result.idv)}</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                            <span className="text-slate-500">NCB Discount ({result.ncbDiscount}%)</span>
                            <span className="font-semibold text-emerald-600">-{formatCurrency(result.discountAmount)}</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cover Type</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setCoverType('comprehensive')} className={`py-3 px-4 rounded-lg font-medium transition-colors ${coverType === 'comprehensive' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                        Comprehensive
                    </button>
                    <button onClick={() => setCoverType('tp')} className={`py-3 px-4 rounded-lg font-medium transition-colors ${coverType === 'tp' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                        Third Party
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Car Value (Ex-Showroom)</label>
                <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" value={carValue} onChange={(e) => setCarValue(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                </div>
                <input type="range" min={200000} max={5000000} step={50000} value={carValue} onChange={(e) => setCarValue(Number(e.target.value))} className="w-full mt-2 accent-purple-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Car Age (Years)</label>
                <input type="range" min={0} max={10} value={carAge} onChange={(e) => setCarAge(Number(e.target.value))} className="w-full accent-purple-500" />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>New</span>
                    <span className="font-medium text-purple-600">{carAge} years</span>
                    <span>10+</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">NCB Years (No Claim Bonus)</label>
                <input type="range" min={0} max={5} value={ncbYears} onChange={(e) => setNcbYears(Number(e.target.value))} className="w-full accent-purple-500" />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0 (No NCB)</span>
                    <span className="font-medium text-purple-600">{ncbYears} years</span>
                    <span>5+ (50%)</span>
                </div>
            </div>
        </CalculatorLayout>
    );
}
