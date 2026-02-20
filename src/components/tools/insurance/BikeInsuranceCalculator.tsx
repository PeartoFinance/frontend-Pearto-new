'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Bike, Shield, Percent, MapPin, Wrench } from 'lucide-react';

export default function BikeInsuranceCalculator() {
    const { formatPrice } = useCurrency();
    const [bikeValue, setBikeValue] = useState(100000);
    const [bikeAge, setBikeAge] = useState(2);
    const [engineCC, setEngineCC] = useState(150);
    const [city, setCity] = useState<'metro' | 'non-metro'>('metro');
    const [ncbPercent, setNcbPercent] = useState(25);
    const [addOns, setAddOns] = useState<{ pa: boolean; accessories: boolean; zeroDep: boolean }>({
        pa: false,
        accessories: false,
        zeroDep: false,
    });

    const toggleAddOn = (key: keyof typeof addOns) => {
        setAddOns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const result = useMemo(() => {
        // IDV depreciation by bike age
        const depreciationRates: Record<number, number> = {
            0: 0, 1: 0.15, 2: 0.20, 3: 0.30, 4: 0.40, 5: 0.50,
        };
        const depreciation = depreciationRates[Math.min(bikeAge, 5)] ?? 0.50;
        const idv = Math.round(bikeValue * (1 - depreciation));

        // OD premium (own damage) — approx 2.5% of IDV
        let odRate = 0.025;
        if (engineCC > 350) odRate = 0.035;
        else if (engineCC > 150) odRate = 0.03;
        const baseOD = idv * odRate;

        // City factor
        const cityFactor = city === 'metro' ? 1.1 : 1.0;

        // NCB discount
        const ncbDiscount = baseOD * (ncbPercent / 100);
        const odPremium = Math.round((baseOD * cityFactor) - ncbDiscount);

        // TP premium (third party) — based on engine CC (IRDAI rates)
        let tpPremium = 714;
        if (engineCC <= 75) tpPremium = 538;
        else if (engineCC <= 150) tpPremium = 714;
        else if (engineCC <= 350) tpPremium = 1366;
        else tpPremium = 2804;

        // Add-on costs
        let addOnTotal = 0;
        if (addOns.pa) addOnTotal += 150; // PA cover
        if (addOns.accessories) addOnTotal += Math.round(idv * 0.005); // Accessories cover
        if (addOns.zeroDep) addOnTotal += Math.round(idv * 0.015); // Zero depreciation

        const totalPremium = Math.max(0, odPremium) + tpPremium + addOnTotal;
        const gst = Math.round(totalPremium * 0.18);
        const finalPremium = totalPremium + gst;

        return {
            idv,
            depreciation: Math.round(depreciation * 100),
            odPremium: Math.max(0, odPremium),
            tpPremium,
            ncbDiscount: Math.round(ncbDiscount),
            addOnTotal,
            totalPremium,
            gst,
            finalPremium,
        };
    }, [bikeValue, bikeAge, engineCC, city, ncbPercent, addOns]);

    // Donut segments
    const segments = [
        { label: 'Own Damage', value: result.odPremium, color: '#3b82f6' },
        { label: 'Third Party', value: result.tpPremium, color: '#f59e0b' },
        { label: 'Add-ons', value: result.addOnTotal, color: '#8b5cf6' },
        { label: 'GST', value: result.gst, color: '#ef4444' },
    ].filter(s => s.value > 0);
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const r = 42, circ = 2 * Math.PI * r;
    let cumulativeOffset = 0;

    return (
        <CalculatorLayout
            title="Bike Insurance Calculator"
            description="Estimate your two-wheeler insurance premium including OD, TP, and add-on covers"
            category="Insurance"
            insights={[
                { label: 'Total Premium', value: formatPrice(result.finalPremium), color: 'text-purple-600' },
                { label: 'IDV', value: formatPrice(result.idv) },
                { label: 'NCB Saving', value: formatPrice(result.ncbDiscount), color: 'text-emerald-600' },
                { label: 'Depreciation', value: `${result.depreciation}%`, color: 'text-amber-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Main display */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200/60 dark:border-purple-800/40">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Estimated Total Premium</p>
                        <p className="text-4xl font-bold text-purple-600">{formatPrice(result.finalPremium)}</p>
                        <p className="text-sm text-slate-500 mt-1">per year (incl. 18% GST)</p>
                    </div>

                    {/* Donut chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="110" height="110" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            {segments.map((seg, i) => {
                                const pct = total > 0 ? seg.value / total : 0;
                                const segLen = pct * circ;
                                const rotation = -90 + (cumulativeOffset / total) * 360;
                                cumulativeOffset += seg.value;
                                return (
                                    <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="8" strokeDasharray={`${segLen} ${circ - segLen}`} strokeLinecap="butt" transform={`rotate(${rotation} 50 50)`} />
                                );
                            })}
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[10px] font-bold">IDV</text>
                            <text x="50" y="60" textAnchor="middle" className="fill-slate-500 text-[8px]">{formatPrice(result.idv)}</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Premium Breakdown</p>
                            {segments.map((seg, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">{seg.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(seg.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Breakdown cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">OD Premium</span>
                            <p className="text-lg font-semibold text-blue-600">{formatPrice(result.odPremium)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">TP Premium</span>
                            <p className="text-lg font-semibold text-amber-600">{formatPrice(result.tpPremium)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">IDV (Insured Value)</span>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatPrice(result.idv)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">NCB Discount</span>
                            <p className="text-lg font-semibold text-emerald-600">-{formatPrice(result.ncbDiscount)}</p>
                        </div>
                    </div>

                    {/* IDV depreciation bar */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">IDV Depreciation</p>
                        <div className="flex h-4 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 transition-all" style={{ width: `${100 - result.depreciation}%` }} />
                            <div className="bg-slate-300 dark:bg-slate-600 transition-all" style={{ width: `${result.depreciation}%` }} />
                        </div>
                        <div className="flex justify-between mt-2 text-[11px] text-slate-500">
                            <span>Current IDV ({100 - result.depreciation}%)</span>
                            <span>Depreciation ({result.depreciation}%)</span>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Bike Value (IDV) */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bike Value (Ex-Showroom)</label>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(bikeValue)}</span>
                </div>
                <input type="number" value={bikeValue} onChange={e => setBikeValue(Number(e.target.value))} min={20000} step={5000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={20000} max={500000} step={5000} value={bikeValue} onChange={e => setBikeValue(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Bike Age */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bike Age</label>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{bikeAge} years</span>
                </div>
                <input type="range" min={0} max={10} value={bikeAge} onChange={e => setBikeAge(Number(e.target.value))} className="w-full accent-blue-500" />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>New</span>
                    <span className="font-medium text-blue-600">{bikeAge} years</span>
                    <span>10+</span>
                </div>
            </div>

            {/* Engine CC */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Engine CC</label>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{engineCC} cc</span>
                </div>
                <select value={engineCC} onChange={e => setEngineCC(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm">
                    <option value={75}>Up to 75cc</option>
                    <option value={100}>100cc</option>
                    <option value={110}>110cc</option>
                    <option value={125}>125cc</option>
                    <option value={150}>150cc</option>
                    <option value={200}>200cc</option>
                    <option value={250}>250cc</option>
                    <option value={350}>350cc</option>
                    <option value={500}>500cc+</option>
                </select>
            </div>

            {/* City */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setCity('metro')}
                        className={`py-3 px-4 rounded-lg font-medium transition-colors ${city === 'metro' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                        Metro
                    </button>
                    <button onClick={() => setCity('non-metro')}
                        className={`py-3 px-4 rounded-lg font-medium transition-colors ${city === 'non-metro' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                        Non-Metro
                    </button>
                </div>
            </div>

            {/* NCB % */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">No Claim Bonus (NCB %)</label>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{ncbPercent}%</span>
                </div>
                <input type="range" min={0} max={50} step={5} value={ncbPercent} onChange={e => setNcbPercent(Number(e.target.value))} className="w-full accent-emerald-500" />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0% (No NCB)</span>
                    <span>50% (Max)</span>
                </div>
            </div>

            {/* Add-ons */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Add-on Covers</label>
                <div className="space-y-2">
                    {[
                        { key: 'pa' as const, label: 'Personal Accident Cover' },
                        { key: 'accessories' as const, label: 'Accessories Cover' },
                        { key: 'zeroDep' as const, label: 'Zero Depreciation' },
                    ].map(addon => (
                        <label key={addon.key} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                            <input
                                type="checkbox"
                                checked={addOns[addon.key]}
                                onChange={() => toggleAddOn(addon.key)}
                                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{addon.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
