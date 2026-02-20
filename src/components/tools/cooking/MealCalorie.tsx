'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Utensils, Plus, Trash2, Flame, PieChart } from 'lucide-react';

interface FoodItem {
    name: string;
    category: string;
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

const FOOD_DB: FoodItem[] = [
    // Proteins
    { name: 'Grilled Chicken Breast', category: 'Proteins', servingSize: '1 piece (140g)', calories: 231, protein: 43, carbs: 0, fat: 5 },
    { name: 'Scrambled Eggs (2)', category: 'Proteins', servingSize: '2 eggs', calories: 182, protein: 12, carbs: 2, fat: 14 },
    { name: 'Grilled Salmon Fillet', category: 'Proteins', servingSize: '1 fillet (170g)', calories: 354, protein: 34, carbs: 0, fat: 22 },
    { name: 'Turkey Breast Deli', category: 'Proteins', servingSize: '3 slices (85g)', calories: 90, protein: 18, carbs: 1, fat: 1 },
    { name: 'Beef Steak (sirloin)', category: 'Proteins', servingSize: '6 oz (170g)', calories: 320, protein: 42, carbs: 0, fat: 16 },
    { name: 'Tofu (firm, 1 cup)', category: 'Proteins', servingSize: '1 cup (252g)', calories: 188, protein: 20, carbs: 5, fat: 11 },

    // Grains & Carbs
    { name: 'White Rice (1 cup)', category: 'Grains & Carbs', servingSize: '1 cup cooked', calories: 206, protein: 4, carbs: 45, fat: 0.4 },
    { name: 'Brown Rice (1 cup)', category: 'Grains & Carbs', servingSize: '1 cup cooked', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
    { name: 'Pasta (1 cup)', category: 'Grains & Carbs', servingSize: '1 cup cooked', calories: 220, protein: 8, carbs: 43, fat: 1.3 },
    { name: 'Bread Slice (white)', category: 'Grains & Carbs', servingSize: '1 slice', calories: 79, protein: 3, carbs: 15, fat: 1 },
    { name: 'Bread Slice (wheat)', category: 'Grains & Carbs', servingSize: '1 slice', calories: 81, protein: 4, carbs: 14, fat: 1.1 },
    { name: 'Oatmeal (1 cup)', category: 'Grains & Carbs', servingSize: '1 cup cooked', calories: 154, protein: 5, carbs: 27, fat: 2.6 },
    { name: 'Tortilla (flour)', category: 'Grains & Carbs', servingSize: '1 large', calories: 146, protein: 4, carbs: 25, fat: 3.5 },

    // Vegetables
    { name: 'Side Salad', category: 'Vegetables', servingSize: '1 bowl', calories: 35, protein: 2, carbs: 7, fat: 0.3 },
    { name: 'Steamed Broccoli', category: 'Vegetables', servingSize: '1 cup', calories: 55, protein: 4, carbs: 11, fat: 0.6 },
    { name: 'Baked Potato', category: 'Vegetables', servingSize: '1 medium', calories: 161, protein: 4, carbs: 37, fat: 0.2 },
    { name: 'French Fries', category: 'Vegetables', servingSize: 'medium (117g)', calories: 365, protein: 4, carbs: 48, fat: 17 },
    { name: 'Corn on the Cob', category: 'Vegetables', servingSize: '1 ear', calories: 90, protein: 3, carbs: 19, fat: 1.5 },

    // Fruits
    { name: 'Banana', category: 'Fruits', servingSize: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: 'Apple', category: 'Fruits', servingSize: '1 medium', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
    { name: 'Orange', category: 'Fruits', servingSize: '1 medium', calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
    { name: 'Strawberries (1 cup)', category: 'Fruits', servingSize: '1 cup', calories: 49, protein: 1, carbs: 12, fat: 0.5 },

    // Dairy
    { name: 'Milk Glass (whole)', category: 'Dairy', servingSize: '1 cup (240ml)', calories: 149, protein: 8, carbs: 12, fat: 8 },
    { name: 'Greek Yogurt', category: 'Dairy', servingSize: '1 cup', calories: 100, protein: 17, carbs: 6, fat: 0.7 },
    { name: 'Cheese Slice (cheddar)', category: 'Dairy', servingSize: '1 slice (28g)', calories: 113, protein: 7, carbs: 0.4, fat: 9 },

    // Beverages
    { name: 'Orange Juice', category: 'Beverages', servingSize: '1 cup (240ml)', calories: 112, protein: 2, carbs: 26, fat: 0.5 },
    { name: 'Coffee (black)', category: 'Beverages', servingSize: '1 cup', calories: 2, protein: 0.3, carbs: 0, fat: 0 },
    { name: 'Soda (cola)', category: 'Beverages', servingSize: '12 oz can', calories: 140, protein: 0, carbs: 39, fat: 0 },
    { name: 'Smoothie (fruit)', category: 'Beverages', servingSize: '1 cup', calories: 160, protein: 2, carbs: 36, fat: 0.5 },

    // Snacks
    { name: 'Granola Bar', category: 'Snacks', servingSize: '1 bar', calories: 190, protein: 3, carbs: 29, fat: 7 },
    { name: 'Chips (potato)', category: 'Snacks', servingSize: '1 oz (28g)', calories: 152, protein: 2, carbs: 15, fat: 10 },
    { name: 'Mixed Nuts', category: 'Snacks', servingSize: '1 oz (28g)', calories: 173, protein: 5, carbs: 6, fat: 16 },
    { name: 'Dark Chocolate', category: 'Snacks', servingSize: '1 oz (28g)', calories: 170, protein: 2, carbs: 13, fat: 12 },
];

interface SelectedItem {
    id: number;
    foodIndex: number;
    quantity: number;
}

let nextId = 1;

export default function MealCalorie() {
    const [items, setItems] = useState<SelectedItem[]>([
        { id: nextId++, foodIndex: 0, quantity: 1 },
        { id: nextId++, foodIndex: 6, quantity: 1 },
        { id: nextId++, foodIndex: 13, quantity: 1 },
    ]);

    const categories = useMemo(() => {
        const cats = new Map<string, FoodItem[]>();
        FOOD_DB.forEach(f => {
            if (!cats.has(f.category)) cats.set(f.category, []);
            cats.get(f.category)!.push(f);
        });
        return Array.from(cats.entries());
    }, []);

    const totals = useMemo(() => {
        const result = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        items.forEach(item => {
            const food = FOOD_DB[item.foodIndex];
            if (food) {
                result.calories += food.calories * item.quantity;
                result.protein += food.protein * item.quantity;
                result.carbs += food.carbs * item.quantity;
                result.fat += food.fat * item.quantity;
            }
        });
        return result;
    }, [items]);

    const addItem = () => {
        setItems(prev => [...prev, { id: nextId++, foodIndex: 0, quantity: 1 }]);
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const macroTotal = totals.protein + totals.carbs + totals.fat;
    const proteinPct = macroTotal > 0 ? Math.round((totals.protein / macroTotal) * 100) : 0;
    const carbsPct = macroTotal > 0 ? Math.round((totals.carbs / macroTotal) * 100) : 0;
    const fatPct = macroTotal > 0 ? Math.round((totals.fat / macroTotal) * 100) : 0;

    // Simple donut using CSS conic-gradient
    const donutStyle = macroTotal > 0 ? {
        background: `conic-gradient(
            #3b82f6 0% ${proteinPct}%,
            #f59e0b ${proteinPct}% ${proteinPct + carbsPct}%,
            #ef4444 ${proteinPct + carbsPct}% 100%
        )`,
    } : { background: '#e2e8f0' };

    return (
        <CalculatorLayout
            title="Meal Calorie Counter"
            description="Track calories and macros for your meals"
            category="Cooking & Recipes"
            insights={[
                { label: 'Items', value: `${items.length}` },
                { label: 'Total Calories', value: `${Math.round(totals.calories)} kcal`, color: 'text-orange-600' },
                { label: 'Protein', value: `${Math.round(totals.protein)}g`, color: 'text-blue-600' },
                { label: 'Carbs', value: `${Math.round(totals.carbs)}g`, color: 'text-amber-600' },
            ]}
            results={
                <div className="space-y-4">
                    <div className="text-center p-5 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                        <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Total Meal Calories</p>
                        <p className="text-4xl font-bold text-orange-600">{Math.round(totals.calories)} kcal</p>
                        <p className="text-sm text-slate-500 mt-1">{items.length} food items</p>
                    </div>

                    {/* Donut chart */}
                    {macroTotal > 0 && (
                        <div className="flex items-center justify-center gap-6 p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="relative w-28 h-28 rounded-full" style={donutStyle}>
                                <div className="absolute inset-3 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-slate-700 dark:text-white">{Math.round(totals.calories)}</p>
                                        <p className="text-[10px] text-slate-400">kcal</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Protein {proteinPct}% ({Math.round(totals.protein)}g)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Carbs {carbsPct}% ({Math.round(totals.carbs)}g)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Fat {fatPct}% ({Math.round(totals.fat)}g)</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Item list */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Your Selection</p>
                        <div className="space-y-2">
                            {items.map(item => {
                                const food = FOOD_DB[item.foodIndex];
                                return (
                                    <div key={item.id} className="flex justify-between text-xs border-b border-slate-100 dark:border-slate-700 pb-1.5">
                                        <div>
                                            <span className="text-slate-700 dark:text-slate-300">{food.name}</span>
                                            {item.quantity > 1 && <span className="text-slate-400 ml-1">×{item.quantity}</span>}
                                            <p className="text-[10px] text-slate-400">{food.servingSize}</p>
                                        </div>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{Math.round(food.calories * item.quantity)} kcal</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Food Items</p>

                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="flex gap-2 items-center">
                            <select
                                value={item.foodIndex}
                                onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, foodIndex: Number(e.target.value) } : i))}
                                className="flex-1 px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            >
                                {categories.map(([cat, foods]) => (
                                    <optgroup key={cat} label={cat}>
                                        {foods.map(f => {
                                            const idx = FOOD_DB.indexOf(f);
                                            return <option key={idx} value={idx}>{f.name} ({f.calories} cal)</option>;
                                        })}
                                    </optgroup>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, Number(e.target.value)) } : i))}
                                min={1}
                                className="w-14 px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-center"
                            />
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <button onClick={addItem}
                    className="w-full py-2 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700 transition flex items-center justify-center gap-1">
                    <Plus size={12} /> Add Food Item
                </button>
            </div>
        </CalculatorLayout>
    );
}
