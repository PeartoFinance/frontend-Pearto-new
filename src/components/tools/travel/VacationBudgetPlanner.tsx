'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Snowflake, Sun, Calendar, DollarSign } from 'lucide-react';

export default function VacationBudgetPlanner() {
    const [destination, setDestination] = useState('beach');
    const [travelers, setTravelers] = useState(2);
    const [nights, setNights] = useState(7);
    const [accommodationType, setAccommodationType] = useState<'budget' | 'mid' | 'luxury'>('mid');
    const [includeFlights, setIncludeFlights] = useState(true);
    const [flightCost, setFlightCost] = useState(400);
    const [dailyFood, setDailyFood] = useState(80);
    const [dailyActivities, setDailyActivities] = useState(50);

    const results = useMemo(() => {
        // Accommodation costs per night
        const accommodationRates = {
            budget: 80,
            mid: 150,
            luxury: 350
        };

        const nightlyRate = accommodationRates[accommodationType];
        const totalAccommodation = nightlyRate * nights;
        const totalFlights = includeFlights ? flightCost * travelers : 0;
        const totalFood = dailyFood * travelers * (nights + 1);
        const totalActivities = dailyActivities * travelers * nights;
        const transportation = 50 * nights; // Local transport
        const miscellaneous = (totalAccommodation + totalFood) * 0.1; // 10% buffer

        const total = totalAccommodation + totalFlights + totalFood + totalActivities + transportation + miscellaneous;
        const perPerson = total / travelers;
        const perDay = total / nights;

        return {
            totalAccommodation,
            totalFlights,
            totalFood,
            totalActivities,
            transportation,
            miscellaneous,
            total,
            perPerson,
            perDay
        };
    }, [nights, travelers, accommodationType, includeFlights, flightCost, dailyFood, dailyActivities]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

    const categories = [
        { name: 'Accommodation', amount: results.totalAccommodation, color: 'bg-blue-500' },
        { name: 'Flights', amount: results.totalFlights, color: 'bg-emerald-500' },
        { name: 'Food & Dining', amount: results.totalFood, color: 'bg-amber-500' },
        { name: 'Activities', amount: results.totalActivities, color: 'bg-purple-500' },
        { name: 'Transportation', amount: results.transportation, color: 'bg-pink-500' },
        { name: 'Miscellaneous', amount: results.miscellaneous, color: 'bg-slate-500' },
    ].filter(c => c.amount > 0);

    return (
        <CalculatorLayout
            title="Vacation Budget Planner"
            description="Plan and estimate your vacation expenses"
            category="Travel"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl">
                        <Sun className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Estimated Total Budget</p>
                        <p className="text-4xl font-bold text-blue-600">{formatCurrency(results.total)}</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {formatCurrency(results.perPerson)} per person
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Per Night</p>
                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(results.perDay)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Duration</p>
                            <p className="text-xl font-bold text-purple-600">{nights} nights</p>
                        </div>
                    </div>

                    {/* Budget breakdown */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Budget Breakdown
                        </p>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <div key={cat.name} className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                                    <span className="flex-1 text-sm text-slate-600 dark:text-slate-400">
                                        {cat.name}
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {formatCurrency(cat.amount)}
                                    </span>
                                    <span className="text-xs text-slate-400 w-12 text-right">
                                        {((cat.amount / results.total) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual bar */}
                    <div className="flex rounded-lg overflow-hidden h-6">
                        {categories.map(cat => (
                            <div
                                key={cat.name}
                                className={`${cat.color} h-full`}
                                style={{ width: `${(cat.amount / results.total) * 100}%` }}
                                title={cat.name}
                            />
                        ))}
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Travelers
                        </label>
                        <input
                            type="number"
                            value={travelers}
                            onChange={(e) => setTravelers(Math.max(1, Number(e.target.value)))}
                            min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Nights
                        </label>
                        <input
                            type="number"
                            value={nights}
                            onChange={(e) => setNights(Math.max(1, Number(e.target.value)))}
                            min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Accommodation Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['budget', 'mid', 'luxury'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setAccommodationType(type)}
                                className={`py-2 text-sm font-medium rounded-lg transition ${accommodationType === type
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer">
                    <input
                        type="checkbox"
                        checked={includeFlights}
                        onChange={(e) => setIncludeFlights(e.target.checked)}
                        className="w-4 h-4 text-emerald-500 rounded"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Include flights</span>
                </label>

                {includeFlights && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Flight Cost per Person ($)
                        </label>
                        <input
                            type="number"
                            value={flightCost}
                            onChange={(e) => setFlightCost(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Daily Food/Person ($)
                        </label>
                        <input
                            type="number"
                            value={dailyFood}
                            onChange={(e) => setDailyFood(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Daily Activities ($)
                        </label>
                        <input
                            type="number"
                            value={dailyActivities}
                            onChange={(e) => setDailyActivities(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
