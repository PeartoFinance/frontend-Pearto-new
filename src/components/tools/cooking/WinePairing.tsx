'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Wine, Thermometer, GlassWater, Info } from 'lucide-react';

interface WineRecommendation {
    wine: string;
    type: 'Red' | 'White' | 'Rosé' | 'Sparkling' | 'Dessert';
    description: string;
    servingTemp: string;
    glassType: string;
    notes: string;
}

const PAIRINGS: Record<string, WineRecommendation[]> = {
    'Beef / Steak': [
        { wine: 'Cabernet Sauvignon', type: 'Red', description: 'Bold and full-bodied with dark fruit flavors and firm tannins. The classic steak wine.', servingTemp: '60-65°F (16-18°C)', glassType: 'Bordeaux glass', notes: 'Let breathe 30 minutes before serving.' },
        { wine: 'Malbec', type: 'Red', description: 'Rich, dark, and smoky with plum and blackberry notes. Great with grilled meats.', servingTemp: '60-65°F (16-18°C)', glassType: 'Standard red wine glass', notes: 'Argentinian Malbec pairs especially well with chimichurri.' },
        { wine: 'Syrah/Shiraz', type: 'Red', description: 'Peppery and bold with dark fruit and sometimes smoky or meaty notes.', servingTemp: '60-65°F (16-18°C)', glassType: 'Standard red wine glass', notes: 'Australian Shiraz tends to be fruitier; French Syrah more peppery.' },
    ],
    'Chicken / Poultry': [
        { wine: 'Chardonnay', type: 'White', description: 'Versatile white ranging from crisp and citrusy to rich and buttery. Matches roasted or creamy chicken dishes.', servingTemp: '48-54°F (9-12°C)', glassType: 'White wine glass', notes: 'Oaked Chardonnay for creamy dishes; unoaked for lighter preparations.' },
        { wine: 'Pinot Noir', type: 'Red', description: 'Light-bodied red with cherry, raspberry, and earthy notes. Elegant and food-friendly.', servingTemp: '55-60°F (13-16°C)', glassType: 'Burgundy glass', notes: 'Serve slightly chilled. Excellent with herb-roasted chicken.' },
        { wine: 'Sauvignon Blanc', type: 'White', description: 'Crisp and refreshing with citrus, green apple, and herbaceous notes.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'Perfect for grilled chicken with herbs or citrus marinade.' },
    ],
    'Fish / Seafood': [
        { wine: 'Pinot Grigio', type: 'White', description: 'Light, crisp, and clean with citrus and pear flavors. The go-to for delicate fish.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'Best with light, non-oily fish like sole, tilapia, cod.' },
        { wine: 'Chablis', type: 'White', description: 'Mineral-driven, unoaked Chardonnay from Burgundy with crisp acidity and flinty character.', servingTemp: '48-52°F (9-11°C)', glassType: 'White wine glass', notes: 'Classic pairing with oysters and shellfish.' },
        { wine: 'Albariño', type: 'White', description: 'Aromatic Spanish white with peach, citrus, and saline notes. Born for seafood.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'Especially great with shrimp, scallops, and ceviche.' },
        { wine: 'Rosé', type: 'Rosé', description: 'Dry and refreshing with red fruit and citrus notes. Versatile for all seafood.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'Provence-style rosé is ideal for grilled fish.' },
    ],
    'Pasta (tomato-based)': [
        { wine: 'Chianti', type: 'Red', description: 'Medium-bodied Italian red with cherry, tomato leaf, and earthy notes. Made for tomato sauce.', servingTemp: '58-62°F (14-17°C)', glassType: 'Standard red wine glass', notes: 'Chianti Classico for better quality. Perfect with spaghetti bolognese.' },
        { wine: 'Sangiovese', type: 'Red', description: 'Bright acidity and tart cherry flavors that complement tomato-based sauces beautifully.', servingTemp: '58-62°F (14-17°C)', glassType: 'Standard red wine glass', notes: 'The grape behind Chianti. Also great with pizza.' },
        { wine: 'Barbera', type: 'Red', description: 'Italian red with bright acidity, dark cherry fruit, and low tannins.', servingTemp: '58-62°F (14-17°C)', glassType: 'Standard red wine glass', notes: 'Lighter alternative to Chianti. Great value Italian wine.' },
    ],
    'Pasta (cream-based)': [
        { wine: 'Chardonnay (oaked)', type: 'White', description: 'Rich and buttery with vanilla and tropical fruit notes. Matches cream sauces beautifully.', servingTemp: '50-55°F (10-13°C)', glassType: 'White wine glass', notes: 'A California or Australian Chardonnay works best here.' },
        { wine: 'Viognier', type: 'White', description: 'Aromatic and full-bodied with peach, apricot, and floral notes.', servingTemp: '50-55°F (10-13°C)', glassType: 'White wine glass', notes: 'Rich enough to stand up to creamy Alfredo sauce.' },
    ],
    'Cheese': [
        { wine: 'Champagne / Sparkling', type: 'Sparkling', description: 'The acidity and bubbles cut through rich, creamy cheeses perfectly.', servingTemp: '40-45°F (4-7°C)', glassType: 'Champagne flute', notes: 'Pairs with almost any cheese. Especially great with brie and camembert.' },
        { wine: 'Port', type: 'Dessert', description: 'Sweet, rich, and complex with dark fruit and nutty notes. Classic with blue cheese.', servingTemp: '58-64°F (14-18°C)', glassType: 'Port glass', notes: 'Stilton or Roquefort with vintage Port is a legendary pairing.' },
        { wine: 'Riesling', type: 'White', description: 'Aromatic with bright acidity and stone fruit. Off-dry versions fantastic with washed-rind cheese.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'Sweet Riesling with blue cheese is an incredible contrast.' },
    ],
    'Dessert': [
        { wine: 'Moscato d\'Asti', type: 'Sparkling', description: 'Lightly sparkling Italian wine with peach, apricot, and honey. Low alcohol and refreshing.', servingTemp: '40-45°F (4-7°C)', glassType: 'Champagne flute', notes: 'Perfect with fruit-based desserts and lighter cakes.' },
        { wine: 'Sauternes', type: 'Dessert', description: 'Rich French dessert wine with honey, apricot, and caramel notes.', servingTemp: '45-50°F (7-10°C)', glassType: 'Dessert wine glass', notes: 'The wine should be sweeter than the dessert. Pairs with crème brûlée.' },
        { wine: 'Late Harvest Riesling', type: 'Dessert', description: 'Sweet wine with concentrated stone fruit, honey, and ginger notes.', servingTemp: '45-50°F (7-10°C)', glassType: 'Dessert wine glass', notes: 'Excellent with apple pie, tarts, and fruit-based desserts.' },
        { wine: 'Tawny Port', type: 'Dessert', description: 'Nutty, caramelized flavors with dried fruit and spice complexity.', servingTemp: '55-60°F (13-16°C)', glassType: 'Port glass', notes: 'Perfect with chocolate desserts, nuts, and caramel.' },
    ],
    'Lamb': [
        { wine: 'Bordeaux Blend', type: 'Red', description: 'Elegant blend typically of Cabernet Sauvignon and Merlot with complex dark fruit and cedar notes.', servingTemp: '60-65°F (16-18°C)', glassType: 'Bordeaux glass', notes: 'The traditional Easter lamb pairing. Decant for 30-60 minutes.' },
        { wine: 'Tempranillo', type: 'Red', description: 'Spanish red with cherry, leather, and tobacco notes. Rioja is the classic choice.', servingTemp: '60-65°F (16-18°C)', glassType: 'Standard red wine glass', notes: 'Rioja Reserva with lamb chops is a match made in heaven.' },
    ],
    'Pork': [
        { wine: 'Pinot Noir', type: 'Red', description: 'Light enough to not overpower pork, but complex enough to complement it.', servingTemp: '55-60°F (13-16°C)', glassType: 'Burgundy glass', notes: 'Works with everything from pork tenderloin to pulled pork.' },
        { wine: 'Gewürztraminer', type: 'White', description: 'Aromatic and slightly sweet with lychee, rose, and spice notes.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'Incredible with Asian-spiced pork dishes.' },
        { wine: 'Riesling (off-dry)', type: 'White', description: 'Bright acidity with stone fruit and a touch of sweetness.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'Classic with pork and sauerkraut. Alsatian Riesling is ideal.' },
    ],
    'Spicy Food': [
        { wine: 'Riesling (off-dry)', type: 'White', description: 'Slight sweetness tames the heat while bright acidity refreshes.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'The #1 pairing for Thai, Indian, and Sichuan cuisine.' },
        { wine: 'Gewürztraminer', type: 'White', description: 'Aromatic intensity matches bold spices while sweetness balances heat.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'Excellent with curries and chili-based dishes.' },
        { wine: 'Prosecco', type: 'Sparkling', description: 'Light bubbles and gentle fruit cleanse the palate between bites.', servingTemp: '40-45°F (4-7°C)', glassType: 'Champagne flute', notes: 'Budget-friendly and effective with spicy appetizers.' },
    ],
    'Vegetarian / Salad': [
        { wine: 'Sauvignon Blanc', type: 'White', description: 'Herbaceous and green notes mirror salad ingredients. Bright and refreshing.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'New Zealand Sauvignon Blanc for bolder green flavors.' },
        { wine: 'Grüner Veltliner', type: 'White', description: 'Austrian white with white pepper, citrus, and vegetal notes. Veggie wine superstar.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'Arguably the best wine for asparagus and artichoke dishes.' },
        { wine: 'Rosé', type: 'Rosé', description: 'Versatile and food-friendly with enough fruit to complement vegetables.', servingTemp: '45-50°F (7-10°C)', glassType: 'White wine glass', notes: 'Dry rosé works with virtually any vegetable dish.' },
    ],
};

const FOOD_TYPES = Object.keys(PAIRINGS);

export default function WinePairing() {
    const [foodType, setFoodType] = useState(FOOD_TYPES[0]);

    const recommendations = useMemo(() => PAIRINGS[foodType] || [], [foodType]);

    const typeColors: Record<string, string> = {
        'Red': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'White': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'Rosé': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        'Sparkling': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
        'Dessert': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <CalculatorLayout
            title="Wine Pairing Guide"
            description="Find the perfect wine for any dish"
            category="Cooking & Recipes"
            insights={[
                { label: 'Dish', value: foodType },
                { label: 'Pairings', value: `${recommendations.length}`, color: 'text-blue-600' },
                { label: 'Top Pick', value: recommendations[0]?.wine || '-', color: 'text-red-600' },
                { label: 'Type', value: recommendations[0]?.type || '-', color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-4">
                    <div className="text-center p-5 bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-900/20 dark:to-purple-900/20 rounded-xl">
                        <Wine className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Wine Pairings for</p>
                        <p className="text-2xl font-bold text-red-600">{foodType}</p>
                        <p className="text-sm text-slate-500 mt-1">{recommendations.length} wine recommendations</p>
                    </div>

                    {recommendations.map((rec, i) => (
                        <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{rec.wine}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[rec.type]}`}>
                                    {rec.type}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{rec.description}</p>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Thermometer size={12} className="text-orange-400" />
                                    <span>{rec.servingTemp}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <GlassWater size={12} className="text-blue-400" />
                                    <span>{rec.glassType}</span>
                                </div>
                            </div>

                            {rec.notes && (
                                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">💡 {rec.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-amber-600 dark:text-amber-400">
                                Wine pairing is subjective — these are classic suggestions, but the best wine is the one you enjoy most. When in doubt, sparkling wine pairs with almost everything.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Food Type
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-full">
                            {foodType}
                        </span>
                    </label>
                    <select value={foodType} onChange={e => setFoodType(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {FOOD_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>

                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Browse Dishes</p>
                    <div className="space-y-1">
                        {FOOD_TYPES.map(f => (
                            <button key={f} onClick={() => setFoodType(f)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${foodType === f
                                    ? 'bg-red-500 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}>
                                {f}
                                <span className="float-right opacity-75 text-xs">{PAIRINGS[f].length}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
