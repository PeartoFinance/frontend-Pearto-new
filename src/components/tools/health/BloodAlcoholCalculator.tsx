'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Wine, AlertTriangle, Clock, Scale, Car } from 'lucide-react';

const DRINK_TYPES = [
    { name: 'Beer (5%)', abv: 0.05, oz: 12 },
    { name: 'Wine (12%)', abv: 0.12, oz: 5 },
    { name: 'Spirits (40%)', abv: 0.40, oz: 1.5 },
    { name: 'Strong Beer (8%)', abv: 0.08, oz: 12 },
    { name: 'Cocktail (~15%)', abv: 0.15, oz: 6 },
] as const;

export default function BloodAlcoholCalculator() {
    const [weight, setWeight] = useState(70);
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [drinks, setDrinks] = useState(3);
    const [drinkType, setDrinkType] = useState<string>(DRINK_TYPES[0].name);
    const [hoursSince, setHoursSince] = useState(1);

    const result = useMemo(() => {
        const dt = DRINK_TYPES.find(d => d.name === drinkType) || DRINK_TYPES[0];
        const weightLbs = unit === 'kg' ? weight * 2.20462 : weight;

        // Widmark formula: BAC = (Alcohol consumed in oz × 5.14 / (body weight in lbs × r)) - (0.015 × hours)
        const alcoholOz = drinks * dt.oz * dt.abv;
        const r = gender === 'male' ? 0.73 : 0.66; // Widmark factor
        const rawBAC = (alcoholOz * 5.14) / (weightLbs * r);
        const metabolized = 0.015 * hoursSince;
        const bac = Math.max(0, rawBAC - metabolized);

        // Impairment level
        let impairment: string;
        let impairmentColor: string;
        let impairmentDesc: string;
        if (bac === 0) {
            impairment = 'Sober';
            impairmentColor = 'text-emerald-600';
            impairmentDesc = 'No measurable alcohol in bloodstream.';
        } else if (bac < 0.02) {
            impairment = 'Minimal';
            impairmentColor = 'text-emerald-600';
            impairmentDesc = 'Slight warmth, relaxation. Minimal impairment.';
        } else if (bac < 0.05) {
            impairment = 'Mild';
            impairmentColor = 'text-blue-600';
            impairmentDesc = 'Lowered inhibitions, mild euphoria. Slight impairment of judgment.';
        } else if (bac < 0.08) {
            impairment = 'Moderate';
            impairmentColor = 'text-amber-600';
            impairmentDesc = 'Reduced coordination, impaired judgment and reasoning.';
        } else if (bac < 0.15) {
            impairment = 'Significant';
            impairmentColor = 'text-orange-600';
            impairmentDesc = 'Clear impairment of motor control. Slurred speech, poor balance.';
        } else if (bac < 0.30) {
            impairment = 'Severe';
            impairmentColor = 'text-red-600';
            impairmentDesc = 'Major loss of motor control. Possible blackout. Medical risk.';
        } else {
            impairment = 'Life-Threatening';
            impairmentColor = 'text-red-700';
            impairmentDesc = 'Risk of alcohol poisoning, loss of consciousness, death. Seek emergency help.';
        }

        // Time to sober (BAC / 0.015 per hour)
        const hoursToSober = bac > 0 ? Math.ceil(bac / 0.015) : 0;
        const soberHours = Math.floor(hoursToSober);
        const soberMinutes = Math.round((hoursToSober - soberHours) * 60);

        // Legal limits
        const legalLimits = [
            { region: 'US (all states)', limit: 0.08, under: bac < 0.08 },
            { region: 'UK', limit: 0.08, under: bac < 0.08 },
            { region: 'Canada', limit: 0.08, under: bac < 0.08 },
            { region: 'Australia', limit: 0.05, under: bac < 0.05 },
            { region: 'Germany', limit: 0.05, under: bac < 0.05 },
            { region: 'Japan', limit: 0.03, under: bac < 0.03 },
            { region: 'Zero Tolerance', limit: 0.00, under: bac === 0 },
        ];

        return { bac: Math.round(bac * 1000) / 1000, impairment, impairmentColor, impairmentDesc, hoursToSober: soberHours, minutesToSober: soberMinutes, legalLimits, rawBAC: Math.round(rawBAC * 1000) / 1000 };
    }, [weight, unit, gender, drinks, drinkType, hoursSince]);

    return (
        <CalculatorLayout
            title="Blood Alcohol Calculator"
            description="Estimate BAC using the Widmark formula based on drinks, weight, and time"
            category="Health & Medical"
            insights={[
                { label: 'Estimated BAC', value: `${result.bac.toFixed(3)}%`, color: result.bac >= 0.08 ? 'text-red-600' : result.bac > 0 ? 'text-amber-600' : 'text-emerald-600' },
                { label: 'Impairment', value: result.impairment, color: result.impairmentColor },
                { label: 'Time to Sober', value: result.hoursToSober > 0 ? `~${result.hoursToSober}h ${result.minutesToSober}m` : 'Sober', color: 'text-blue-600' },
                { label: 'Legal (US 0.08)', value: result.bac < 0.08 ? 'Under' : 'Over', color: result.bac < 0.08 ? 'text-emerald-600' : 'text-red-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Disclaimer */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            <strong>Disclaimer:</strong> This is an estimate only. Actual BAC depends on many factors (food intake, metabolism, medications, tolerance). Never drink and drive. When in doubt, don&apos;t drive.
                        </p>
                    </div>

                    {/* Main BAC display */}
                    <div className="text-center p-5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
                        <Wine className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Estimated Blood Alcohol Content</p>
                        <p className={`text-5xl font-bold ${result.impairmentColor}`}>{result.bac.toFixed(3)}%</p>
                        <p className={`text-sm font-medium mt-2 ${result.impairmentColor}`}>{result.impairment} Impairment</p>
                        <p className="text-xs text-slate-500 mt-1">{result.impairmentDesc}</p>
                    </div>

                    {/* BAC scale */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">BAC Scale</p>
                        <div className="flex h-4 rounded-full overflow-hidden">
                            <div className="bg-emerald-400" style={{ flex: 2 }} />
                            <div className="bg-blue-400" style={{ flex: 3 }} />
                            <div className="bg-amber-400" style={{ flex: 3 }} />
                            <div className="bg-orange-400" style={{ flex: 7 }} />
                            <div className="bg-red-400" style={{ flex: 15 }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                            <span>0.00</span>
                            <span>0.02</span>
                            <span>0.05</span>
                            <span>0.08</span>
                            <span>0.15</span>
                            <span>0.30+</span>
                        </div>
                        {result.bac > 0 && (
                            <div className="relative h-3 mt-1">
                                <div
                                    className="absolute w-3 h-3 bg-slate-800 dark:bg-white rounded-full transform -translate-x-1/2"
                                    style={{ left: `${Math.min((result.bac / 0.30) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Time to sober */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock size={14} className="text-blue-500" />
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time Until Sober</p>
                        </div>
                        {result.hoursToSober > 0 || result.minutesToSober > 0 ? (
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-600">{result.hoursToSober}</p>
                                    <p className="text-xs text-slate-500">hours</p>
                                </div>
                                <span className="text-2xl text-slate-300">:</span>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-600">{result.minutesToSober}</p>
                                    <p className="text-xs text-slate-500">minutes</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-emerald-600 font-medium">You are estimated to be sober</p>
                        )}
                    </div>

                    {/* Legal limits comparison */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Car size={14} className="text-slate-500" />
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Legal Driving Limits</p>
                        </div>
                        <div className="space-y-1.5">
                            {result.legalLimits.map(ll => (
                                <div key={ll.region} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">{ll.region}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">{ll.limit.toFixed(2)}%</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${ll.under ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                                            {ll.under ? 'UNDER' : 'OVER'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setGender('male')} className={`py-3 px-4 rounded-lg text-sm font-medium transition ${gender === 'male' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            Male
                        </button>
                        <button onClick={() => setGender('female')} className={`py-3 px-4 rounded-lg text-sm font-medium transition ${gender === 'female' ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            Female
                        </button>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Body Weight</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{weight} {unit}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <button onClick={() => setUnit('kg')} className={`py-2 px-3 rounded-lg text-sm font-medium transition ${unit === 'kg' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>kg</button>
                        <button onClick={() => setUnit('lbs')} className={`py-2 px-3 rounded-lg text-sm font-medium transition ${unit === 'lbs' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>lbs</button>
                    </div>
                    <input type="number" value={weight} onChange={(e) => setWeight(Math.max(30, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={unit === 'kg' ? 40 : 88} max={unit === 'kg' ? 150 : 330} value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Drink Type</label>
                    <select value={drinkType} onChange={(e) => setDrinkType(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {DRINK_TYPES.map(d => (
                            <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Number of Drinks</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{drinks}</span>
                    </div>
                    <input type="number" value={drinks} onChange={(e) => setDrinks(Math.max(0, Number(e.target.value)))} min={0}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={0} max={15} value={drinks}
                        onChange={(e) => setDrinks(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hours Since First Drink</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{hoursSince}h</span>
                    </div>
                    <input type="number" value={hoursSince} onChange={(e) => setHoursSince(Math.max(0, Number(e.target.value)))} min={0} step={0.5}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={0} max={12} step={0.5} value={hoursSince}
                        onChange={(e) => setHoursSince(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
