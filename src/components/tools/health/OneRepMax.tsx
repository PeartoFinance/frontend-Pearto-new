'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Dumbbell, TrendingUp, Target, Zap } from 'lucide-react';

export default function OneRepMax() {
    const [weightLifted, setWeightLifted] = useState(100);
    const [reps, setReps] = useState(5);
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

    const result = useMemo(() => {
        // Brzycki formula: 1RM = weight × (36 / (37 - reps))
        const oneRM = reps === 1 ? weightLifted : weightLifted * (36 / (37 - reps));

        // Percentage chart
        const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
        const chart = percentages.map(pct => {
            const w = Math.round(oneRM * (pct / 100) * 10) / 10;
            // Estimated reps at this percentage
            let estReps: string;
            if (pct >= 100) estReps = '1';
            else if (pct >= 95) estReps = '2-3';
            else if (pct >= 90) estReps = '3-4';
            else if (pct >= 85) estReps = '4-6';
            else if (pct >= 80) estReps = '6-8';
            else if (pct >= 75) estReps = '8-10';
            else if (pct >= 70) estReps = '10-12';
            else if (pct >= 65) estReps = '12-15';
            else if (pct >= 60) estReps = '15-20';
            else estReps = '20+';
            return { pct, weight: w, reps: estReps };
        });

        // Training zones
        const zones = [
            { name: 'Strength (1-5 reps)', range: '85-100%', weight: `${Math.round(oneRM * 0.85)}-${Math.round(oneRM)}`, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
            { name: 'Hypertrophy (6-12 reps)', range: '65-85%', weight: `${Math.round(oneRM * 0.65)}-${Math.round(oneRM * 0.85)}`, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
            { name: 'Endurance (12-20 reps)', range: '50-65%', weight: `${Math.round(oneRM * 0.50)}-${Math.round(oneRM * 0.65)}`, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
        ];

        // Alternate formulas for comparison
        const epley = reps === 1 ? weightLifted : weightLifted * (1 + reps / 30);
        const lander = reps === 1 ? weightLifted : (100 * weightLifted) / (101.3 - 2.67123 * reps);

        return {
            oneRM: Math.round(oneRM * 10) / 10,
            epley: Math.round(epley * 10) / 10,
            lander: Math.round(lander * 10) / 10,
            chart,
            zones,
        };
    }, [weightLifted, reps]);

    return (
        <CalculatorLayout
            title="One Rep Max Calculator"
            description="Estimate your 1RM using the Brzycki formula and view training zones"
            category="Health & Fitness"
            insights={[
                { label: 'Estimated 1RM', value: `${result.oneRM} ${unit}`, color: 'text-blue-600' },
                { label: 'Lifted', value: `${weightLifted} ${unit} × ${reps}` },
                { label: 'Brzycki', value: `${result.oneRM} ${unit}` },
                { label: 'Epley', value: `${result.epley} ${unit}` },
            ]}
            results={
                <div className="space-y-4">
                    {/* Main 1RM display */}
                    <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <Dumbbell className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Estimated One Rep Max</p>
                        <p className="text-5xl font-bold text-blue-600">{result.oneRM}</p>
                        <p className="text-sm text-slate-500 mt-1">{unit} · Brzycki Formula</p>
                    </div>

                    {/* Formula comparison */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center">
                            <p className="text-xs text-slate-500">Brzycki</p>
                            <p className="text-lg font-bold text-blue-600">{result.oneRM}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center">
                            <p className="text-xs text-slate-500">Epley</p>
                            <p className="text-lg font-bold text-purple-600">{result.epley}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center">
                            <p className="text-xs text-slate-500">Lander</p>
                            <p className="text-lg font-bold text-emerald-600">{result.lander}</p>
                        </div>
                    </div>

                    {/* Training zones */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Target size={14} className="text-blue-500" />
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Training Zones</p>
                        </div>
                        <div className="space-y-2">
                            {result.zones.map(zone => (
                                <div key={zone.name} className={`flex items-center justify-between p-3 rounded-lg ${zone.color}`}>
                                    <div>
                                        <p className="text-sm font-semibold">{zone.name}</p>
                                        <p className="text-xs opacity-75">{zone.range} of 1RM</p>
                                    </div>
                                    <span className="text-sm font-bold">{zone.weight} {unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Percentage chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp size={14} className="text-blue-500" />
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Percentage Chart</p>
                        </div>
                        <div className="space-y-1.5">
                            {result.chart.map(row => (
                                <div key={row.pct} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 w-10 text-right">{row.pct}%</span>
                                    <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${row.pct >= 85 ? 'bg-red-400' : row.pct >= 65 ? 'bg-blue-400' : 'bg-emerald-400'}`}
                                            style={{ width: `${row.pct}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-16 text-right">{row.weight} {unit}</span>
                                    <span className="text-[10px] text-slate-400 w-12">{row.reps} reps</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Unit</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setUnit('kg')} className={`py-3 px-4 rounded-lg text-sm font-medium transition ${unit === 'kg' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Kilograms</button>
                        <button onClick={() => setUnit('lbs')} className={`py-3 px-4 rounded-lg text-sm font-medium transition ${unit === 'lbs' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Pounds</button>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Weight Lifted</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{weightLifted} {unit}</span>
                    </div>
                    <input type="number" value={weightLifted} onChange={(e) => setWeightLifted(Math.max(1, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={5} max={unit === 'kg' ? 300 : 660} step={unit === 'kg' ? 2.5 : 5} value={weightLifted}
                        onChange={(e) => setWeightLifted(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reps Performed</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{reps} reps</span>
                    </div>
                    <input type="number" value={reps} onChange={(e) => setReps(Math.max(1, Math.min(30, Number(e.target.value))))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={1} max={20} value={reps}
                        onChange={(e) => setReps(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Zap size={12} className="text-blue-500" />
                        <p className="text-xs font-semibold text-blue-600">Tip</p>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-400">For best accuracy, use a set of 2-10 reps. Higher rep sets produce less reliable estimates.</p>
                </div>
            </div>
        </CalculatorLayout>
    );
}
