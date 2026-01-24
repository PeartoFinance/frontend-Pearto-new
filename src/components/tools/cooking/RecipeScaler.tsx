'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Scale, ChefHat, Users } from 'lucide-react';

export default function RecipeScaler() {
    const [originalServings, setOriginalServings] = useState(4);
    const [desiredServings, setDesiredServings] = useState(8);
    const [ingredients, setIngredients] = useState(
        `2 cups flour
1 cup sugar
3 eggs
1/2 cup butter
1 tsp vanilla
2 tbsp milk`
    );

    const scaledIngredients = useMemo(() => {
        const ratio = desiredServings / originalServings;

        return ingredients.split('\n').map(line => {
            // Try to match number at start (including fractions)
            const match = line.match(/^([\d/.\s]+)(.*)$/);
            if (!match) return line;

            const [, numPart, rest] = match;

            // Parse the number (handle fractions like 1/2)
            let amount: number;
            if (numPart.includes('/')) {
                const parts = numPart.trim().split(' ');
                let total = 0;
                parts.forEach(p => {
                    if (p.includes('/')) {
                        const [num, den] = p.split('/');
                        total += parseInt(num) / parseInt(den);
                    } else if (p) {
                        total += parseFloat(p);
                    }
                });
                amount = total;
            } else {
                amount = parseFloat(numPart);
            }

            if (isNaN(amount)) return line;

            const scaled = amount * ratio;

            // Format nicely
            let formatted: string;
            if (scaled === Math.floor(scaled)) {
                formatted = scaled.toString();
            } else if (Math.abs(scaled - Math.round(scaled * 4) / 4) < 0.01) {
                // Close to a quarter
                const quarters = Math.round(scaled * 4);
                const whole = Math.floor(quarters / 4);
                const frac = quarters % 4;
                const fracs = ['', '1/4', '1/2', '3/4'];
                formatted = whole > 0 ? `${whole}${frac ? ' ' + fracs[frac] : ''}` : fracs[frac] || '0';
            } else {
                formatted = scaled.toFixed(2);
            }

            return `${formatted}${rest}`;
        });
    }, [ingredients, originalServings, desiredServings]);

    const ratio = desiredServings / originalServings;

    return (
        <CalculatorLayout
            title="Recipe Scaler"
            description="Scale recipe ingredients up or down"
            category="Cooking & Recipes"
            results={
                <div className="space-y-4">
                    <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <Scale className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Scale Factor</p>
                        <p className="text-3xl font-bold text-emerald-600">{ratio.toFixed(2)}x</p>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <ChefHat className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Scaled Ingredients ({desiredServings} servings)
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {scaledIngredients.map((ing, i) => (
                                <li
                                    key={i}
                                    className="text-sm text-slate-600 dark:text-slate-400 py-1 border-b border-slate-100 dark:border-slate-700 last:border-0"
                                >
                                    {ing}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {[0.5, 1.5, 2, 3, 4].map(mult => (
                            <button
                                key={mult}
                                onClick={() => setDesiredServings(Math.round(originalServings * mult))}
                                className="py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition"
                            >
                                {mult}x
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Original Servings
                        </label>
                        <input
                            type="number"
                            value={originalServings}
                            onChange={(e) => setOriginalServings(Math.max(1, Number(e.target.value)))}
                            min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Desired Servings
                        </label>
                        <input
                            type="number"
                            value={desiredServings}
                            onChange={(e) => setDesiredServings(Math.max(1, Number(e.target.value)))}
                            min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Original Ingredients (one per line)
                    </label>
                    <textarea
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        placeholder="2 cups flour\n1 cup sugar\n3 eggs"
                        rows={8}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm resize-none"
                    />
                </div>

                <p className="text-xs text-slate-500">
                    Tip: Enter quantities at the start of each line (e.g., "2 cups flour", "1/2 tsp salt")
                </p>
            </div>
        </CalculatorLayout>
    );
}
