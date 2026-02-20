'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Flame, Apple, Beef, Droplets, Activity } from 'lucide-react';

const ACTIVITY_LEVELS = [
    { label: 'Sedentary (little/no exercise)', factor: 1.2 },
    { label: 'Lightly Active (1-3 days/week)', factor: 1.375 },
    { label: 'Moderately Active (3-5 days/week)', factor: 1.55 },
    { label: 'Very Active (6-7 days/week)', factor: 1.725 },
    { label: 'Extra Active (athlete/physical job)', factor: 1.9 },
] as const;

const GOALS = [
    { label: 'Lose Weight', calorieAdjust: -500, proteinPct: 0.35, carbPct: 0.35, fatPct: 0.30 },
    { label: 'Maintain Weight', calorieAdjust: 0, proteinPct: 0.30, carbPct: 0.40, fatPct: 0.30 },
    { label: 'Gain Weight', calorieAdjust: 500, proteinPct: 0.30, carbPct: 0.45, fatPct: 0.25 },
] as const;

export default function MacroCalculator() {
    const [weight, setWeight] = useState(70);
    const [height, setHeight] = useState(170);
    const [age, setAge] = useState(30);
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [activityIdx, setActivityIdx] = useState(2);
    const [goalIdx, setGoalIdx] = useState(1);

    const result = useMemo(() => {
        // Mifflin-St Jeor equation
        let bmr: number;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        const activity = ACTIVITY_LEVELS[activityIdx];
        const goal = GOALS[goalIdx];
        const tdee = bmr * activity.factor;
        const targetCalories = Math.round(tdee + goal.calorieAdjust);

        const proteinCals = targetCalories * goal.proteinPct;
        const carbCals = targetCalories * goal.carbPct;
        const fatCals = targetCalories * goal.fatPct;

        const proteinGrams = Math.round(proteinCals / 4);
        const carbGrams = Math.round(carbCals / 4);
        const fatGrams = Math.round(fatCals / 9);

        return {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories,
            protein: { grams: proteinGrams, pct: Math.round(goal.proteinPct * 100), cals: Math.round(proteinCals) },
            carbs: { grams: carbGrams, pct: Math.round(goal.carbPct * 100), cals: Math.round(carbCals) },
            fat: { grams: fatGrams, pct: Math.round(goal.fatPct * 100), cals: Math.round(fatCals) },
        };
    }, [weight, height, age, gender, activityIdx, goalIdx]);

    const macroColors = { protein: '#3b82f6', carbs: '#f59e0b', fat: '#ef4444' };

    // Donut chart SVG
    const donutSegments = useMemo(() => {
        const total = result.protein.pct + result.carbs.pct + result.fat.pct;
        const radius = 60;
        const circumference = 2 * Math.PI * radius;
        let offset = 0;

        const segments = [
            { key: 'protein', pct: result.protein.pct / total, color: macroColors.protein },
            { key: 'carbs', pct: result.carbs.pct / total, color: macroColors.carbs },
            { key: 'fat', pct: result.fat.pct / total, color: macroColors.fat },
        ].map(s => {
            const dashArray = `${s.pct * circumference} ${circumference}`;
            const dashOffset = -offset * circumference;
            offset += s.pct;
            return { ...s, dashArray, dashOffset, circumference, radius };
        });

        return segments;
    }, [result]);

    return (
        <CalculatorLayout
            title="Macro Nutrient Calculator"
            description="Calculate daily calories and macronutrient targets for your goals"
            category="Health & Fitness"
            insights={[
                { label: 'BMR', value: `${result.bmr} cal` },
                { label: 'TDEE', value: `${result.tdee} cal`, color: 'text-blue-600' },
                { label: 'Target Calories', value: `${result.targetCalories} cal`, color: 'text-purple-600' },
                { label: 'Goal', value: GOALS[goalIdx].label, color: 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Main calorie display */}
                    <div className="text-center p-5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
                        <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Daily Calorie Target</p>
                        <p className="text-5xl font-bold text-orange-600">{result.targetCalories}</p>
                        <p className="text-sm text-slate-500 mt-1">calories/day · {GOALS[goalIdx].label}</p>
                    </div>

                    {/* Donut chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Macro Split</p>
                        <div className="flex items-center justify-center gap-8">
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                {donutSegments.map(seg => (
                                    <circle
                                        key={seg.key}
                                        cx="70" cy="70" r={seg.radius}
                                        fill="none"
                                        stroke={seg.color}
                                        strokeWidth="16"
                                        strokeDasharray={seg.dashArray}
                                        strokeDashoffset={seg.dashOffset}
                                        transform="rotate(-90 70 70)"
                                        className="transition-all duration-500"
                                    />
                                ))}
                                <text x="70" y="66" textAnchor="middle" className="text-lg font-bold fill-slate-800 dark:fill-white" fontSize="18">{result.targetCalories}</text>
                                <text x="70" y="82" textAnchor="middle" className="fill-slate-400" fontSize="10">cal/day</text>
                            </svg>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macroColors.protein }} />
                                    <div>
                                        <p className="text-xs text-slate-500">Protein</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{result.protein.grams}g <span className="text-xs font-normal text-slate-400">({result.protein.pct}%)</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macroColors.carbs }} />
                                    <div>
                                        <p className="text-xs text-slate-500">Carbs</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{result.carbs.grams}g <span className="text-xs font-normal text-slate-400">({result.carbs.pct}%)</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macroColors.fat }} />
                                    <div>
                                        <p className="text-xs text-slate-500">Fat</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{result.fat.grams}g <span className="text-xs font-normal text-slate-400">({result.fat.pct}%)</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Macro bars */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Macro Breakdown</p>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Beef size={14} className="text-blue-500" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Protein</span>
                                    </div>
                                    <span className="text-xs font-semibold text-blue-600">{result.protein.grams}g · {result.protein.cals} cal</span>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${result.protein.pct}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Apple size={14} className="text-amber-500" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Carbs</span>
                                    </div>
                                    <span className="text-xs font-semibold text-amber-600">{result.carbs.grams}g · {result.carbs.cals} cal</span>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${result.carbs.pct}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Droplets size={14} className="text-red-500" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Fat</span>
                                    </div>
                                    <span className="text-xs font-semibold text-red-600">{result.fat.grams}g · {result.fat.cals} cal</span>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-red-400" style={{ width: `${result.fat.pct}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TDEE breakdown */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
                            <Activity className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                            <p className="text-xs text-slate-500">BMR</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{result.bmr}</p>
                            <p className="text-[10px] text-slate-400">cal/day at rest</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
                            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                            <p className="text-xs text-slate-500">TDEE</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{result.tdee}</p>
                            <p className="text-[10px] text-slate-400">cal/day with activity</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setGender('male')} className={`py-3 px-4 rounded-lg text-sm font-medium transition ${gender === 'male' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Male</button>
                        <button onClick={() => setGender('female')} className={`py-3 px-4 rounded-lg text-sm font-medium transition ${gender === 'female' ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Female</button>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Weight (kg)</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{weight} kg</span>
                    </div>
                    <input type="number" value={weight} onChange={(e) => setWeight(Math.max(30, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={30} max={200} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Height (cm)</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{height} cm</span>
                    </div>
                    <input type="number" value={height} onChange={(e) => setHeight(Math.max(100, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={100} max={220} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{age} yrs</span>
                    </div>
                    <input type="number" value={age} onChange={(e) => setAge(Math.max(10, Math.min(100, Number(e.target.value))))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={10} max={100} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Activity Level</label>
                    <select value={activityIdx} onChange={(e) => setActivityIdx(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {ACTIVITY_LEVELS.map((al, i) => (
                            <option key={i} value={i}>{al.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Goal</label>
                    <div className="grid grid-cols-3 gap-2">
                        {GOALS.map((g, i) => (
                            <button key={i} onClick={() => setGoalIdx(i)}
                                className={`py-2.5 px-2 rounded-lg text-xs font-medium transition ${goalIdx === i ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                                {g.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
