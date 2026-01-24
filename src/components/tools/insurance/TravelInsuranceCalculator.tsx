'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Plane, Shield, DollarSign, Calendar, Users, AlertTriangle } from 'lucide-react';

type CoverageType = 'basic' | 'standard' | 'comprehensive';
type TripType = 'domestic' | 'international';
type TravelerAge = 'under30' | '30to50' | '50to65' | 'over65';

export default function TravelInsuranceCalculator() {
    const [tripCost, setTripCost] = useState(3000);
    const [tripDuration, setTripDuration] = useState(7);
    const [coverageType, setCoverageType] = useState<CoverageType>('standard');
    const [tripType, setTripType] = useState<TripType>('international');
    const [travelers, setTravelers] = useState(2);
    const [travelerAge, setTravelerAge] = useState<TravelerAge>('30to50');
    const [includeCancel, setIncludeCancel] = useState(true);
    const [includeMedical, setIncludeMedical] = useState(true);
    const [includeBaggage, setIncludeBaggage] = useState(true);

    const result = useMemo(() => {
        // Base rates per day
        const baseRates: Record<CoverageType, number> = {
            basic: 3,
            standard: 6,
            comprehensive: 12
        };

        // Trip type multiplier
        const tripMultiplier = tripType === 'international' ? 1.5 : 1;

        // Age multiplier
        const ageMultipliers: Record<TravelerAge, number> = {
            under30: 0.8,
            '30to50': 1,
            '50to65': 1.4,
            over65: 2.0
        };

        // Calculate base premium
        let dailyRate = baseRates[coverageType] * tripMultiplier * ageMultipliers[travelerAge];
        let basePremium = dailyRate * tripDuration * travelers;

        // Add-on costs
        const cancelCost = includeCancel ? tripCost * 0.05 : 0; // 5% of trip cost
        const medicalCost = includeMedical ? (tripType === 'international' ? 50 : 20) * travelers : 0;
        const baggageCost = includeBaggage ? 15 * travelers : 0;

        const totalPremium = basePremium + cancelCost + medicalCost + baggageCost;

        // Coverage amounts
        const coverageAmounts: Record<CoverageType, { medical: number; baggage: number; cancel: number }> = {
            basic: { medical: 10000, baggage: 500, cancel: tripCost * 0.5 },
            standard: { medical: 50000, baggage: 1500, cancel: tripCost },
            comprehensive: { medical: 250000, baggage: 3000, cancel: tripCost * 1.5 }
        };

        const coverage = coverageAmounts[coverageType];

        // Cost per day per person
        const costPerDayPerPerson = totalPremium / tripDuration / travelers;

        return {
            totalPremium: Math.round(totalPremium),
            basePremium: Math.round(basePremium),
            cancelCost: Math.round(cancelCost),
            medicalCost: Math.round(medicalCost),
            baggageCost: Math.round(baggageCost),
            coverage,
            costPerDayPerPerson: costPerDayPerPerson.toFixed(2),
            percentOfTrip: ((totalPremium / tripCost) * 100).toFixed(1)
        };
    }, [tripCost, tripDuration, coverageType, tripType, travelers, travelerAge, includeCancel, includeMedical, includeBaggage]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

    return (
        <CalculatorLayout
            title="Travel Insurance Calculator"
            description="Estimate travel insurance costs and coverage"
            category="Insurance"
            results={
                <div className="space-y-4">
                    {/* Premium Summary */}
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                        <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Estimated Premium</p>
                        <p className="text-4xl font-bold text-blue-600">{formatCurrency(result.totalPremium)}</p>
                        <p className="text-sm text-slate-500 mt-1">
                            ${result.costPerDayPerPerson}/day per person • {result.percentOfTrip}% of trip
                        </p>
                    </div>

                    {/* Premium Breakdown */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Premium Breakdown
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Base Coverage</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(result.basePremium)}</span>
                            </div>
                            {includeCancel && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Trip Cancellation</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(result.cancelCost)}</span>
                                </div>
                            )}
                            {includeMedical && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Medical Coverage</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(result.medicalCost)}</span>
                                </div>
                            )}
                            {includeBaggage && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Baggage Protection</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(result.baggageCost)}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Total</span>
                                <span className="font-bold text-blue-600">{formatCurrency(result.totalPremium)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Coverage Limits */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Medical</p>
                            <p className="text-sm font-bold text-emerald-600">{formatCurrency(result.coverage.medical)}</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Baggage</p>
                            <p className="text-sm font-bold text-purple-600">{formatCurrency(result.coverage.baggage)}</p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Cancel</p>
                            <p className="text-sm font-bold text-amber-600">{formatCurrency(result.coverage.cancel)}</p>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-700 dark:text-amber-400">
                                <p className="font-medium mb-1">Important Tips:</p>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Buy insurance within 14-21 days of booking for best rates</li>
                                    <li>Check if your credit card offers travel protection</li>
                                    <li>Review policy exclusions carefully</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Trip Cost ($)
                        </label>
                        <input
                            type="number"
                            value={tripCost}
                            onChange={(e) => setTripCost(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Duration (days)
                        </label>
                        <input
                            type="number"
                            value={tripDuration}
                            onChange={(e) => setTripDuration(Number(e.target.value))}
                            min={1}
                            max={365}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Trip Type
                        </label>
                        <select
                            value={tripType}
                            onChange={(e) => setTripType(e.target.value as TripType)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value="domestic">Domestic</option>
                            <option value="international">International</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Travelers
                        </label>
                        <input
                            type="number"
                            value={travelers}
                            onChange={(e) => setTravelers(Number(e.target.value))}
                            min={1}
                            max={10}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Coverage Level
                        </label>
                        <select
                            value={coverageType}
                            onChange={(e) => setCoverageType(e.target.value as CoverageType)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value="basic">Basic</option>
                            <option value="standard">Standard</option>
                            <option value="comprehensive">Comprehensive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Traveler Age
                        </label>
                        <select
                            value={travelerAge}
                            onChange={(e) => setTravelerAge(e.target.value as TravelerAge)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value="under30">Under 30</option>
                            <option value="30to50">30-50</option>
                            <option value="50to65">50-65</option>
                            <option value="over65">Over 65</option>
                        </select>
                    </div>
                </div>

                {/* Coverage Options */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Include Coverage:</p>
                    {[
                        { state: includeCancel, setter: setIncludeCancel, label: 'Trip Cancellation' },
                        { state: includeMedical, setter: setIncludeMedical, label: 'Medical Emergency' },
                        { state: includeBaggage, setter: setIncludeBaggage, label: 'Baggage Protection' },
                    ].map(({ state, setter, label }) => (
                        <label key={label} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={state}
                                onChange={(e) => setter(e.target.checked)}
                                className="w-4 h-4 text-blue-500 rounded"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
