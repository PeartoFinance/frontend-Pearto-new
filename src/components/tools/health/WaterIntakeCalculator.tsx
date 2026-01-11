'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Droplet, Heart, Activity } from 'lucide-react';

export default function WaterIntakeCalculator() {
    const [weight, setWeight] = useState(70);
    const [activityLevel, setActivityLevel] = useState<'sedentary' | 'moderate' | 'active' | 'intense'>('moderate');
    const [climate, setClimate] = useState<'normal' | 'hot'>('normal');

    const result = useMemo(() => {
        // Base: 30-35ml per kg body weight
        let baseIntake = weight * 33;

        // Activity adjustment
        const activityMultiplier = {
            sedentary: 1,
            moderate: 1.15,
            active: 1.3,
            intense: 1.5
        }[activityLevel];

        // Climate adjustment
        const climateMultiplier = climate === 'hot' ? 1.2 : 1;

        const totalMl = baseIntake * activityMultiplier * climateMultiplier;
        const liters = totalMl / 1000;
        const glasses = Math.ceil(totalMl / 250); // 250ml glasses

        return {
            liters: Math.round(liters * 10) / 10,
            ml: Math.round(totalMl),
            glasses
        };
    }, [weight, activityLevel, climate]);

    return (
        <CalculatorLayout
            title="Water Intake Calculator"
            description="Calculate your daily water consumption needs"
            category="Health & Fitness"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex justify-center mb-2">
                            <Droplet className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-sm text-slate-500 mb-1">Daily Water Intake</p>
                        <p className="text-4xl font-bold text-blue-600">{result.liters} L</p>
                        <p className="text-sm text-slate-500 mt-1">{result.glasses} glasses (250ml)</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            💡 Tip: Drink water throughout the day, not all at once. Having a glass before meals can help with digestion.
                        </p>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Weight: {weight} kg</label>
                <input type="range" min={30} max={150} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Activity Level</label>
                <div className="grid grid-cols-2 gap-2">
                    {(['sedentary', 'moderate', 'active', 'intense'] as const).map((level) => (
                        <button key={level} onClick={() => setActivityLevel(level)} className={`py-2 px-3 rounded-lg text-sm font-medium ${activityLevel === level ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Climate</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setClimate('normal')} className={`py-3 px-4 rounded-lg font-medium ${climate === 'normal' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Normal</button>
                    <button onClick={() => setClimate('hot')} className={`py-3 px-4 rounded-lg font-medium ${climate === 'hot' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Hot / Humid</button>
                </div>
            </div>
        </CalculatorLayout>
    );
}
