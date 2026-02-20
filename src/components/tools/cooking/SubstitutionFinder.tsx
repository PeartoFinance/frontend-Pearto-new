'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { RefreshCw, ArrowRight, Search, Info, ChefHat } from 'lucide-react';

interface Substitution {
    alternative: string;
    ratio: string;
    notes: string;
    quality: 'excellent' | 'good' | 'fair';
}

interface IngredientSubs {
    ingredient: string;
    category: string;
    substitutions: Substitution[];
}

const SUBSTITUTION_DB: IngredientSubs[] = [
    {
        ingredient: 'Butter', category: 'Fats & Oils',
        substitutions: [
            { alternative: 'Coconut Oil', ratio: '1:1', notes: 'Works well in baking. Adds slight coconut flavor.', quality: 'excellent' },
            { alternative: 'Olive Oil', ratio: '3/4 cup per 1 cup butter', notes: 'Best for savory dishes. Lighter texture in baking.', quality: 'good' },
            { alternative: 'Applesauce', ratio: '1/2 cup per 1 cup butter', notes: 'Reduces fat in baking. Adds moisture and slight sweetness.', quality: 'fair' },
            { alternative: 'Greek Yogurt', ratio: '1/2 cup per 1 cup butter', notes: 'Good for muffins and cakes. Adds tanginess and protein.', quality: 'good' },
            { alternative: 'Avocado', ratio: '1:1', notes: 'Creamy texture. Works in brownies and chocolate bakes.', quality: 'good' },
        ],
    },
    {
        ingredient: 'Eggs', category: 'Binders',
        substitutions: [
            { alternative: 'Flax Egg (1 tbsp ground flax + 3 tbsp water)', ratio: '1 flax egg = 1 egg', notes: 'Let sit 5 min to gel. Best for cookies and muffins.', quality: 'excellent' },
            { alternative: 'Chia Egg (1 tbsp chia + 3 tbsp water)', ratio: '1 chia egg = 1 egg', notes: 'Similar to flax. Slight crunch if not ground finely.', quality: 'excellent' },
            { alternative: 'Mashed Banana', ratio: '1/4 cup = 1 egg', notes: 'Adds banana flavor. Best for pancakes, muffins.', quality: 'good' },
            { alternative: 'Silken Tofu', ratio: '1/4 cup blended = 1 egg', notes: 'Neutral flavor. Great for dense baked goods.', quality: 'good' },
            { alternative: 'Commercial Egg Replacer', ratio: 'Follow package', notes: 'Most versatile option for all baking.', quality: 'excellent' },
        ],
    },
    {
        ingredient: 'All-Purpose Flour', category: 'Flours',
        substitutions: [
            { alternative: 'Whole Wheat Flour', ratio: '1:1 (use 3/4 cup for lighter result)', notes: 'Denser, nuttier flavor. Increase liquid slightly.', quality: 'excellent' },
            { alternative: 'Almond Flour', ratio: '1:1', notes: 'Gluten-free. Moister, denser result. Add binding agent.', quality: 'good' },
            { alternative: 'Oat Flour', ratio: '1:1', notes: 'Blend oats to make. Slightly sweet, tender crumb.', quality: 'good' },
            { alternative: 'Coconut Flour', ratio: '1/4 cup per 1 cup AP flour', notes: 'Very absorbent! Requires extra eggs and liquid.', quality: 'fair' },
            { alternative: 'Rice Flour', ratio: '7/8 cup per 1 cup', notes: 'Gluten-free. Can be gritty. Mix with starch.', quality: 'fair' },
        ],
    },
    {
        ingredient: 'Sugar (white)', category: 'Sweeteners',
        substitutions: [
            { alternative: 'Honey', ratio: '3/4 cup per 1 cup sugar', notes: 'Reduce liquid by 1/4 cup. Lower oven temp by 25°F.', quality: 'excellent' },
            { alternative: 'Maple Syrup', ratio: '3/4 cup per 1 cup sugar', notes: 'Adds distinct flavor. Reduce liquid slightly.', quality: 'excellent' },
            { alternative: 'Coconut Sugar', ratio: '1:1', notes: 'Lower glycemic index. Caramel-like flavor.', quality: 'excellent' },
            { alternative: 'Stevia', ratio: '1 tsp per 1 cup sugar', notes: 'Zero calories but very sweet. May need bulking agent for baking.', quality: 'fair' },
            { alternative: 'Brown Sugar', ratio: '1:1', notes: 'Adds moisture and molasses flavor.', quality: 'excellent' },
        ],
    },
    {
        ingredient: 'Milk (whole)', category: 'Dairy',
        substitutions: [
            { alternative: 'Oat Milk', ratio: '1:1', notes: 'Creamy, neutral flavor. Great for baking and cooking.', quality: 'excellent' },
            { alternative: 'Almond Milk', ratio: '1:1', notes: 'Slightly nutty. Thinner consistency. Add 1 tbsp oil for richness.', quality: 'good' },
            { alternative: 'Coconut Milk', ratio: '1:1', notes: 'Rich and creamy. Light coconut flavor.', quality: 'good' },
            { alternative: 'Soy Milk', ratio: '1:1', notes: 'Closest protein content to dairy. Neutral in baking.', quality: 'excellent' },
            { alternative: 'Water + 1 tbsp butter', ratio: '1 cup', notes: 'Emergency substitute. Works for most recipes.', quality: 'fair' },
        ],
    },
    {
        ingredient: 'Heavy Cream', category: 'Dairy',
        substitutions: [
            { alternative: 'Coconut Cream', ratio: '1:1', notes: 'Thick, rich. Chill can overnight. Whips well.', quality: 'excellent' },
            { alternative: 'Milk + Butter (3/4 cup milk + 1/4 cup melted butter)', ratio: '1 cup', notes: 'Won\'t whip but works for sauces and baking.', quality: 'good' },
            { alternative: 'Cashew Cream (soaked cashews + water)', ratio: '1:1', notes: 'Blend soaked cashews until smooth. Rich and creamy.', quality: 'good' },
            { alternative: 'Evaporated Milk', ratio: '1:1', notes: 'Similar richness. Slightly caramelized flavor.', quality: 'good' },
        ],
    },
    {
        ingredient: 'Sour Cream', category: 'Dairy',
        substitutions: [
            { alternative: 'Greek Yogurt', ratio: '1:1', notes: 'Very similar tanginess and thickness. Less fat.', quality: 'excellent' },
            { alternative: 'Cottage Cheese (blended)', ratio: '1:1', notes: 'Blend until smooth. Higher protein.', quality: 'good' },
            { alternative: 'Cashew Cream + lemon juice', ratio: '1:1', notes: 'Vegan option. Soak cashews 4 hours before blending.', quality: 'good' },
        ],
    },
    {
        ingredient: 'Breadcrumbs', category: 'Coatings & Binders',
        substitutions: [
            { alternative: 'Crushed Crackers', ratio: '1:1', notes: 'Saltines or Ritz work great. Slightly saltier.', quality: 'excellent' },
            { alternative: 'Rolled Oats', ratio: '1:1', notes: 'Pulse in blender for finer texture. Nuttier flavor.', quality: 'good' },
            { alternative: 'Crushed Cornflakes', ratio: '1:1', notes: 'Extra crispy coating. Slightly sweet.', quality: 'good' },
            { alternative: 'Almond Flour', ratio: '1:1', notes: 'Gluten-free option. Doesn\'t crisp as much.', quality: 'fair' },
        ],
    },
    {
        ingredient: 'Soy Sauce', category: 'Condiments',
        substitutions: [
            { alternative: 'Coconut Aminos', ratio: '1:1', notes: 'Slightly sweeter, less sodium. Soy-free.', quality: 'excellent' },
            { alternative: 'Tamari', ratio: '1:1', notes: 'Gluten-free soy sauce. Richer flavor.', quality: 'excellent' },
            { alternative: 'Worcestershire Sauce', ratio: '1:1', notes: 'Different flavor profile but adds umami depth.', quality: 'fair' },
        ],
    },
    {
        ingredient: 'Lemon Juice', category: 'Acids',
        substitutions: [
            { alternative: 'Lime Juice', ratio: '1:1', notes: 'Nearly identical acidity. Slightly different flavor.', quality: 'excellent' },
            { alternative: 'White Vinegar', ratio: '1/2 amount', notes: 'More acidic. Good for baking reactions.', quality: 'good' },
            { alternative: 'Apple Cider Vinegar', ratio: '1/2 amount', notes: 'Milder than white vinegar. Good for dressings.', quality: 'good' },
        ],
    },
    {
        ingredient: 'Cornstarch', category: 'Thickeners',
        substitutions: [
            { alternative: 'Arrowroot Powder', ratio: '1:1', notes: 'Clear finish. Freezer-friendly. Don\'t boil.', quality: 'excellent' },
            { alternative: 'All-Purpose Flour', ratio: '2 tbsp flour per 1 tbsp cornstarch', notes: 'Will make sauce slightly cloudy. Cook longer.', quality: 'good' },
            { alternative: 'Tapioca Starch', ratio: '2 tbsp per 1 tbsp cornstarch', notes: 'Glossy finish. Good for pie fillings.', quality: 'good' },
        ],
    },
    {
        ingredient: 'Baking Powder', category: 'Leaveners',
        substitutions: [
            { alternative: '1/4 tsp baking soda + 1/2 tsp cream of tartar', ratio: '= 1 tsp baking powder', notes: 'Mix fresh each time. Don\'t store.', quality: 'excellent' },
            { alternative: 'Self-rising Flour', ratio: 'Replace AP flour', notes: 'Already contains baking powder and salt.', quality: 'good' },
        ],
    },
];

const INGREDIENT_NAMES = SUBSTITUTION_DB.map(i => i.ingredient).sort();

export default function SubstitutionFinder() {
    const [selected, setSelected] = useState('Butter');

    const result = useMemo(() => {
        return SUBSTITUTION_DB.find(i => i.ingredient === selected) || null;
    }, [selected]);

    const qualityColors = {
        excellent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        good: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        fair: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };

    return (
        <CalculatorLayout
            title="Ingredient Substitution Finder"
            description="Find alternative ingredients with conversion ratios"
            category="Cooking & Recipes"
            insights={[
                { label: 'Ingredient', value: selected },
                { label: 'Category', value: result?.category || '-', color: 'text-blue-600' },
                { label: 'Alternatives', value: `${result?.substitutions.length || 0}`, color: 'text-emerald-600' },
                { label: 'Database', value: `${SUBSTITUTION_DB.length} items`, color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-4">
                    <div className="text-center p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                        <RefreshCw className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Substitutes for</p>
                        <p className="text-2xl font-bold text-emerald-600">{selected}</p>
                        <p className="text-sm text-slate-500 mt-1">{result?.substitutions.length || 0} alternatives found</p>
                    </div>

                    {result ? (
                        <div className="space-y-3">
                            {result.substitutions.map((sub, i) => (
                                <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <ArrowRight size={14} className="text-emerald-500" />
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{sub.alternative}</h3>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${qualityColors[sub.quality]}`}>
                                            {sub.quality}
                                        </span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ratio:</span>
                                            <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                                                {sub.ratio}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{sub.notes}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 text-slate-400">
                            <Search size={32} className="mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No substitution data found</p>
                        </div>
                    )}

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-blue-600 dark:text-blue-400">
                                Substitutions may alter taste, texture, or nutritional content. Test in small batches first. &quot;Excellent&quot; substitutes are nearly indistinguishable in the final dish.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Ingredient to Substitute
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {selected}
                        </span>
                    </label>
                    <select value={selected} onChange={e => setSelected(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {INGREDIENT_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Browse by Category</p>
                    <div className="space-y-1">
                        {Array.from(new Set(SUBSTITUTION_DB.map(s => s.category))).sort().map(cat => (
                            <div key={cat}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 mb-1">{cat}</p>
                                {SUBSTITUTION_DB.filter(s => s.category === cat).map(s => (
                                    <button key={s.ingredient} onClick={() => setSelected(s.ingredient)}
                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${selected === s.ingredient
                                            ? 'bg-emerald-500 text-white'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}>
                                        {s.ingredient}
                                        <span className="float-right opacity-75">{s.substitutions.length}</span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
