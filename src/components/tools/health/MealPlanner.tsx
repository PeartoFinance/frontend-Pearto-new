'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { UtensilsCrossed, Clock, Flame, Apple } from 'lucide-react';

const DIETS = [
    { label: 'Normal (Balanced)', protein: 0.30, carbs: 0.40, fat: 0.30 },
    { label: 'Vegetarian', protein: 0.25, carbs: 0.45, fat: 0.30 },
    { label: 'Vegan', protein: 0.20, carbs: 0.50, fat: 0.30 },
    { label: 'Keto', protein: 0.25, carbs: 0.05, fat: 0.70 },
] as const;

interface MealTemplate {
    name: string;
    items: string[];
    calories: number;
}

const MEAL_TEMPLATES: Record<string, MealTemplate[]> = {
    'Normal (Balanced)': [
        { name: 'Breakfast', items: ['Oatmeal with berries', 'Scrambled eggs', 'Whole wheat toast', 'Orange juice'], calories: 0 },
        { name: 'Lunch', items: ['Grilled chicken salad', 'Brown rice', 'Steamed vegetables', 'Fruit'], calories: 0 },
        { name: 'Dinner', items: ['Baked salmon', 'Quinoa', 'Roasted broccoli', 'Side salad'], calories: 0 },
        { name: 'Snack', items: ['Greek yogurt', 'Mixed nuts', 'Apple slices'], calories: 0 },
    ],
    'Vegetarian': [
        { name: 'Breakfast', items: ['Greek yogurt parfait', 'Granola', 'Fresh berries', 'Green smoothie'], calories: 0 },
        { name: 'Lunch', items: ['Caprese panini', 'Lentil soup', 'Mixed green salad', 'Fruit cup'], calories: 0 },
        { name: 'Dinner', items: ['Vegetable stir-fry with tofu', 'Brown rice', 'Edamame', 'Miso soup'], calories: 0 },
        { name: 'Snack', items: ['Hummus with veggies', 'Trail mix', 'Cheese and crackers'], calories: 0 },
    ],
    'Vegan': [
        { name: 'Breakfast', items: ['Smoothie bowl (banana, berries, plant milk)', 'Chia pudding', 'Toast with avocado'], calories: 0 },
        { name: 'Lunch', items: ['Chickpea wrap', 'Quinoa tabouleh', 'Roasted sweet potato', 'Green salad'], calories: 0 },
        { name: 'Dinner', items: ['Lentil curry', 'Basmati rice', 'Naan bread', 'Steamed greens'], calories: 0 },
        { name: 'Snack', items: ['Fruit and nut butter', 'Rice cakes', 'Roasted chickpeas'], calories: 0 },
    ],
    'Keto': [
        { name: 'Breakfast', items: ['Bacon and eggs', 'Avocado half', 'Bulletproof coffee'], calories: 0 },
        { name: 'Lunch', items: ['Caesar salad (no croutons)', 'Grilled chicken thigh', 'Cheese crisps'], calories: 0 },
        { name: 'Dinner', items: ['Ribeye steak', 'Cauliflower mash', 'Butter-sautéed spinach', 'Bone broth'], calories: 0 },
        { name: 'Snack', items: ['Pork rinds', 'String cheese', 'Olives', 'Macadamia nuts'], calories: 0 },
    ],
};

export default function MealPlanner() {
    const [calorieTarget, setCalorieTarget] = useState(2000);
    const [mealsPerDay, setMealsPerDay] = useState(3);
    const [dietIdx, setDietIdx] = useState(0);

    const result = useMemo(() => {
        const diet = DIETS[dietIdx];
        const calPerMeal = Math.round(calorieTarget / mealsPerDay);
        const snackCals = mealsPerDay > 3 ? Math.round(calorieTarget * 0.1) : 0;
        const mainMealCals = mealsPerDay > 3
            ? Math.round((calorieTarget - snackCals * (mealsPerDay - 3)) / 3)
            : calPerMeal;

        const proteinG = Math.round((calorieTarget * diet.protein) / 4);
        const carbsG = Math.round((calorieTarget * diet.carbs) / 4);
        const fatG = Math.round((calorieTarget * diet.fat) / 9);

        // Build meal plan
        const templates = MEAL_TEMPLATES[diet.label] || MEAL_TEMPLATES['Normal (Balanced)'];
        const plan: { name: string; calories: number; items: string[]; time: string }[] = [];

        const mealTimes = ['7:00 AM', '12:00 PM', '6:00 PM', '3:00 PM', '10:00 AM', '8:00 PM'];

        for (let i = 0; i < mealsPerDay; i++) {
            if (i < 3) {
                const template = templates[i];
                plan.push({
                    name: template.name,
                    calories: mainMealCals,
                    items: template.items,
                    time: mealTimes[i],
                });
            } else {
                const snackTemplate = templates[3] || templates[0];
                plan.push({
                    name: `Snack ${i - 2}`,
                    calories: snackCals,
                    items: snackTemplate.items.slice(0, 2),
                    time: mealTimes[Math.min(i, mealTimes.length - 1)],
                });
            }
        }

        plan.sort((a, b) => {
            const toMin = (t: string) => {
                const [time, period] = t.split(' ');
                const [h, m] = time.split(':').map(Number);
                return ((period === 'PM' && h !== 12 ? h + 12 : h === 12 && period === 'AM' ? 0 : h) * 60 + m);
            };
            return toMin(a.time) - toMin(b.time);
        });

        return {
            calPerMeal: mainMealCals,
            snackCals,
            proteinG,
            carbsG,
            fatG,
            diet,
            plan,
        };
    }, [calorieTarget, mealsPerDay, dietIdx]);

    const mealColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

    return (
        <CalculatorLayout
            title="Meal Planner"
            description="Plan daily meals with calorie and macro distribution"
            category="Health & Fitness"
            insights={[
                { label: 'Daily Calories', value: `${calorieTarget}`, color: 'text-orange-600' },
                { label: 'Meals/Day', value: `${mealsPerDay}` },
                { label: 'Cal/Main Meal', value: `${result.calPerMeal}`, color: 'text-blue-600' },
                { label: 'Diet', value: DIETS[dietIdx].label, color: 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Summary */}
                    <div className="text-center p-5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
                        <UtensilsCrossed className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Daily Calorie Target</p>
                        <p className="text-4xl font-bold text-orange-600">{calorieTarget} cal</p>
                        <p className="text-sm text-slate-500 mt-1">{mealsPerDay} meals · {DIETS[dietIdx].label}</p>
                    </div>

                    {/* Macro split */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Daily Macro Split</p>
                        <div className="flex h-5 rounded-full overflow-hidden mb-3">
                            <div className="bg-blue-400" style={{ width: `${result.diet.protein * 100}%` }} />
                            <div className="bg-amber-400" style={{ width: `${result.diet.carbs * 100}%` }} />
                            <div className="bg-red-400" style={{ width: `${result.diet.fat * 100}%` }} />
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <div className="w-3 h-3 bg-blue-400 rounded-full mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Protein</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{result.proteinG}g</p>
                                <p className="text-[10px] text-slate-400">{Math.round(result.diet.protein * 100)}%</p>
                            </div>
                            <div>
                                <div className="w-3 h-3 bg-amber-400 rounded-full mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Carbs</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{result.carbsG}g</p>
                                <p className="text-[10px] text-slate-400">{Math.round(result.diet.carbs * 100)}%</p>
                            </div>
                            <div>
                                <div className="w-3 h-3 bg-red-400 rounded-full mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Fat</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{result.fatG}g</p>
                                <p className="text-[10px] text-slate-400">{Math.round(result.diet.fat * 100)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Calorie distribution chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Calorie Distribution</p>
                        <div className="space-y-2">
                            {result.plan.map((meal, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 w-20 truncate">{meal.name}</span>
                                    <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${(meal.calories / calorieTarget) * 100}%`,
                                                backgroundColor: mealColors[i % mealColors.length],
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 w-14 text-right">{meal.calories} cal</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meal templates */}
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Meal Templates</p>
                        {result.plan.map((meal, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mealColors[i % mealColors.length] }} />
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{meal.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-slate-400" />
                                        <span className="text-[10px] text-slate-400">{meal.time}</span>
                                        <span className="text-xs font-bold text-orange-600">{meal.calories} cal</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {meal.items.map((item, j) => (
                                        <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Daily Calorie Target</label>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-md">{calorieTarget} cal</span>
                    </div>
                    <input type="number" value={calorieTarget} onChange={(e) => setCalorieTarget(Math.max(800, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={800} max={5000} step={50} value={calorieTarget}
                        onChange={(e) => setCalorieTarget(Number(e.target.value))} className="w-full accent-orange-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Meals Per Day</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{mealsPerDay}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => setMealsPerDay(n)}
                                className={`py-2.5 rounded-lg text-sm font-medium transition ${mealsPerDay === n ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dietary Preference</label>
                    <div className="grid grid-cols-2 gap-2">
                        {DIETS.map((d, i) => (
                            <button key={i} onClick={() => setDietIdx(i)}
                                className={`py-2.5 px-2 rounded-lg text-xs font-medium transition ${dietIdx === i ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Apple size={12} className="text-emerald-500" />
                        <p className="text-xs font-semibold text-emerald-600">Tip</p>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">Distribute calories evenly for stable energy. Add a snack between meals if eating fewer than 4 times daily.</p>
                </div>
            </div>
        </CalculatorLayout>
    );
}
