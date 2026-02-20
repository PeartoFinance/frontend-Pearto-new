'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Luggage, Check, Square, CheckSquare, Sun, Snowflake, CloudSun } from 'lucide-react';

type TripType = 'business' | 'beach' | 'hiking' | 'city';
type Climate = 'hot' | 'cold' | 'mild';

interface PackingItem {
    name: string;
    category: string;
}

const BASE_ITEMS: PackingItem[] = [
    { name: 'Passport / ID', category: 'Documents' },
    { name: 'Boarding pass / tickets', category: 'Documents' },
    { name: 'Travel insurance docs', category: 'Documents' },
    { name: 'Phone & charger', category: 'Electronics' },
    { name: 'Power bank', category: 'Electronics' },
    { name: 'Headphones', category: 'Electronics' },
    { name: 'Toothbrush & toothpaste', category: 'Toiletries' },
    { name: 'Deodorant', category: 'Toiletries' },
    { name: 'Shampoo & conditioner', category: 'Toiletries' },
    { name: 'Medications', category: 'Health' },
    { name: 'First aid kit', category: 'Health' },
    { name: 'Wallet & credit cards', category: 'Documents' },
];

const TRIP_ITEMS: Record<TripType, PackingItem[]> = {
    business: [
        { name: 'Suits / blazers', category: 'Clothing' },
        { name: 'Dress shirts', category: 'Clothing' },
        { name: 'Dress shoes', category: 'Clothing' },
        { name: 'Ties / accessories', category: 'Clothing' },
        { name: 'Laptop & charger', category: 'Electronics' },
        { name: 'Business cards', category: 'Documents' },
        { name: 'Notebook & pen', category: 'Documents' },
        { name: 'Portfolio / briefcase', category: 'Accessories' },
    ],
    beach: [
        { name: 'Swimsuit(s)', category: 'Clothing' },
        { name: 'Flip flops / sandals', category: 'Clothing' },
        { name: 'Beach towel', category: 'Accessories' },
        { name: 'Sunscreen SPF 50+', category: 'Toiletries' },
        { name: 'Sunglasses', category: 'Accessories' },
        { name: 'Sun hat', category: 'Accessories' },
        { name: 'Snorkel gear', category: 'Accessories' },
        { name: 'After-sun lotion', category: 'Toiletries' },
        { name: 'Waterproof phone pouch', category: 'Electronics' },
    ],
    hiking: [
        { name: 'Hiking boots', category: 'Clothing' },
        { name: 'Moisture-wicking socks', category: 'Clothing' },
        { name: 'Quick-dry pants / shorts', category: 'Clothing' },
        { name: 'Daypack / backpack', category: 'Accessories' },
        { name: 'Water bottle / hydration pack', category: 'Accessories' },
        { name: 'Trail map / GPS', category: 'Electronics' },
        { name: 'Insect repellent', category: 'Toiletries' },
        { name: 'Sunscreen', category: 'Toiletries' },
        { name: 'Flashlight / headlamp', category: 'Accessories' },
        { name: 'Multi-tool / knife', category: 'Accessories' },
        { name: 'Energy bars / snacks', category: 'Food' },
    ],
    city: [
        { name: 'Comfortable walking shoes', category: 'Clothing' },
        { name: 'Casual outfits', category: 'Clothing' },
        { name: 'Camera', category: 'Electronics' },
        { name: 'Day bag / crossbody', category: 'Accessories' },
        { name: 'Guidebook / map', category: 'Documents' },
        { name: 'Umbrella', category: 'Accessories' },
        { name: 'Reusable water bottle', category: 'Accessories' },
    ],
};

const CLIMATE_ITEMS: Record<Climate, PackingItem[]> = {
    hot: [
        { name: 'Light t-shirts', category: 'Clothing' },
        { name: 'Shorts', category: 'Clothing' },
        { name: 'Light dress / skirt', category: 'Clothing' },
        { name: 'Sunscreen', category: 'Toiletries' },
        { name: 'Wide-brim hat', category: 'Accessories' },
    ],
    cold: [
        { name: 'Winter jacket / coat', category: 'Clothing' },
        { name: 'Thermal underwear', category: 'Clothing' },
        { name: 'Warm sweaters / fleece', category: 'Clothing' },
        { name: 'Gloves', category: 'Accessories' },
        { name: 'Scarf', category: 'Accessories' },
        { name: 'Beanie / warm hat', category: 'Accessories' },
        { name: 'Warm socks', category: 'Clothing' },
        { name: 'Lip balm', category: 'Toiletries' },
    ],
    mild: [
        { name: 'Light layers', category: 'Clothing' },
        { name: 'Light jacket', category: 'Clothing' },
        { name: 'Jeans / pants', category: 'Clothing' },
        { name: 'Versatile shoes', category: 'Clothing' },
    ],
};

export default function PackingList() {
    const [tripType, setTripType] = useState<TripType>('city');
    const [duration, setDuration] = useState(5);
    const [climate, setClimate] = useState<Climate>('mild');
    const [checked, setChecked] = useState<Set<string>>(new Set());

    const items = useMemo(() => {
        const uniqueMap = new Map<string, PackingItem>();
        [...BASE_ITEMS, ...TRIP_ITEMS[tripType], ...CLIMATE_ITEMS[climate]].forEach(item => {
            uniqueMap.set(item.name, item);
        });

        // Add underwear/socks based on duration
        for (let i = 0; i < Math.min(duration, 10); i++) {
            uniqueMap.set(`Underwear (×${duration})`, { name: `Underwear (×${duration})`, category: 'Clothing' });
            uniqueMap.set(`Socks (×${duration})`, { name: `Socks (×${duration})`, category: 'Clothing' });
        }

        return Array.from(uniqueMap.values());
    }, [tripType, climate, duration]);

    const categories = useMemo(() => {
        const cats = new Map<string, PackingItem[]>();
        items.forEach(item => {
            if (!cats.has(item.category)) cats.set(item.category, []);
            cats.get(item.category)!.push(item);
        });
        return Array.from(cats.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [items]);

    const toggleItem = (name: string) => {
        setChecked(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    };

    const packedCount = checked.size;
    const totalCount = items.length;
    const progress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

    const climateIcon = climate === 'hot' ? Sun : climate === 'cold' ? Snowflake : CloudSun;
    const ClimateIcon = climateIcon;

    return (
        <CalculatorLayout
            title="Packing List"
            description="Auto-generate a categorized packing checklist for your trip"
            category="Travel"
            insights={[
                { label: 'Trip Type', value: tripType.charAt(0).toUpperCase() + tripType.slice(1) },
                { label: 'Duration', value: `${duration} days`, color: 'text-blue-600' },
                { label: 'Items', value: `${totalCount}`, color: 'text-emerald-600' },
                { label: 'Packed', value: `${progress}%`, color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-4">
                    <div className="text-center p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                        <Luggage className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Packing Progress</p>
                        <p className="text-4xl font-bold text-emerald-600">{progress}%</p>
                        <p className="text-sm text-slate-500 mt-1">{packedCount} of {totalCount} items packed</p>
                        <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    {categories.map(([cat, catItems]) => (
                        <div key={cat} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{cat}</span>
                                <span className="text-[10px] text-slate-400">
                                    {catItems.filter(i => checked.has(i.name)).length}/{catItems.length}
                                </span>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {catItems.map(item => (
                                    <button
                                        key={item.name}
                                        onClick={() => toggleItem(item.name)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                                    >
                                        {checked.has(item.name) ? (
                                            <CheckSquare size={16} className="text-emerald-500 flex-shrink-0" />
                                        ) : (
                                            <Square size={16} className="text-slate-300 flex-shrink-0" />
                                        )}
                                        <span className={`text-sm ${checked.has(item.name) ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {item.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Trip Type
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {tripType}
                        </span>
                    </label>
                    <select
                        value={tripType}
                        onChange={e => { setTripType(e.target.value as TripType); setChecked(new Set()); }}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    >
                        <option value="business">Business</option>
                        <option value="beach">Beach</option>
                        <option value="hiking">Hiking</option>
                        <option value="city">City Break</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Duration
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {duration} days
                        </span>
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={30}
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>1 day</span><span>30 days</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Climate
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {climate}
                        </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {([['hot', '☀️ Hot'], ['mild', '🌤️ Mild'], ['cold', '❄️ Cold']] as const).map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => { setClimate(val); setChecked(new Set()); }}
                                className={`py-2.5 rounded-lg text-sm font-medium transition ${climate === val
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setChecked(new Set())}
                    className="w-full py-2 text-xs text-slate-500 hover:text-red-500 transition"
                >
                    Reset All Checkboxes
                </button>
            </div>
        </CalculatorLayout>
    );
}
