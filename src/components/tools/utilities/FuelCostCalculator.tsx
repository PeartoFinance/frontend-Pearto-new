'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Car, DollarSign, Fuel } from 'lucide-react';

export default function FuelCostCalculator() {
    const [distance, setDistance] = useState(500);
    const [mileage, setMileage] = useState(15);
    const [fuelPrice, setFuelPrice] = useState(105);

    const result = useMemo(() => {
        const fuelRequired = distance / mileage;
        const totalCost = fuelRequired * fuelPrice;
        const costPerKm = totalCost / distance;

        return {
            fuelRequired: Math.round(fuelRequired * 100) / 100,
            totalCost: Math.round(totalCost),
            costPerKm: Math.round(costPerKm * 100) / 100
        };
    }, [distance, mileage, fuelPrice]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Fuel Cost Calculator"
            description="Calculate fuel cost for your road trip"
            category="Utilities"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Total Fuel Cost</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.totalCost)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <Fuel className="w-4 h-4 text-amber-500" />
                                <span className="text-xs text-slate-500">Fuel Required</span>
                            </div>
                            <p className="text-lg font-semibold">{result.fuelRequired} L</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Cost Per Km</span>
                            <p className="text-lg font-semibold text-emerald-600">₹{result.costPerKm}</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Distance (km)</label>
                <input type="number" value={distance} onChange={(e) => setDistance(Number(e.target.value))} min={1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={10} max={5000} step={10} value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Vehicle Mileage (km/L)</label>
                <input type="number" value={mileage} onChange={(e) => setMileage(Number(e.target.value))} min={1} max={50} step={0.5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={5} max={30} step={0.5} value={mileage} onChange={(e) => setMileage(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fuel Price (₹/L)</label>
                <input type="number" value={fuelPrice} onChange={(e) => setFuelPrice(Number(e.target.value))} min={50} max={200} step={1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
