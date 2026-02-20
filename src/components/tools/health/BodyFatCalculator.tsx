'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { User, Ruler, Scale, Activity } from 'lucide-react';

const CATEGORIES = [
    { label: 'Essential Fat', range: [2, 5], rangeF: [10, 13], color: 'bg-red-400' },
    { label: 'Athletic', range: [6, 13], rangeF: [14, 20], color: 'bg-blue-400' },
    { label: 'Fitness', range: [14, 17], rangeF: [21, 24], color: 'bg-emerald-400' },
    { label: 'Acceptable', range: [18, 24], rangeF: [25, 31], color: 'bg-amber-400' },
    { label: 'Obese', range: [25, 50], rangeF: [32, 50], color: 'bg-red-500' },
] as const;

export default function BodyFatCalculator() {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [weight, setWeight] = useState(80);
    const [height, setHeight] = useState(175);
    const [waist, setWaist] = useState(85);
    const [neck, setNeck] = useState(38);
    const [hip, setHip] = useState(95);
    const [method, setMethod] = useState<'bmi' | 'navy'>('navy');

    const result = useMemo(() => {
        let bodyFatPct: number;

        if (method === 'navy') {
            // US Navy Method (measurements in cm)
            if (gender === 'male') {
                bodyFatPct = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
            } else {
                bodyFatPct = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
            }
        } else {
            // BMI-based estimation (Deurenberg formula)
            const heightM = height / 100;
            const bmi = weight / (heightM * heightM);
            const sex = gender === 'male' ? 1 : 0;
            bodyFatPct = 1.20 * bmi + 0.23 * 30 - 10.8 * sex - 5.4; // age assumed ~30 for simplicity
        }

        bodyFatPct = Math.max(2, Math.min(60, bodyFatPct));
        bodyFatPct = Math.round(bodyFatPct * 10) / 10;

        // Category
        const ranges = gender === 'male' ? 'range' : 'rangeF';
        let category = CATEGORIES[CATEGORIES.length - 1];
        for (const cat of CATEGORIES) {
            const r = gender === 'male' ? cat.range : cat.rangeF;
            if (bodyFatPct >= r[0] && bodyFatPct <= r[1]) {
                category = cat;
                break;
            }
        }

        // Lean mass
        const fatMass = Math.round(weight * (bodyFatPct / 100) * 10) / 10;
        const leanMass = Math.round((weight - fatMass) * 10) / 10;

        // Ideal body fat range
        const idealRange = gender === 'male' ? '10-20%' : '18-28%';

        return { bodyFatPct, category, fatMass, leanMass, idealRange };
    }, [gender, weight, height, waist, neck, hip, method]);

    return (
        <CalculatorLayout
            title="Body Fat Percentage Calculator"
            description="Estimate body fat using the US Navy method or BMI-based formula"
            category="Health & Fitness"
            insights={[
                { label: 'Body Fat', value: `${result.bodyFatPct}%`, color: result.category.label === 'Obese' ? 'text-red-600' : 'text-blue-600' },
                { label: 'Category', value: result.category.label },
                { label: 'Lean Mass', value: `${result.leanMass} kg`, color: 'text-emerald-600' },
                { label: 'Fat Mass', value: `${result.fatMass} kg`, color: 'text-amber-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Main display */}
                    <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                        <User className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Estimated Body Fat</p>
                        <p className={`text-5xl font-bold ${result.category.label === 'Obese' ? 'text-red-600' : result.category.label === 'Acceptable' ? 'text-amber-600' : 'text-blue-600'}`}>
                            {result.bodyFatPct}%
                        </p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{result.category.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Ideal range: {result.idealRange}</p>
                    </div>

                    {/* Body composition bar */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Body Composition</p>
                        <div className="flex h-6 rounded-full overflow-hidden mb-2">
                            <div className="bg-emerald-400 flex items-center justify-center" style={{ width: `${100 - result.bodyFatPct}%` }}>
                                <span className="text-[9px] text-white font-bold">Lean</span>
                            </div>
                            <div className="bg-amber-400 flex items-center justify-center" style={{ width: `${result.bodyFatPct}%` }}>
                                <span className="text-[9px] text-white font-bold">Fat</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <p className="text-xs text-slate-500">Lean Mass</p>
                                <p className="text-lg font-bold text-emerald-600">{result.leanMass} kg</p>
                                <p className="text-[10px] text-slate-400">{(100 - result.bodyFatPct).toFixed(1)}%</p>
                            </div>
                            <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <p className="text-xs text-slate-500">Fat Mass</p>
                                <p className="text-lg font-bold text-amber-600">{result.fatMass} kg</p>
                                <p className="text-[10px] text-slate-400">{result.bodyFatPct}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Category scale */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                            Body Fat Categories ({gender === 'male' ? 'Male' : 'Female'})
                        </p>
                        <div className="flex h-4 rounded-full overflow-hidden mb-2">
                            {CATEGORIES.map(cat => (
                                <div key={cat.label} className={`flex-1 ${cat.color}`} />
                            ))}
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400">
                            {CATEGORIES.map(cat => {
                                const r = gender === 'male' ? cat.range : cat.rangeF;
                                return <span key={cat.label}>{r[0]}-{r[1]}%</span>;
                            })}
                        </div>
                        {/* Pointer */}
                        <div className="relative h-3 mt-1">
                            <div
                                className="absolute w-3 h-3 bg-slate-800 dark:bg-white rounded-full transform -translate-x-1/2"
                                style={{
                                    left: `${Math.min(Math.max(((result.bodyFatPct - 2) / 48) * 100, 0), 100)}%`
                                }}
                            />
                        </div>
                        <div className="space-y-1 mt-3">
                            {CATEGORIES.map(cat => {
                                const r = gender === 'male' ? cat.range : cat.rangeF;
                                const isActive = cat.label === result.category.label;
                                return (
                                    <div key={cat.label} className={`flex items-center justify-between text-xs px-2 py-1 rounded ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                                            <span className={isActive ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}>{cat.label}</span>
                                        </div>
                                        <span className="text-slate-400">{r[0]}-{r[1]}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setGender('male')} className={`py-3 px-4 rounded-lg text-sm font-medium transition ${gender === 'male' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Male</button>
                        <button onClick={() => setGender('female')} className={`py-3 px-4 rounded-lg text-sm font-medium transition ${gender === 'female' ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Female</button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Method</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setMethod('navy')} className={`py-2.5 px-3 rounded-lg text-xs font-medium transition ${method === 'navy' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>US Navy</button>
                        <button onClick={() => setMethod('bmi')} className={`py-2.5 px-3 rounded-lg text-xs font-medium transition ${method === 'bmi' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>BMI-Based</button>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Weight (kg)</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{weight} kg</span>
                    </div>
                    <input type="number" value={weight} onChange={(e) => setWeight(Math.max(30, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={30} max={200} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Height (cm)</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{height} cm</span>
                    </div>
                    <input type="number" value={height} onChange={(e) => setHeight(Math.max(100, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={100} max={220} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                {method === 'navy' && (
                    <>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Waist (cm)</label>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{waist} cm</span>
                            </div>
                            <input type="number" value={waist} onChange={(e) => setWaist(Math.max(40, Number(e.target.value)))}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                            <input type="range" min={40} max={200} value={waist} onChange={(e) => setWaist(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Neck (cm)</label>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{neck} cm</span>
                            </div>
                            <input type="number" value={neck} onChange={(e) => setNeck(Math.max(20, Number(e.target.value)))}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                            <input type="range" min={20} max={60} value={neck} onChange={(e) => setNeck(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                        </div>

                        {gender === 'female' && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hip (cm)</label>
                                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{hip} cm</span>
                                </div>
                                <input type="number" value={hip} onChange={(e) => setHip(Math.max(50, Number(e.target.value)))}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                                <input type="range" min={50} max={200} value={hip} onChange={(e) => setHip(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </CalculatorLayout>
    );
}
