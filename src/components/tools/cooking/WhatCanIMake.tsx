'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { ChefHat, CheckSquare, Square, Star, Clock, Users } from 'lucide-react';

interface Recipe {
    name: string;
    ingredients: string[];
    servings: number;
    time: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string;
}

const ALL_INGREDIENTS = [
    'Chicken', 'Ground Beef', 'Eggs', 'Tofu', 'Shrimp', 'Salmon', 'Bacon', 'Sausage',
    'Rice', 'Pasta', 'Bread', 'Tortillas', 'Potatoes', 'Flour', 'Oats',
    'Onion', 'Garlic', 'Tomato', 'Bell Pepper', 'Broccoli', 'Spinach', 'Carrot', 'Mushrooms', 'Corn', 'Lettuce', 'Avocado', 'Cucumber',
    'Cheese', 'Milk', 'Butter', 'Cream', 'Yogurt', 'Sour Cream',
    'Olive Oil', 'Soy Sauce', 'Honey', 'Lemon', 'Lime', 'Hot Sauce',
    'Salt', 'Pepper', 'Cumin', 'Paprika', 'Cinnamon', 'Oregano', 'Basil',
    'Beans (canned)', 'Chickpeas', 'Peanut Butter',
].sort();

const RECIPES: Recipe[] = [
    { name: 'Chicken Stir-Fry', ingredients: ['Chicken', 'Bell Pepper', 'Broccoli', 'Soy Sauce', 'Garlic', 'Rice', 'Olive Oil'], servings: 4, time: '25 min', difficulty: 'Easy', description: 'Quick and healthy chicken stir-fry with vegetables served over rice.' },
    { name: 'Scrambled Eggs on Toast', ingredients: ['Eggs', 'Butter', 'Bread', 'Salt', 'Pepper'], servings: 2, time: '10 min', difficulty: 'Easy', description: 'Classic fluffy scrambled eggs served on toasted bread.' },
    { name: 'Spaghetti Bolognese', ingredients: ['Ground Beef', 'Pasta', 'Tomato', 'Onion', 'Garlic', 'Olive Oil', 'Oregano', 'Salt'], servings: 4, time: '40 min', difficulty: 'Easy', description: 'Rich and savory meat sauce over spaghetti pasta.' },
    { name: 'Chicken Caesar Salad', ingredients: ['Chicken', 'Lettuce', 'Cheese', 'Bread', 'Lemon', 'Garlic', 'Olive Oil'], servings: 2, time: '20 min', difficulty: 'Easy', description: 'Grilled chicken on crisp romaine with homemade croutons.' },
    { name: 'Bean & Cheese Quesadilla', ingredients: ['Tortillas', 'Cheese', 'Beans (canned)', 'Bell Pepper', 'Onion', 'Cumin'], servings: 2, time: '15 min', difficulty: 'Easy', description: 'Crispy tortillas filled with melty cheese and seasoned beans.' },
    { name: 'Omelette', ingredients: ['Eggs', 'Cheese', 'Bell Pepper', 'Onion', 'Mushrooms', 'Butter', 'Salt', 'Pepper'], servings: 1, time: '10 min', difficulty: 'Easy', description: 'Fluffy omelette loaded with fresh vegetables and cheese.' },
    { name: 'Fried Rice', ingredients: ['Rice', 'Eggs', 'Soy Sauce', 'Garlic', 'Carrot', 'Corn', 'Olive Oil'], servings: 3, time: '20 min', difficulty: 'Easy', description: 'Quick and satisfying fried rice with egg and vegetables.' },
    { name: 'Guacamole & Chips', ingredients: ['Avocado', 'Tomato', 'Onion', 'Lime', 'Salt', 'Tortillas'], servings: 4, time: '10 min', difficulty: 'Easy', description: 'Fresh homemade guacamole with crispy tortilla chips.' },
    { name: 'Pasta Primavera', ingredients: ['Pasta', 'Bell Pepper', 'Broccoli', 'Carrot', 'Garlic', 'Olive Oil', 'Cheese', 'Basil'], servings: 4, time: '25 min', difficulty: 'Easy', description: 'Colorful vegetable pasta with garlic and parmesan.' },
    { name: 'BLT Sandwich', ingredients: ['Bacon', 'Lettuce', 'Tomato', 'Bread', 'Butter'], servings: 2, time: '15 min', difficulty: 'Easy', description: 'Classic bacon, lettuce, and tomato sandwich.' },
    { name: 'Shrimp Tacos', ingredients: ['Shrimp', 'Tortillas', 'Avocado', 'Lime', 'Lettuce', 'Hot Sauce', 'Cumin'], servings: 4, time: '20 min', difficulty: 'Medium', description: 'Seasoned shrimp in warm tortillas with avocado and lime.' },
    { name: 'Honey Garlic Salmon', ingredients: ['Salmon', 'Honey', 'Garlic', 'Soy Sauce', 'Lemon', 'Olive Oil'], servings: 2, time: '25 min', difficulty: 'Medium', description: 'Pan-seared salmon glazed with sweet honey-garlic sauce.' },
    { name: 'Mushroom Risotto', ingredients: ['Rice', 'Mushrooms', 'Onion', 'Garlic', 'Butter', 'Cheese', 'Salt', 'Pepper'], servings: 4, time: '45 min', difficulty: 'Medium', description: 'Creamy Italian rice dish with sautéed mushrooms.' },
    { name: 'Potato & Egg Breakfast', ingredients: ['Potatoes', 'Eggs', 'Onion', 'Bell Pepper', 'Olive Oil', 'Salt', 'Pepper', 'Paprika'], servings: 2, time: '25 min', difficulty: 'Easy', description: 'Crispy breakfast potatoes topped with fried eggs.' },
    { name: 'Chicken Burrito Bowl', ingredients: ['Chicken', 'Rice', 'Beans (canned)', 'Corn', 'Lettuce', 'Cheese', 'Sour Cream', 'Lime'], servings: 4, time: '30 min', difficulty: 'Easy', description: 'Deconstructed burrito with all the toppings.' },
    { name: 'Peanut Butter Oatmeal', ingredients: ['Oats', 'Peanut Butter', 'Honey', 'Milk', 'Cinnamon'], servings: 1, time: '5 min', difficulty: 'Easy', description: 'Warm and filling oatmeal with peanut butter swirl.' },
    { name: 'Greek Salad', ingredients: ['Cucumber', 'Tomato', 'Onion', 'Cheese', 'Olive Oil', 'Lemon', 'Oregano', 'Salt'], servings: 2, time: '10 min', difficulty: 'Easy', description: 'Fresh Mediterranean salad with feta and olive oil dressing.' },
    { name: 'Garlic Butter Shrimp Pasta', ingredients: ['Shrimp', 'Pasta', 'Garlic', 'Butter', 'Lemon', 'Basil', 'Salt', 'Pepper'], servings: 3, time: '20 min', difficulty: 'Medium', description: 'Succulent shrimp in garlic butter sauce over linguine.' },
    { name: 'Vegetable Soup', ingredients: ['Onion', 'Garlic', 'Carrot', 'Potatoes', 'Tomato', 'Corn', 'Salt', 'Pepper', 'Olive Oil', 'Oregano'], servings: 6, time: '45 min', difficulty: 'Easy', description: 'Hearty homemade vegetable soup perfect for cold days.' },
    { name: 'Breakfast Burrito', ingredients: ['Eggs', 'Tortillas', 'Cheese', 'Bacon', 'Bell Pepper', 'Hot Sauce', 'Salt'], servings: 2, time: '15 min', difficulty: 'Easy', description: 'Warm tortilla stuffed with scrambled eggs, cheese, and bacon.' },
    { name: 'Tofu Stir-Fry', ingredients: ['Tofu', 'Broccoli', 'Carrot', 'Soy Sauce', 'Garlic', 'Rice', 'Olive Oil'], servings: 3, time: '25 min', difficulty: 'Easy', description: 'Crispy tofu with vegetables in savory soy sauce.' },
    { name: 'Spinach & Cheese Omelette', ingredients: ['Eggs', 'Spinach', 'Cheese', 'Butter', 'Salt', 'Pepper'], servings: 1, time: '10 min', difficulty: 'Easy', description: 'Light and fluffy omelette with wilted spinach and melty cheese.' },
    { name: 'Sausage & Peppers', ingredients: ['Sausage', 'Bell Pepper', 'Onion', 'Garlic', 'Olive Oil', 'Oregano'], servings: 4, time: '30 min', difficulty: 'Easy', description: 'Italian sausages with sautéed peppers and onions.' },
    { name: 'Chickpea Curry', ingredients: ['Chickpeas', 'Onion', 'Garlic', 'Tomato', 'Cumin', 'Paprika', 'Rice', 'Olive Oil', 'Salt'], servings: 4, time: '30 min', difficulty: 'Medium', description: 'Aromatic chickpea curry served over fluffy rice.' },
];

export default function WhatCanIMake() {
    const [selected, setSelected] = useState<Set<string>>(new Set(['Eggs', 'Cheese', 'Butter', 'Salt', 'Pepper', 'Bread']));

    const matches = useMemo(() => {
        return RECIPES.map(recipe => {
            const matched = recipe.ingredients.filter(i => selected.has(i));
            const missing = recipe.ingredients.filter(i => !selected.has(i));
            const pct = Math.round((matched.length / recipe.ingredients.length) * 100);
            return { ...recipe, matched, missing, pct };
        })
            .filter(r => r.pct > 0)
            .sort((a, b) => b.pct - a.pct);
    }, [selected]);

    const toggleIngredient = (name: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    };

    const categories = useMemo(() => {
        const cats: Record<string, string[]> = {
            'Proteins': ALL_INGREDIENTS.filter(i => ['Chicken', 'Ground Beef', 'Eggs', 'Tofu', 'Shrimp', 'Salmon', 'Bacon', 'Sausage'].includes(i)),
            'Grains': ALL_INGREDIENTS.filter(i => ['Rice', 'Pasta', 'Bread', 'Tortillas', 'Potatoes', 'Flour', 'Oats'].includes(i)),
            'Vegetables': ALL_INGREDIENTS.filter(i => ['Onion', 'Garlic', 'Tomato', 'Bell Pepper', 'Broccoli', 'Spinach', 'Carrot', 'Mushrooms', 'Corn', 'Lettuce', 'Avocado', 'Cucumber'].includes(i)),
            'Dairy': ALL_INGREDIENTS.filter(i => ['Cheese', 'Milk', 'Butter', 'Cream', 'Yogurt', 'Sour Cream'].includes(i)),
            'Pantry': ALL_INGREDIENTS.filter(i => ['Olive Oil', 'Soy Sauce', 'Honey', 'Lemon', 'Lime', 'Hot Sauce', 'Beans (canned)', 'Chickpeas', 'Peanut Butter'].includes(i)),
            'Spices': ALL_INGREDIENTS.filter(i => ['Salt', 'Pepper', 'Cumin', 'Paprika', 'Cinnamon', 'Oregano', 'Basil'].includes(i)),
        };
        return Object.entries(cats);
    }, []);

    const perfectMatches = matches.filter(m => m.pct === 100).length;

    return (
        <CalculatorLayout
            title="What Can I Make?"
            description="Find recipes based on ingredients you have on hand"
            category="Cooking & Recipes"
            insights={[
                { label: 'Ingredients', value: `${selected.size}` },
                { label: 'Matches', value: `${matches.length}`, color: 'text-blue-600' },
                { label: 'Perfect', value: `${perfectMatches}`, color: 'text-emerald-600' },
                { label: 'Top Match', value: matches[0]?.name || '-', color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-4">
                    <div className="text-center p-5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
                        <ChefHat className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Recipes Found</p>
                        <p className="text-4xl font-bold text-orange-600">{matches.length}</p>
                        <p className="text-sm text-slate-500 mt-1">{perfectMatches} perfect match{perfectMatches !== 1 ? 'es' : ''} &middot; {selected.size} ingredients selected</p>
                    </div>

                    {matches.length === 0 ? (
                        <div className="text-center p-8 text-slate-400">
                            <ChefHat className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Select ingredients to find matching recipes</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {matches.map((recipe, i) => (
                                <div key={recipe.name}
                                    className={`p-4 rounded-xl border ${recipe.pct === 100
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                                        }`}>
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            {recipe.pct === 100 && <Star size={14} className="text-amber-500" />}
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{recipe.name}</h3>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${recipe.pct === 100 ? 'bg-emerald-100 text-emerald-700' : recipe.pct >= 70 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {recipe.pct}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">{recipe.description}</p>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Clock size={10} /> {recipe.time}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Users size={10} /> {recipe.servings} servings
                                        </div>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${recipe.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-600' : recipe.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                            {recipe.difficulty}
                                        </span>
                                    </div>
                                    {recipe.missing.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            <span className="text-[10px] text-red-500 font-medium">Missing:</span>
                                            {recipe.missing.map(m => (
                                                <span key={m} className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">What do you have?</p>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full">
                        {selected.size} selected
                    </span>
                </div>

                {categories.map(([cat, ings]) => (
                    <div key={cat}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{cat}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {ings.map(ing => (
                                <button
                                    key={ing}
                                    onClick={() => toggleIngredient(ing)}
                                    className={`text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 ${selected.has(ing)
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                        }`}
                                >
                                    {selected.has(ing) ? <CheckSquare size={10} /> : <Square size={10} />}
                                    {ing}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex gap-2">
                    <button onClick={() => setSelected(new Set(ALL_INGREDIENTS))}
                        className="flex-1 py-2 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                        Select All
                    </button>
                    <button onClick={() => setSelected(new Set())}
                        className="flex-1 py-2 text-xs text-slate-500 hover:text-red-500 rounded-lg transition">
                        Clear All
                    </button>
                </div>
            </div>
        </CalculatorLayout>
    );
}
