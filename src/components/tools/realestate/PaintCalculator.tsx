'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Paintbrush, Ruler, Square, DollarSign } from 'lucide-react';

export default function PaintCalculator() {
    const { formatPrice } = useCurrency();
    const [roomLength, setRoomLength] = useState(15);
    const [roomWidth, setRoomWidth] = useState(12);
    const [roomHeight, setRoomHeight] = useState(9);
    const [numDoors, setNumDoors] = useState(2);
    const [numWindows, setNumWindows] = useState(3);
    const [coats, setCoats] = useState(2);
    const [coveragePerGallon, setCoveragePerGallon] = useState(350);
    const [pricePerGallon, setPricePerGallon] = useState(45);

    const result = useMemo(() => {
        // Wall area = perimeter × height
        const perimeter = 2 * (roomLength + roomWidth);
        const totalWallArea = perimeter * roomHeight;

        // Subtract doors and windows
        const doorArea = numDoors * 21; // ~3×7 ft per door
        const windowArea = numWindows * 15; // ~3×5 ft per window
        const unpaintableArea = doorArea + windowArea;

        const paintableArea = Math.max(0, totalWallArea - unpaintableArea);

        // Total area to paint with coats
        const totalPaintArea = paintableArea * coats;

        // Gallons needed
        const gallonsExact = coveragePerGallon > 0 ? totalPaintArea / coveragePerGallon : 0;
        const gallonsNeeded = Math.ceil(gallonsExact);

        // Cost
        const estimatedCost = gallonsNeeded * pricePerGallon;

        // Ceiling (bonus info)
        const ceilingArea = roomLength * roomWidth;

        return {
            totalWallArea,
            doorArea,
            windowArea,
            unpaintableArea,
            paintableArea,
            totalPaintArea,
            gallonsExact,
            gallonsNeeded,
            estimatedCost,
            ceilingArea,
            perimeter,
        };
    }, [roomLength, roomWidth, roomHeight, numDoors, numWindows, coats, coveragePerGallon, pricePerGallon]);

    // Donut chart — area breakdown
    const segments = [
        { label: 'Paintable Wall', value: result.paintableArea, color: '#3b82f6' },
        { label: 'Doors', value: result.doorArea, color: '#f59e0b' },
        { label: 'Windows', value: result.windowArea, color: '#10b981' },
    ];
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const rd = 42, circ = 2 * Math.PI * rd;
    let cumulativeOffset = 0;

    return (
        <CalculatorLayout
            title="Paint Calculator"
            description="Calculate exactly how much paint you need for your room"
            category="Real Estate"
            insights={[
                { label: 'Paintable Area', value: `${result.paintableArea.toFixed(0)} sq ft` },
                { label: 'Gallons Needed', value: `${result.gallonsNeeded}`, color: 'text-blue-600' },
                { label: 'Coats', value: `${coats}` },
                { label: 'Est. Cost', value: formatPrice(result.estimatedCost), color: 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Hero */}
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <Paintbrush className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Paint Required</p>
                        <p className="text-4xl font-bold text-blue-600">{result.gallonsNeeded} gallons</p>
                        <p className="text-sm text-slate-500 mt-1">{result.totalPaintArea.toFixed(0)} sq ft total ({coats} coats)</p>
                    </div>

                    {/* Cost & area cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Estimated Cost</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                <PriceDisplay amount={result.estimatedCost} maximumFractionDigits={0} />
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">@ {formatPrice(pricePerGallon)}/gal</p>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Wall Area</p>
                            <p className="text-2xl font-bold text-amber-600">{result.totalWallArea.toFixed(0)}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">sq ft</p>
                        </div>
                    </div>

                    {/* Donut — area breakdown */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="110" height="110" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={rd} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            {segments.map((seg, i) => {
                                const pct = total > 0 ? seg.value / total : 0;
                                const segLen = pct * circ;
                                const rotation = -90 + (cumulativeOffset / (total || 1)) * 360;
                                cumulativeOffset += seg.value;
                                return (
                                    <circle key={i} cx="50" cy="50" r={rd} fill="none" stroke={seg.color} strokeWidth="8"
                                        strokeDasharray={`${segLen} ${circ - segLen}`} strokeLinecap="butt"
                                        transform={`rotate(${rotation} 50 50)`} />
                                );
                            })}
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[10px] font-bold">
                                {result.paintableArea.toFixed(0)}
                            </text>
                            <text x="50" y="60" textAnchor="middle" className="fill-slate-500 text-[7px]">sq ft</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Area Breakdown</p>
                            {segments.map((seg, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">{seg.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{seg.value.toFixed(0)} ft²</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Room details */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Room Details</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Perimeter</span><span className="font-medium">{result.perimeter} ft</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Ceiling Area</span><span className="font-medium">{result.ceilingArea} sq ft</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Unpaintable (doors+windows)</span><span className="font-medium">{result.unpaintableArea} sq ft</span></div>
                            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Exact Gallons</span>
                                <span className="font-bold text-blue-600">{result.gallonsExact.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Length (ft)</label>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{roomLength}</span>
                        </div>
                        <input type="number" value={roomLength} onChange={(e) => setRoomLength(Number(e.target.value))} min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Width (ft)</label>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{roomWidth}</span>
                        </div>
                        <input type="number" value={roomWidth} onChange={(e) => setRoomWidth(Number(e.target.value))} min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Height (ft)</label>
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">{roomHeight}</span>
                    </div>
                    <input type="number" value={roomHeight} onChange={(e) => setRoomHeight(Number(e.target.value))} min={1} step={0.5}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={7} max={20} step={0.5} value={roomHeight}
                        onChange={(e) => setRoomHeight(Number(e.target.value))} className="w-full accent-purple-500 mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Doors</label>
                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{numDoors}</span>
                        </div>
                        <input type="number" value={numDoors} onChange={(e) => setNumDoors(Number(e.target.value))} min={0} max={10}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Windows</label>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{numWindows}</span>
                        </div>
                        <input type="number" value={numWindows} onChange={(e) => setNumWindows(Number(e.target.value))} min={0} max={10}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Coats</label>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">{coats}</span>
                    </div>
                    <input type="range" min={1} max={4} value={coats}
                        onChange={(e) => setCoats(Number(e.target.value))} className="w-full accent-indigo-500" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5"><span>1 coat</span><span>4 coats</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Coverage/gal</label>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{coveragePerGallon} ft²</span>
                        </div>
                        <input type="number" value={coveragePerGallon} onChange={(e) => setCoveragePerGallon(Number(e.target.value))} min={100}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Price/gal</label>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(pricePerGallon)}</span>
                        </div>
                        <input type="number" value={pricePerGallon} onChange={(e) => setPricePerGallon(Number(e.target.value))} min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
