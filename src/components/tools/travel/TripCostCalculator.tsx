'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Car, Fuel, MapPin, DollarSign } from 'lucide-react';

export default function TripCostCalculator() {
    const [distance, setDistance] = useState(500);
    const [fuelEfficiency, setFuelEfficiency] = useState(30);
    const [fuelPrice, setFuelPrice] = useState(3.50);
    const [tolls, setTolls] = useState(20);
    const [parking, setParking] = useState(30);
    const [meals, setMeals] = useState(50);
    const [lodging, setLodging] = useState(150);
    const [nights, setNights] = useState(2);
    const [passengers, setPassengers] = useState(2);

    const costs = useMemo(() => {
        const gallonsNeeded = distance / fuelEfficiency;
        const fuelCost = gallonsNeeded * fuelPrice;
        const totalLodging = lodging * nights;
        const totalMeals = meals * (nights + 1) * passengers;

        const total = fuelCost + tolls + parking + totalMeals + totalLodging;
        const perPerson = passengers > 0 ? total / passengers : total;

        return {
            fuelCost,
            gallonsNeeded,
            tolls,
            parking,
            totalMeals,
            totalLodging,
            total,
            perPerson
        };
    }, [distance, fuelEfficiency, fuelPrice, tolls, parking, meals, lodging, nights, passengers]);

    const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

    return (
        <CalculatorLayout
            title="Trip Cost Calculator"
            description="Estimate the total cost of your road trip"
            category="Travel"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <Car className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Total Trip Cost</p>
                        <p className="text-4xl font-bold text-blue-600">{formatCurrency(costs.total)}</p>
                        <p className="text-sm text-slate-500 mt-1">
                            {formatCurrency(costs.perPerson)} per person
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <Fuel className="w-4 h-4 text-amber-500" />
                                <p className="text-xs text-slate-500">Fuel</p>
                            </div>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                {formatCurrency(costs.fuelCost)}
                            </p>
                            <p className="text-xs text-slate-400">
                                {costs.gallonsNeeded.toFixed(1)} gal
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <p className="text-xs text-slate-500">Tolls & Parking</p>
                            </div>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                {formatCurrency(costs.tolls + costs.parking)}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Cost Breakdown
                        </p>
                        <div className="space-y-2">
                            {[
                                { label: 'Fuel', amount: costs.fuelCost, color: 'bg-amber-500' },
                                { label: 'Lodging', amount: costs.totalLodging, color: 'bg-blue-500' },
                                { label: 'Meals', amount: costs.totalMeals, color: 'bg-emerald-500' },
                                { label: 'Tolls & Parking', amount: costs.tolls + costs.parking, color: 'bg-purple-500' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className="flex-1 text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {formatCurrency(item.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Distance (miles)
                        </label>
                        <input
                            type="number"
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Fuel Economy (MPG)
                        </label>
                        <input
                            type="number"
                            value={fuelEfficiency}
                            onChange={(e) => setFuelEfficiency(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Fuel Price ($/gal)
                        </label>
                        <input
                            type="number"
                            value={fuelPrice}
                            step="0.01"
                            onChange={(e) => setFuelPrice(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Passengers
                        </label>
                        <input
                            type="number"
                            value={passengers}
                            min={1}
                            onChange={(e) => setPassengers(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tolls ($)
                        </label>
                        <input
                            type="number"
                            value={tolls}
                            onChange={(e) => setTolls(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Parking ($)
                        </label>
                        <input
                            type="number"
                            value={parking}
                            onChange={(e) => setParking(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Nights
                        </label>
                        <input
                            type="number"
                            value={nights}
                            min={0}
                            onChange={(e) => setNights(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Lodging/Night ($)
                        </label>
                        <input
                            type="number"
                            value={lodging}
                            onChange={(e) => setLodging(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Meals/Day/Person ($)
                        </label>
                        <input
                            type="number"
                            value={meals}
                            onChange={(e) => setMeals(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
