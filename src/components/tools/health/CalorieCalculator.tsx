'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Flame, Activity, User } from 'lucide-react';

export default function CalorieCalculator() {
    const [age, setAge] = useState(30);
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [height, setHeight] = useState(175);
    const [weight, setWeight] = useState(75);
    const [activity, setActivity] = useState(1.55);
    const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');

    const result = useMemo(() => {
        // BMR using Mifflin-St Jeor formula
        let bmr: number;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        const tdee = bmr * activity;
        let targetCalories = tdee;
        if (goal === 'lose') targetCalories = tdee - 500;
        if (goal === 'gain') targetCalories = tdee + 500;

        // Macro split (protein 30%, carbs 40%, fat 30%)
        const protein = (targetCalories * 0.30) / 4; // 4 cal/g
        const carbs = (targetCalories * 0.40) / 4;
        const fat = (targetCalories * 0.30) / 9; // 9 cal/g

        return {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories: Math.round(targetCalories),
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fat: Math.round(fat)
        };
    }, [age, gender, height, weight, activity, goal]);

    const activityLevels = [
        { value: 1.2, label: 'Sedentary' },
        { value: 1.375, label: 'Light' },
        { value: 1.55, label: 'Moderate' },
        { value: 1.725, label: 'Active' },
        { value: 1.9, label: 'Very Active' },
    ];

    return (
        <CalculatorLayout
            title="Calorie Calculator"
            description="Calculate your daily calorie needs based on your goals"
            category="Health & Fitness"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Daily Calories</p>
                        <p className="text-5xl font-bold text-red-600">{result.targetCalories}</p>
                        <p className="text-sm text-slate-500 mt-1">kcal/day to {goal === 'lose' ? 'lose weight' : goal === 'gain' ? 'gain weight' : 'maintain'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">BMR</span>
                            <p className="text-lg font-semibold">{result.bmr} kcal</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">TDEE</span>
                            <p className="text-lg font-semibold">{result.tdee} kcal</p>
                        </div>
                    </div>

                    {/* Macros */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Daily Macros</p>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-xl font-bold text-blue-600">{result.protein}g</p>
                                <p className="text-xs text-slate-500">Protein</p>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <p className="text-xl font-bold text-amber-600">{result.carbs}g</p>
                                <p className="text-xs text-slate-500">Carbs</p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-xl font-bold text-purple-600">{result.fat}g</p>
                                <p className="text-xs text-slate-500">Fat</p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Age</label>
                    <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} min={15} max={80}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                    <div className="grid grid-cols-2 gap-1">
                        <button onClick={() => setGender('male')} className={`py-3 px-2 rounded-lg font-medium text-sm transition ${gender === 'male' ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Male</button>
                        <button onClick={() => setGender('female')} className={`py-3 px-2 rounded-lg font-medium text-sm transition ${gender === 'female' ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Female</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Height (cm)</label>
                    <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} min={100} max={250}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Weight (kg)</label>
                    <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} min={30} max={250}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Activity Level</label>
                <select value={activity} onChange={(e) => setActivity(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500">
                    {activityLevels.map((level) => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Goal</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['lose', 'maintain', 'gain'] as const).map((g) => (
                        <button key={g} onClick={() => setGoal(g)} className={`py-2 px-3 rounded-lg font-medium text-sm transition ${goal === g ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            {g === 'lose' ? 'Lose' : g === 'maintain' ? 'Maintain' : 'Gain'}
                        </button>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
