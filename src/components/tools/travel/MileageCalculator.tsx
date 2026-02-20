'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Fuel, Car, Gauge, DollarSign } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function MileageCalculator() {
    const [distance, setDistance] = useState(500);
    const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('miles');
    const [fuelEfficiency, setFuelEfficiency] = useState(30);
    const [efficiencyUnit, setEfficiencyUnit] = useState<'mpg' | 'kml'>('mpg');
    const [fuelPrice, setFuelPrice] = useState(3.50);
    const [fuelPriceUnit, setFuelPriceUnit] = useState<'gallon' | 'liter'>('gallon');
    const { formatPrice } = useCurrency();

    const results = useMemo(() => {
        if (fuelEfficiency <= 0 || distance <= 0) return null;

        let distanceMiles = distanceUnit === 'miles' ? distance : distance * 0.621371;
        let distanceKm = distanceUnit === 'km' ? distance : distance * 1.60934;

        let gallonsNeeded: number;
        let litersNeeded: number;

        if (efficiencyUnit === 'mpg') {
            gallonsNeeded = distanceMiles / fuelEfficiency;
            litersNeeded = gallonsNeeded * 3.78541;
        } else {
            litersNeeded = distanceKm / fuelEfficiency;
            gallonsNeeded = litersNeeded / 3.78541;
        }

        let totalCost: number;
        if (fuelPriceUnit === 'gallon') {
            totalCost = gallonsNeeded * fuelPrice;
        } else {
            totalCost = litersNeeded * fuelPrice;
        }

        const costPerMile = distanceMiles > 0 ? totalCost / distanceMiles : 0;
        const costPerKm = distanceKm > 0 ? totalCost / distanceKm : 0;

        return {
            gallonsNeeded,
            litersNeeded,
            totalCost,
            costPerMile,
            costPerKm,
            distanceMiles,
            distanceKm,
        };
    }, [distance, distanceUnit, fuelEfficiency, efficiencyUnit, fuelPrice, fuelPriceUnit]);

    return (
        <CalculatorLayout
            title="Mileage Calculator"
            description="Calculate fuel needs and cost for your trip"
            category="Travel"
            insights={[
                { label: 'Distance', value: `${distance} ${distanceUnit}` },
                { label: 'Efficiency', value: `${fuelEfficiency} ${efficiencyUnit}`, color: 'text-blue-600' },
                { label: 'Fuel Cost', value: results ? formatPrice(results.totalCost) : '-', color: 'text-emerald-600' },
                { label: 'Cost/Mile', value: results ? formatPrice(results.costPerMile) : '-', color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-4">
                    {!results ? (
                        <div className="text-center p-8 text-slate-400">
                            <Car className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Enter valid values to see results</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                                <Fuel className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">Total Fuel Cost</p>
                                <p className="text-4xl font-bold text-amber-600">{formatPrice(results.totalCost)}</p>
                                <p className="text-sm text-slate-500 mt-1">{distance} {distanceUnit} trip</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Fuel className="w-4 h-4 text-blue-500" />
                                        <p className="text-xs text-slate-500">Fuel Needed</p>
                                    </div>
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                        {results.gallonsNeeded.toFixed(1)} gal
                                    </p>
                                    <p className="text-xs text-slate-400">{results.litersNeeded.toFixed(1)} liters</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                        <p className="text-xs text-slate-500">Total Cost</p>
                                    </div>
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                        {formatPrice(results.totalCost)}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Cost Breakdown</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Cost per mile</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{formatPrice(results.costPerMile)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Cost per km</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{formatPrice(results.costPerKm)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Distance (miles)</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{results.distanceMiles.toFixed(1)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Distance (km)</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{results.distanceKm.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <Gauge className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Fuel-Saving Tips</span>
                                </div>
                                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                                    <li>• Maintain steady speed — use cruise control on highways</li>
                                    <li>• Keep tires properly inflated to improve efficiency by 3%</li>
                                    <li>• Remove excess weight and roof racks when not needed</li>
                                    <li>• Avoid aggressive acceleration and hard braking</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Distance
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {distance} {distanceUnit}
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={distance}
                            onChange={e => setDistance(Number(e.target.value))}
                            min={0}
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                        />
                        <select value={distanceUnit} onChange={e => setDistanceUnit(e.target.value as 'km' | 'miles')}
                            className="px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                            <option value="miles">miles</option>
                            <option value="km">km</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Fuel Efficiency
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {fuelEfficiency} {efficiencyUnit}
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={fuelEfficiency}
                            onChange={e => setFuelEfficiency(Number(e.target.value))}
                            min={0}
                            step={0.1}
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                        />
                        <select value={efficiencyUnit} onChange={e => setEfficiencyUnit(e.target.value as 'mpg' | 'kml')}
                            className="px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                            <option value="mpg">MPG</option>
                            <option value="kml">km/L</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Fuel Price
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {formatPrice(fuelPrice)} / {fuelPriceUnit}
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={fuelPrice}
                            onChange={e => setFuelPrice(Number(e.target.value))}
                            min={0}
                            step={0.01}
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                        />
                        <select value={fuelPriceUnit} onChange={e => setFuelPriceUnit(e.target.value as 'gallon' | 'liter')}
                            className="px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                            <option value="gallon">/ gallon</option>
                            <option value="liter">/ liter</option>
                        </select>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
