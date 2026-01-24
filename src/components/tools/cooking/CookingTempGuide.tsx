'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Thermometer, UtensilsCrossed, Clock, AlertTriangle } from 'lucide-react';

interface MeatType {
    name: string;
    temps: {
        rare?: number;
        mediumRare?: number;
        medium?: number;
        mediumWell?: number;
        wellDone?: number;
        safe?: number;
    };
}

const MEAT_TYPES: MeatType[] = [
    { name: 'Beef Steak', temps: { rare: 125, mediumRare: 135, medium: 145, mediumWell: 150, wellDone: 160 } },
    { name: 'Ground Beef', temps: { safe: 160 } },
    { name: 'Pork', temps: { medium: 145, wellDone: 160 } },
    { name: 'Chicken Breast', temps: { safe: 165 } },
    { name: 'Chicken Thigh', temps: { safe: 165 } },
    { name: 'Turkey', temps: { safe: 165 } },
    { name: 'Lamb', temps: { rare: 125, mediumRare: 130, medium: 140, mediumWell: 150, wellDone: 160 } },
    { name: 'Fish', temps: { medium: 125, safe: 145 } },
    { name: 'Salmon', temps: { mediumRare: 125, medium: 140 } },
];

export default function CookingTempGuide() {
    const [selectedMeat, setSelectedMeat] = useState<MeatType>(MEAT_TYPES[0]);
    const [currentTemp, setCurrentTemp] = useState<number | ''>('');

    const status = useMemo(() => {
        if (currentTemp === '') return null;

        const temp = Number(currentTemp);
        const temps = selectedMeat.temps;

        // Find which doneness level we're at
        let level = '';
        let color = '';
        let isCooked = false;

        if (temps.safe) {
            if (temp >= temps.safe) {
                level = 'Safe to Eat';
                color = 'text-emerald-600 bg-emerald-50';
                isCooked = true;
            } else {
                level = 'Not Yet Safe';
                color = 'text-red-600 bg-red-50';
            }
        } else {
            if (temps.rare && temp < temps.rare) {
                level = 'Raw';
                color = 'text-red-600 bg-red-50';
            } else if (temps.rare && temp < (temps.mediumRare || 999)) {
                level = 'Rare';
                color = 'text-pink-600 bg-pink-50';
                isCooked = true;
            } else if (temps.mediumRare && temp < (temps.medium || 999)) {
                level = 'Medium Rare';
                color = 'text-rose-600 bg-rose-50';
                isCooked = true;
            } else if (temps.medium && temp < (temps.mediumWell || temps.wellDone || 999)) {
                level = 'Medium';
                color = 'text-amber-600 bg-amber-50';
                isCooked = true;
            } else if (temps.mediumWell && temp < (temps.wellDone || 999)) {
                level = 'Medium Well';
                color = 'text-orange-600 bg-orange-50';
                isCooked = true;
            } else if (temps.wellDone && temp >= temps.wellDone) {
                level = 'Well Done';
                color = 'text-slate-600 bg-slate-100';
                isCooked = true;
            }
        }

        return { level, color, isCooked };
    }, [currentTemp, selectedMeat]);

    return (
        <CalculatorLayout
            title="Cooking Temperature Guide"
            description="Check safe cooking temperatures for meat"
            category="Cooking & Recipes"
            results={
                <div className="space-y-4">
                    {status ? (
                        <div className={`text-center p-6 rounded-xl ${status.color}`}>
                            <Thermometer className="w-8 h-8 mx-auto mb-2 opacity-80" />
                            <p className="text-sm opacity-80">{selectedMeat.name}</p>
                            <p className="text-4xl font-bold">{currentTemp}°F</p>
                            <p className="text-lg font-medium mt-2">{status.level}</p>
                        </div>
                    ) : (
                        <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <Thermometer className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">Enter temperature to check doneness</p>
                        </div>
                    )}

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            {selectedMeat.name} Temperature Guide
                        </p>
                        <div className="space-y-2">
                            {Object.entries(selectedMeat.temps).map(([key, temp]) => {
                                const isActive = currentTemp !== '' && Number(currentTemp) >= temp;
                                return (
                                    <div
                                        key={key}
                                        className={`flex justify-between items-center p-2 rounded ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                                    >
                                        <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className={`text-sm font-mono font-medium ${isActive ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {temp}°F
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                    Food Safety Note
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                    Let meat rest 3 minutes after cooking. Internal temp will continue rising 5-10°F.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Select Meat Type
                    </label>
                    <select
                        value={selectedMeat.name}
                        onChange={(e) => setSelectedMeat(MEAT_TYPES.find(m => m.name === e.target.value) || MEAT_TYPES[0])}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                        {MEAT_TYPES.map(meat => (
                            <option key={meat.name} value={meat.name}>{meat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Current Temperature (°F)
                    </label>
                    <input
                        type="number"
                        value={currentTemp}
                        onChange={(e) => setCurrentTemp(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Enter thermometer reading"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg"
                    />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2">Quick Reference:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span>• Chicken: 165°F</span>
                        <span>• Beef (med): 145°F</span>
                        <span>• Pork: 145°F</span>
                        <span>• Ground: 160°F</span>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
