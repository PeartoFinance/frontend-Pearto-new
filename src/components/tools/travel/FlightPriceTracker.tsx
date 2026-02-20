'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Plane, TrendingDown, TrendingUp, Calendar, Info, DollarSign } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

const ROUTES: Record<string, { base: number; variance: number }> = {
    'NYC-LON': { base: 650, variance: 250 },
    'NYC-PAR': { base: 700, variance: 280 },
    'NYC-TOK': { base: 1100, variance: 400 },
    'NYC-DXB': { base: 900, variance: 350 },
    'LAX-LON': { base: 750, variance: 300 },
    'LAX-TOK': { base: 850, variance: 300 },
    'LAX-SYD': { base: 1200, variance: 450 },
    'CHI-LON': { base: 680, variance: 260 },
    'LON-PAR': { base: 120, variance: 80 },
    'LON-TOK': { base: 950, variance: 350 },
    'LON-DXB': { base: 550, variance: 200 },
    'SFO-TOK': { base: 800, variance: 280 },
    'SFO-LON': { base: 780, variance: 300 },
    'MIA-CUN': { base: 250, variance: 120 },
    'NYC-MIA': { base: 180, variance: 90 },
};

const CITIES = ['NYC', 'LAX', 'CHI', 'SFO', 'MIA', 'LON', 'PAR', 'TOK', 'DXB', 'SYD', 'CUN'];
const CITY_NAMES: Record<string, string> = {
    NYC: 'New York', LAX: 'Los Angeles', CHI: 'Chicago', SFO: 'San Francisco',
    MIA: 'Miami', LON: 'London', PAR: 'Paris', TOK: 'Tokyo', DXB: 'Dubai',
    SYD: 'Sydney', CUN: 'Cancun',
};

const CLASS_MULTIPLIER: Record<string, number> = {
    economy: 1,
    'premium-economy': 1.6,
    business: 3.2,
    first: 5.5,
};

export default function FlightPriceTracker() {
    const [from, setFrom] = useState('NYC');
    const [to, setTo] = useState('LON');
    const [travelMonth, setTravelMonth] = useState(6);
    const [cabinClass, setCabinClass] = useState('economy');
    const { formatPrice } = useCurrency();

    const estimate = useMemo(() => {
        const routeKey = `${from}-${to}`;
        const reverseKey = `${to}-${from}`;
        const route = ROUTES[routeKey] || ROUTES[reverseKey];

        if (!route || from === to) return null;

        const classMultiplier = CLASS_MULTIPLIER[cabinClass];

        // Seasonal adjustments
        const peakMonths = [6, 7, 8, 12]; // summer & holidays
        const offPeakMonths = [1, 2, 3, 11];
        let seasonMultiplier = 1;
        if (peakMonths.includes(travelMonth)) seasonMultiplier = 1.35;
        else if (offPeakMonths.includes(travelMonth)) seasonMultiplier = 0.75;

        const basePrice = route.base * classMultiplier * seasonMultiplier;
        const low = Math.round(basePrice - route.variance * 0.5 * classMultiplier);
        const high = Math.round(basePrice + route.variance * classMultiplier);
        const avg = Math.round(basePrice);

        const seasonLabel = peakMonths.includes(travelMonth) ? 'Peak' : offPeakMonths.includes(travelMonth) ? 'Off-Peak' : 'Shoulder';

        return { low: Math.max(low, 50), high, avg, seasonLabel, seasonMultiplier };
    }, [from, to, travelMonth, cabinClass]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const tips = [
        'Book 6-8 weeks in advance for domestic flights, 2-3 months for international.',
        'Tuesday and Wednesday departures are often cheapest.',
        'Use incognito browsing to avoid price tracking cookies.',
        'Be flexible with dates — even 1 day shift can save 20%+.',
        'Consider nearby airports for potentially lower fares.',
        'Red-eye flights and early mornings are typically cheaper.',
    ];

    return (
        <CalculatorLayout
            title="Flight Price Tracker"
            description="Estimate flight prices and get booking tips"
            category="Travel"
            insights={[
                { label: 'Route', value: `${from}→${to}` },
                { label: 'Class', value: cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1), color: 'text-blue-600' },
                { label: 'Season', value: estimate?.seasonLabel || '-', color: 'text-purple-600' },
                { label: 'Est. Avg', value: estimate ? formatPrice(estimate.avg) : '-', color: 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    {!estimate ? (
                        <div className="text-center p-8 text-slate-400">
                            <Plane className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">{from === to ? 'Please select different cities' : 'No data for this route'}</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-xl">
                                <Plane className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">{CITY_NAMES[from]} → {CITY_NAMES[to]}</p>
                                <p className="text-4xl font-bold text-blue-600">{formatPrice(estimate.avg)}</p>
                                <p className="text-sm text-slate-500 mt-1">Estimated average &middot; {cabinClass}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <TrendingDown className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Low</p>
                                    <p className="text-lg font-bold text-emerald-600">{formatPrice(estimate.low)}</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <DollarSign className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Average</p>
                                    <p className="text-lg font-bold text-blue-600">{formatPrice(estimate.avg)}</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <TrendingUp className="w-4 h-4 text-red-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">High</p>
                                    <p className="text-lg font-bold text-red-600">{formatPrice(estimate.high)}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Price Factors</p>
                                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Season</span>
                                        <span className={`font-medium ${estimate.seasonLabel === 'Peak' ? 'text-red-500' : estimate.seasonLabel === 'Off-Peak' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {estimate.seasonLabel} ({estimate.seasonMultiplier > 1 ? '+' : ''}{Math.round((estimate.seasonMultiplier - 1) * 100)}%)
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Cabin Class</span>
                                        <span className="font-medium">{CLASS_MULTIPLIER[cabinClass]}× base</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Month</span>
                                        <span className="font-medium">{monthNames[travelMonth - 1]}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Booking Tips</span>
                                </div>
                                <ul className="space-y-1.5">
                                    {tips.map((tip, i) => (
                                        <li key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                                            <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="text-[10px] text-slate-400 text-center">
                                * Estimates are based on general averages and may not reflect real-time prices.
                            </p>
                        </>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        From
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {CITY_NAMES[from]}
                        </span>
                    </label>
                    <select value={from} onChange={e => setFrom(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {CITIES.map(c => <option key={c} value={c}>{c} - {CITY_NAMES[c]}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        To
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {CITY_NAMES[to]}
                        </span>
                    </label>
                    <select value={to} onChange={e => setTo(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {CITIES.map(c => <option key={c} value={c}>{c} - {CITY_NAMES[c]}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Travel Month
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {monthNames[travelMonth - 1]}
                        </span>
                    </label>
                    <select value={travelMonth} onChange={e => setTravelMonth(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Cabin Class
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {cabinClass}
                        </span>
                    </label>
                    <select value={cabinClass} onChange={e => setCabinClass(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        <option value="economy">Economy</option>
                        <option value="premium-economy">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First Class</option>
                    </select>
                </div>
            </div>
        </CalculatorLayout>
    );
}
