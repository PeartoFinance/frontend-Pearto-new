'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Home, Percent } from 'lucide-react';

export default function StampDutyCalculator() {
    const [propertyValue, setPropertyValue] = useState(5000000);
    const [state, setState] = useState<'maharashtra' | 'karnataka' | 'delhi' | 'tamilnadu' | 'telangana'>('maharashtra');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [isFirstProperty, setIsFirstProperty] = useState(true);

    const result = useMemo(() => {
        // Stamp duty rates by state (approximate)
        const rates: Record<string, { male: number; female: number; registration: number }> = {
            maharashtra: { male: 6, female: 5, registration: 1 },
            karnataka: { male: 5.6, female: 5.6, registration: 1 },
            delhi: { male: 6, female: 4, registration: 1 },
            tamilnadu: { male: 7, female: 7, registration: 1 },
            telangana: { male: 6, female: 5, registration: 0.5 }
        };

        const stateRates = rates[state];
        const stampDutyRate = gender === 'male' ? stateRates.male : stateRates.female;
        const stampDuty = propertyValue * (stampDutyRate / 100);
        const registrationFee = propertyValue * (stateRates.registration / 100);
        const totalCost = stampDuty + registrationFee;
        const totalPropertyCost = propertyValue + totalCost;

        return {
            stampDuty: Math.round(stampDuty),
            stampDutyRate,
            registrationFee: Math.round(registrationFee),
            registrationRate: stateRates.registration,
            totalCost: Math.round(totalCost),
            totalPropertyCost: Math.round(totalPropertyCost)
        };
    }, [propertyValue, state, gender]);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Stamp Duty Calculator"
            description="Calculate stamp duty and registration charges"
            category="Real Estate"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Total Government Charges</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.totalCost)}</p>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                            <span className="text-slate-500">Stamp Duty ({result.stampDutyRate}%)</span>
                            <span className="font-semibold">{formatCurrency(result.stampDuty)}</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                            <span className="text-slate-500">Registration ({result.registrationRate}%)</span>
                            <span className="font-semibold">{formatCurrency(result.registrationFee)}</span>
                        </div>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Property Cost</p>
                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(result.totalPropertyCost)}</p>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Property Value</label>
                <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} min={100000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={500000} max={50000000} step={100000} value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">State</label>
                <select value={state} onChange={(e) => setState(e.target.value as typeof state)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500">
                    <option value="maharashtra">Maharashtra</option>
                    <option value="karnataka">Karnataka</option>
                    <option value="delhi">Delhi</option>
                    <option value="tamilnadu">Tamil Nadu</option>
                    <option value="telangana">Telangana</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Buyer Gender</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setGender('male')} className={`py-3 px-4 rounded-lg font-medium ${gender === 'male' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Male</button>
                    <button onClick={() => setGender('female')} className={`py-3 px-4 rounded-lg font-medium ${gender === 'female' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Female</button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Women get reduced stamp duty in some states</p>
            </div>
        </CalculatorLayout>
    );
}
