'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Dumbbell, Heart, Activity } from 'lucide-react';

export default function TargetHeartRate() {
    const [age, setAge] = useState(30);
    const [restingHR, setRestingHR] = useState(70);

    const results = useMemo(() => {
        const maxHR = 220 - age;
        const hrReserve = maxHR - restingHR;

        const zones = [
            { name: 'Rest/Recovery', min: 50, max: 60, color: 'bg-blue-100 text-blue-700', desc: 'Light activity, warm-up' },
            { name: 'Fat Burn', min: 60, max: 70, color: 'bg-emerald-100 text-emerald-700', desc: 'Weight loss zone' },
            { name: 'Aerobic', min: 70, max: 80, color: 'bg-amber-100 text-amber-700', desc: 'Cardio endurance' },
            { name: 'Anaerobic', min: 80, max: 90, color: 'bg-orange-100 text-orange-700', desc: 'Performance training' },
            { name: 'Maximum', min: 90, max: 100, color: 'bg-red-100 text-red-700', desc: 'Peak intensity' },
        ];

        // Karvonen formula: Target HR = RestingHR + (HRReserve × Intensity%)
        const zonesWithHR = zones.map(zone => ({
            ...zone,
            hrMin: Math.round(restingHR + (hrReserve * zone.min / 100)),
            hrMax: Math.round(restingHR + (hrReserve * zone.max / 100))
        }));

        return {
            maxHR,
            hrReserve,
            zones: zonesWithHR
        };
    }, [age, restingHR]);

    return (
        <CalculatorLayout
            title="Target Heart Rate Calculator"
            description="Calculate your heart rate training zones"
            category="Health & Medical"
            results={
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">Max Heart Rate</p>
                            <p className="text-3xl font-bold text-red-600">{results.maxHR}</p>
                            <p className="text-xs text-slate-400">bpm</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <Activity className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">HR Reserve</p>
                            <p className="text-3xl font-bold text-emerald-600">{results.hrReserve}</p>
                            <p className="text-xs text-slate-400">bpm</p>
                        </div>
                    </div>

                    {/* Training Zones */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Heart Rate Training Zones
                        </p>
                        <div className="space-y-2">
                            {results.zones.map(zone => (
                                <div key={zone.name} className="flex items-center gap-3 p-2 rounded">
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${zone.color}`}>
                                        {zone.min}-{zone.max}%
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{zone.name}</p>
                                        <p className="text-xs text-slate-400">{zone.desc}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {zone.hrMin}-{zone.hrMax}
                                        </p>
                                        <p className="text-xs text-slate-400">bpm</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Zone Bar */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex rounded-lg overflow-hidden h-8">
                            <div className="bg-blue-400 flex-1 flex items-center justify-center text-xs text-white font-medium">Z1</div>
                            <div className="bg-emerald-400 flex-1 flex items-center justify-center text-xs text-white font-medium">Z2</div>
                            <div className="bg-amber-400 flex-1 flex items-center justify-center text-xs text-white font-medium">Z3</div>
                            <div className="bg-orange-500 flex-1 flex items-center justify-center text-xs text-white font-medium">Z4</div>
                            <div className="bg-red-500 flex-1 flex items-center justify-center text-xs text-white font-medium">Z5</div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>{restingHR}</span>
                            <span>{results.maxHR} bpm</span>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 text-center">
                        Based on Karvonen formula for accurate zone calculation
                    </p>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Age: {age} years
                    </label>
                    <input
                        type="range"
                        min={10}
                        max={90}
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Resting Heart Rate: {restingHR} bpm
                    </label>
                    <input
                        type="range"
                        min={40}
                        max={100}
                        value={restingHR}
                        onChange={(e) => setRestingHR(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                        Measure in the morning before getting up
                    </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2">Typical Resting HR:</p>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <p>• Athletes: 40-60 bpm</p>
                        <p>• Active adults: 60-70 bpm</p>
                        <p>• Average adults: 70-80 bpm</p>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
