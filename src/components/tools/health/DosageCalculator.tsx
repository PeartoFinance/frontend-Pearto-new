'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Pill, AlertTriangle, Scale, Clock, Droplets } from 'lucide-react';

interface Medication {
    name: string;
    mgPerKg: number;
    maxDailyMg: number;
    frequency: string;
    frequencyHours: number;
    notes: string;
}

const MEDICATIONS: Medication[] = [
    { name: 'Acetaminophen (Tylenol)', mgPerKg: 15, maxDailyMg: 4000, frequency: 'Every 4-6 hours', frequencyHours: 4, notes: 'Do not exceed 4g/day in adults. Reduce for liver impairment.' },
    { name: 'Ibuprofen (Advil)', mgPerKg: 10, maxDailyMg: 3200, frequency: 'Every 6-8 hours', frequencyHours: 6, notes: 'Take with food. Avoid in kidney disease. Max 3 days for fever.' },
    { name: 'Amoxicillin', mgPerKg: 25, maxDailyMg: 3000, frequency: 'Every 8 hours', frequencyHours: 8, notes: 'Complete full course. Check for penicillin allergy.' },
    { name: 'Azithromycin', mgPerKg: 10, maxDailyMg: 500, frequency: 'Once daily', frequencyHours: 24, notes: 'Usually 5-day course. Day 1: loading dose (double).' },
    { name: 'Cetirizine (Zyrtec)', mgPerKg: 0.25, maxDailyMg: 10, frequency: 'Once daily', frequencyHours: 24, notes: 'Antihistamine. May cause drowsiness.' },
    { name: 'Diphenhydramine (Benadryl)', mgPerKg: 1.25, maxDailyMg: 300, frequency: 'Every 6 hours', frequencyHours: 6, notes: 'Causes drowsiness. Avoid in elderly if possible.' },
    { name: 'Metformin', mgPerKg: 10, maxDailyMg: 2550, frequency: 'Twice daily', frequencyHours: 12, notes: 'Take with meals. Monitor renal function.' },
    { name: 'Prednisolone', mgPerKg: 1, maxDailyMg: 60, frequency: 'Once daily', frequencyHours: 24, notes: 'Take in the morning. Taper gradually; do not stop abruptly.' },
    { name: 'Omeprazole', mgPerKg: 1, maxDailyMg: 40, frequency: 'Once daily', frequencyHours: 24, notes: 'Take 30 min before breakfast. Short-term use preferred.' },
    { name: 'Naproxen', mgPerKg: 5, maxDailyMg: 1250, frequency: 'Every 12 hours', frequencyHours: 12, notes: 'NSAID. Take with food. Monitor for GI bleeding.' },
];

const AGE_GROUPS = ['Infant (0-1)', 'Child (2-11)', 'Adolescent (12-17)', 'Adult (18-64)', 'Senior (65+)'] as const;

const STRENGTHS = ['Liquid (mg/mL)', 'Tablet (mg)', 'Capsule (mg)'] as const;

export default function DosageCalculator() {
    const [medication, setMedication] = useState(MEDICATIONS[0].name);
    const [weight, setWeight] = useState(70);
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
    const [ageGroup, setAgeGroup] = useState<string>(AGE_GROUPS[3]);
    const [strength, setStrength] = useState<string>(STRENGTHS[1]);

    const result = useMemo(() => {
        const med = MEDICATIONS.find(m => m.name === medication);
        if (!med) return null;

        const weightKg = unit === 'kg' ? weight : weight * 0.453592;

        // Age group adjustments
        let adjustFactor = 1;
        if (ageGroup === 'Infant (0-1)') adjustFactor = 0.5;
        else if (ageGroup === 'Child (2-11)') adjustFactor = 0.75;
        else if (ageGroup === 'Adolescent (12-17)') adjustFactor = 0.9;
        else if (ageGroup === 'Senior (65+)') adjustFactor = 0.8;

        const rawDose = weightKg * med.mgPerKg * adjustFactor;
        const singleDose = Math.min(rawDose, med.maxDailyMg / (24 / med.frequencyHours));
        const dosesPerDay = Math.floor(24 / med.frequencyHours);
        const dailyTotal = singleDose * dosesPerDay;
        const maxDaily = med.maxDailyMg;
        const adjustedDaily = Math.min(dailyTotal, maxDaily);
        const adjustedSingle = adjustedDaily / dosesPerDay;

        return {
            singleDose: Math.round(adjustedSingle * 10) / 10,
            dosesPerDay,
            dailyTotal: Math.round(adjustedDaily * 10) / 10,
            maxDaily,
            frequency: med.frequency,
            frequencyHours: med.frequencyHours,
            notes: med.notes,
            weightKg: Math.round(weightKg * 10) / 10,
            pctOfMax: Math.round((adjustedDaily / maxDaily) * 100),
            adjustFactor,
        };
    }, [medication, weight, unit, ageGroup, strength]);

    return (
        <CalculatorLayout
            title="Dosage Calculator"
            description="Calculate medication dosages based on weight and age group"
            category="Health & Medical"
            insights={[
                { label: 'Single Dose', value: result ? `${result.singleDose} mg` : '—' },
                { label: 'Frequency', value: result?.frequency || '—', color: 'text-blue-600' },
                { label: 'Daily Total', value: result ? `${result.dailyTotal} mg` : '—', color: 'text-purple-600' },
                { label: '% of Max', value: result ? `${result.pctOfMax}%` : '—', color: result && result.pctOfMax > 80 ? 'text-red-600' : 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Disclaimer */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            <strong>Disclaimer:</strong> This calculator provides estimates only and is NOT a substitute for medical advice. Always follow your doctor&apos;s or pharmacist&apos;s instructions.
                        </p>
                    </div>

                    {result && (
                        <>
                            {/* Main dose display */}
                            <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                                <Pill className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">Recommended Single Dose</p>
                                <p className="text-4xl font-bold text-blue-600">{result.singleDose} mg</p>
                                <p className="text-sm text-slate-500 mt-1">{result.frequency} · {result.dosesPerDay}x/day</p>
                            </div>

                            {/* Daily breakdown */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
                                    <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Per Dose</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">{result.singleDose} mg</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
                                    <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Every</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">{result.frequencyHours}h</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
                                    <Scale className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Daily Total</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">{result.dailyTotal} mg</p>
                                </div>
                            </div>

                            {/* Max daily dose bar */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Daily Dose vs Maximum</p>
                                <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${result.pctOfMax > 80 ? 'bg-red-400' : result.pctOfMax > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                        style={{ width: `${Math.min(result.pctOfMax, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>{result.dailyTotal} mg/day</span>
                                    <span>Max: {result.maxDaily} mg/day</span>
                                </div>
                            </div>

                            {/* Schedule visual */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Daily Schedule</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {Array.from({ length: result.dosesPerDay }, (_, i) => {
                                        const hour = (8 + i * result.frequencyHours) % 24;
                                        const label = hour >= 12 ? `${hour === 12 ? 12 : hour - 12} PM` : `${hour === 0 ? 12 : hour} AM`;
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                                <Clock size={14} className="text-blue-500" />
                                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">{label}</span>
                                                <span className="text-[10px] text-slate-500">{result.singleDose} mg</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{result.notes}</p>
                                {result.adjustFactor !== 1 && (
                                    <p className="text-xs text-amber-600 mt-2">
                                        ⚠ Dose adjusted by {Math.round(result.adjustFactor * 100)}% for age group: {ageGroup}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Medication</label>
                    <select
                        value={medication}
                        onChange={(e) => setMedication(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    >
                        {MEDICATIONS.map(m => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Patient Weight</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                            {weight} {unit}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <button onClick={() => setUnit('kg')} className={`py-2 px-3 rounded-lg text-sm font-medium transition ${unit === 'kg' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            Kilograms
                        </button>
                        <button onClick={() => setUnit('lbs')} className={`py-2 px-3 rounded-lg text-sm font-medium transition ${unit === 'lbs' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            Pounds
                        </button>
                    </div>
                    <input type="number" value={weight} onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))} min={1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={unit === 'kg' ? 3 : 7} max={unit === 'kg' ? 150 : 330} value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Age Group</label>
                    <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    >
                        {AGE_GROUPS.map(ag => (
                            <option key={ag} value={ag}>{ag}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dosage Form</label>
                    <select
                        value={strength}
                        onChange={(e) => setStrength(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    >
                        {STRENGTHS.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>
        </CalculatorLayout>
    );
}
