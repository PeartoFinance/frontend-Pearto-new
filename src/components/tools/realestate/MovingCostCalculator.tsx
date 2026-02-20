'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Truck, Package, MapPin, Calendar, Lightbulb } from 'lucide-react';

export default function MovingCostCalculator() {
    const { formatPrice } = useCurrency();
    const [distance, setDistance] = useState(200);
    const [rooms, setRooms] = useState(3);
    const [packingService, setPackingService] = useState(false);
    const [storageNeeded, setStorageNeeded] = useState(false);
    const [movingSeason, setMovingSeason] = useState<'peak' | 'off-peak'>('peak');
    const [extraServices, setExtraServices] = useState(0);

    const result = useMemo(() => {
        // Base cost per room
        const baseCostPerRoom = 400;
        const baseCost = rooms * baseCostPerRoom;

        // Distance cost
        const distanceCost = distance <= 50
            ? distance * 2
            : distance <= 200
                ? 100 + (distance - 50) * 1.5
                : 100 + 225 + (distance - 200) * 1.0;

        // Weight estimate
        const weightPerRoom = 1500; // lbs
        const totalWeight = rooms * weightPerRoom;
        const weightCost = (totalWeight / 1000) * 50;

        // Packing service
        const packingCost = packingService ? rooms * 150 : 0;

        // Storage (monthly)
        const storageCost = storageNeeded ? rooms * 75 : 0;

        // Season multiplier
        const seasonMultiplier = movingSeason === 'peak' ? 1.25 : 1.0;

        // Subtotal
        const subtotal = (baseCost + distanceCost + weightCost + packingCost + storageCost) * seasonMultiplier;

        // Insurance estimate (3% of possessions value estimate)
        const possessionsValue = rooms * 5000;
        const insuranceCost = possessionsValue * 0.03;

        // Tips (15% of base)
        const tipEstimate = baseCost * 0.15;

        const totalCost = subtotal + insuranceCost + extraServices;

        return {
            baseCost: baseCost * seasonMultiplier,
            distanceCost: distanceCost * seasonMultiplier,
            weightCost: weightCost * seasonMultiplier,
            packingCost: packingCost * seasonMultiplier,
            storageCost: storageCost * seasonMultiplier,
            seasonMultiplier,
            insuranceCost,
            tipEstimate,
            extraServices,
            totalCost,
            totalWeight,
        };
    }, [distance, rooms, packingService, storageNeeded, movingSeason, extraServices]);

    // Donut chart
    const segments = [
        { label: 'Base Labor', value: result.baseCost, color: '#3b82f6' },
        { label: 'Distance', value: result.distanceCost, color: '#8b5cf6' },
        { label: 'Weight', value: result.weightCost, color: '#f59e0b' },
        { label: 'Packing', value: result.packingCost, color: '#10b981' },
        { label: 'Storage', value: result.storageCost, color: '#ef4444' },
        { label: 'Insurance', value: result.insuranceCost, color: '#06b6d4' },
        { label: 'Extras', value: result.extraServices, color: '#ec4899' },
    ].filter(s => s.value > 0);

    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const r = 42, circ = 2 * Math.PI * r;
    let cumulativeOffset = 0;

    return (
        <CalculatorLayout
            title="Moving Cost Calculator"
            description="Estimate the total cost of your upcoming move and find ways to save"
            category="Real Estate"
            insights={[
                { label: 'Total Cost', value: formatPrice(result.totalCost), color: 'text-emerald-600' },
                { label: 'Est. Weight', value: `${result.totalWeight.toLocaleString()} lbs` },
                { label: 'Season', value: movingSeason === 'peak' ? 'Peak (+25%)' : 'Off-Peak', color: movingSeason === 'peak' ? 'text-red-500' : 'text-emerald-600' },
                { label: 'Tip Estimate', value: formatPrice(result.tipEstimate), color: 'text-amber-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Total */}
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <Truck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Estimated Moving Cost</p>
                        <p className="text-4xl font-bold text-blue-600">
                            <PriceDisplay amount={result.totalCost} maximumFractionDigits={0} />
                        </p>
                        <p className="text-sm text-slate-500 mt-1">{rooms} rooms · {distance} miles</p>
                    </div>

                    {/* Donut + breakdown */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="110" height="110" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            {segments.map((seg, i) => {
                                const pct = total > 0 ? seg.value / total : 0;
                                const segLen = pct * circ;
                                const rotation = -90 + (cumulativeOffset / (total || 1)) * 360;
                                cumulativeOffset += seg.value;
                                return (
                                    <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="8"
                                        strokeDasharray={`${segLen} ${circ - segLen}`} strokeLinecap="butt"
                                        transform={`rotate(${rotation} 50 50)`} />
                                );
                            })}
                            <text x="50" y="54" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[9px] font-bold">
                                {formatPrice(total)}
                            </text>
                        </svg>
                        <div className="space-y-1.5 flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cost Breakdown</p>
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

                    {/* Tips to save */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb size={14} className="text-amber-600" />
                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Tips to Save</p>
                        </div>
                        <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1.5">
                            {movingSeason === 'peak' && <li>• Move during off-peak season (Oct–Apr) to save ~25%</li>}
                            {packingService && <li>• Pack items yourself to save {formatPrice(result.packingCost)}</li>}
                            <li>• Declutter before moving — fewer items = lower weight cost</li>
                            <li>• Get at least 3 quotes from different movers</li>
                            <li>• Book 4–6 weeks in advance for better rates</li>
                            {distance > 100 && <li>• Consider renting a truck for long-distance savings</li>}
                        </ul>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Distance (miles)</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{distance} mi</span>
                    </div>
                    <input type="number" value={distance} onChange={(e) => setDistance(Number(e.target.value))} min={1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={1} max={3000} step={10} value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Home Size (rooms)</label>
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">{rooms} rooms</span>
                    </div>
                    <input type="range" min={1} max={10} value={rooms}
                        onChange={(e) => setRooms(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Moving Season</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['peak', 'off-peak'] as const).map(s => (
                            <button key={s} onClick={() => setMovingSeason(s)}
                                className={`px-4 py-2.5 rounded-lg border text-sm transition-all ${movingSeason === s
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}>
                                {s === 'peak' ? '☀️ Peak (May–Sep)' : '❄️ Off-Peak'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition">
                        <input type="checkbox" checked={packingService} onChange={(e) => setPackingService(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                        <div>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Packing Service</span>
                            <p className="text-[10px] text-slate-400">Professional packing</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition">
                        <input type="checkbox" checked={storageNeeded} onChange={(e) => setStorageNeeded(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                        <div>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Storage Needed</span>
                            <p className="text-[10px] text-slate-400">Temporary storage</p>
                        </div>
                    </label>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Extra Services</label>
                        <span className="text-xs font-semibold text-pink-600 bg-pink-50 dark:bg-pink-900/30 px-2 py-0.5 rounded-md">{formatPrice(extraServices)}</span>
                    </div>
                    <input type="number" value={extraServices} onChange={(e) => setExtraServices(Number(e.target.value))} step={50} min={0}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <p className="text-[10px] text-slate-400 mt-1">Piano, hot tub, appliance disconnect, etc.</p>
                </div>
            </div>
        </CalculatorLayout>
    );
}
