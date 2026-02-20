'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Apple, Plus, Trash2, Utensils, Flame } from 'lucide-react';

interface NutrientInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
}

// Nutritional data per 100g
const INGREDIENT_DB: Record<string, NutrientInfo> = {
    'Chicken Breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
    'Salmon': { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
    'Ground Beef (lean)': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
    'Eggs (whole)': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
    'Tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
    'Shrimp': { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
    'White Rice (cooked)': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
    'Brown Rice (cooked)': { calories: 123, protein: 2.6, carbs: 26, fat: 1, fiber: 1.8 },
    'Pasta (cooked)': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
    'Bread (white)': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
    'Bread (whole wheat)': { calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7 },
    'Oats': { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11 },
    'Potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
    'Sweet Potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
    'Broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
    'Spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
    'Carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
    'Tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
    'Onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
    'Bell Pepper': { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
    'Avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
    'Banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
    'Apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
    'Olive Oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
    'Butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
    'Cheese (cheddar)': { calories: 403, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },
    'Milk (whole)': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
    'Greek Yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.7, fiber: 0 },
    'Almonds': { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12 },
    'Peanut Butter': { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 },
    'Honey': { calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2 },
    'Sugar': { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
    'Flour (all-purpose)': { calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
    'Lentils (cooked)': { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 },
    'Chickpeas (cooked)': { calories: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 8 },
    'Black Beans (cooked)': { calories: 132, protein: 9, carbs: 24, fat: 0.5, fiber: 8 },
    'Coconut Oil': { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0 },
    'Mushrooms': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
    'Corn': { calories: 86, protein: 3.2, carbs: 19, fat: 1.2, fiber: 2.7 },
    'Cucumber': { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
};

const INGREDIENT_NAMES = Object.keys(INGREDIENT_DB).sort();

interface AddedIngredient {
    id: number;
    name: string;
    grams: number;
}

let nextId = 1;

export default function RecipeNutrition() {
    const [ingredients, setIngredients] = useState<AddedIngredient[]>([
        { id: nextId++, name: 'Chicken Breast', grams: 200 },
        { id: nextId++, name: 'White Rice (cooked)', grams: 150 },
        { id: nextId++, name: 'Broccoli', grams: 100 },
    ]);
    const [servings, setServings] = useState(2);

    const totals = useMemo(() => {
        const result = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        ingredients.forEach(ing => {
            const data = INGREDIENT_DB[ing.name];
            if (data) {
                const factor = ing.grams / 100;
                result.calories += data.calories * factor;
                result.protein += data.protein * factor;
                result.carbs += data.carbs * factor;
                result.fat += data.fat * factor;
                result.fiber += data.fiber * factor;
            }
        });
        return result;
    }, [ingredients]);

    const perServing = useMemo(() => {
        if (servings <= 0) return totals;
        return {
            calories: totals.calories / servings,
            protein: totals.protein / servings,
            carbs: totals.carbs / servings,
            fat: totals.fat / servings,
            fiber: totals.fiber / servings,
        };
    }, [totals, servings]);

    const addIngredient = () => {
        setIngredients(prev => [...prev, { id: nextId++, name: INGREDIENT_NAMES[0], grams: 100 }]);
    };

    const removeIngredient = (id: number) => {
        setIngredients(prev => prev.filter(i => i.id !== id));
    };

    const updateIngredient = (id: number, field: 'name' | 'grams', value: string | number) => {
        setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const macroTotal = perServing.protein + perServing.carbs + perServing.fat;

    return (
        <CalculatorLayout
            title="Recipe Nutrition Calculator"
            description="Calculate total and per-serving nutrition for your recipe"
            category="Cooking & Recipes"
            insights={[
                { label: 'Ingredients', value: `${ingredients.length}` },
                { label: 'Total Calories', value: `${Math.round(totals.calories)} kcal`, color: 'text-orange-600' },
                { label: 'Servings', value: `${servings}`, color: 'text-blue-600' },
                { label: 'Cal/Serving', value: `${Math.round(perServing.calories)} kcal`, color: 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    <div className="text-center p-5 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                        <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Total Calories</p>
                        <p className="text-4xl font-bold text-orange-600">{Math.round(totals.calories)} kcal</p>
                        <p className="text-sm text-slate-500 mt-1">{Math.round(perServing.calories)} kcal per serving ({servings} servings)</p>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'Protein', value: perServing.protein, color: 'text-blue-600', unit: 'g' },
                            { label: 'Carbs', value: perServing.carbs, color: 'text-amber-600', unit: 'g' },
                            { label: 'Fat', value: perServing.fat, color: 'text-red-600', unit: 'g' },
                            { label: 'Fiber', value: perServing.fiber, color: 'text-emerald-600', unit: 'g' },
                        ].map(macro => (
                            <div key={macro.label} className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                                <p className="text-[10px] text-slate-500">{macro.label}</p>
                                <p className={`text-lg font-bold ${macro.color}`}>{macro.value.toFixed(1)}{macro.unit}</p>
                                <p className="text-[10px] text-slate-400">per serving</p>
                            </div>
                        ))}
                    </div>

                    {/* Macro % bars */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Macro Breakdown (per serving)</p>
                        {macroTotal > 0 && (
                            <div className="space-y-2">
                                {[
                                    { label: 'Protein', value: perServing.protein, color: 'bg-blue-500' },
                                    { label: 'Carbs', value: perServing.carbs, color: 'bg-amber-500' },
                                    { label: 'Fat', value: perServing.fat, color: 'bg-red-500' },
                                ].map(m => (
                                    <div key={m.label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">{m.label}</span>
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                {m.value.toFixed(1)}g ({Math.round((m.value / macroTotal) * 100)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                            <div className={`${m.color} h-2 rounded-full transition-all`}
                                                style={{ width: `${(m.value / macroTotal) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Per ingredient */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Per Ingredient</p>
                        <div className="space-y-2">
                            {ingredients.map(ing => {
                                const data = INGREDIENT_DB[ing.name];
                                if (!data) return null;
                                const cal = Math.round(data.calories * ing.grams / 100);
                                return (
                                    <div key={ing.id} className="flex justify-between text-xs border-b border-slate-100 dark:border-slate-700 pb-1.5">
                                        <span className="text-slate-600 dark:text-slate-400">{ing.name} ({ing.grams}g)</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{cal} kcal</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Servings
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {servings}
                        </span>
                    </label>
                    <input
                        type="number"
                        value={servings}
                        onChange={e => setServings(Math.max(1, Number(e.target.value)))}
                        min={1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                </div>

                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ingredients</p>
                    <div className="space-y-2">
                        {ingredients.map(ing => (
                            <div key={ing.id} className="flex gap-2 items-center">
                                <select value={ing.name} onChange={e => updateIngredient(ing.id, 'name', e.target.value)}
                                    className="flex-1 px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                                    {INGREDIENT_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <input type="number" value={ing.grams} onChange={e => updateIngredient(ing.id, 'grams', Number(e.target.value))}
                                    min={1} className="w-20 px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-center" />
                                <span className="text-[10px] text-slate-400 w-4">g</span>
                                <button onClick={() => removeIngredient(ing.id)} className="text-red-400 hover:text-red-600 transition">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addIngredient}
                        className="w-full mt-2 py-2 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700 transition flex items-center justify-center gap-1">
                        <Plus size={12} /> Add Ingredient
                    </button>
                </div>
            </div>
        </CalculatorLayout>
    );
}
