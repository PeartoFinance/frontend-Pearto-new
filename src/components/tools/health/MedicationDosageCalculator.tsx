'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Pill, Clock, AlertTriangle } from 'lucide-react';

export default function MedicationDosageCalculator() {
    const [weight, setWeight] = useState(70);
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
    const [dosePerKg, setDosePerKg] = useState(10);
    const [frequency, setFrequency] = useState(3);
    const [duration, setDuration] = useState(7);
    const [concentrationMg, setConcentrationMg] = useState(250);
    const [concentrationMl, setConcentrationMl] = useState(5);

    const results = useMemo(() => {
        const weightInKg = weightUnit === 'kg' ? weight : weight * 0.453592;
        const singleDose = weightInKg * dosePerKg;
        const dailyDose = singleDose * frequency;
        const totalDose = dailyDose * duration;

        // Volume calculation
        const concentrationPerMl = concentrationMg / concentrationMl;
        const volumePerDose = singleDose / concentrationPerMl;
        const volumePerDay = volumePerDose * frequency;
        const totalVolume = volumePerDay * duration;

        return {
            singleDose,
            dailyDose,
            totalDose,
            volumePerDose,
            volumePerDay,
            totalVolume,
            weightInKg
        };
    }, [weight, weightUnit, dosePerKg, frequency, duration, concentrationMg, concentrationMl]);

    return (
        <CalculatorLayout
            title="Medication Dosage Calculator"
            description="Calculate medication doses based on body weight"
            category="Health & Medical"
            results={
                <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl text-center">
                        <Pill className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Single Dose</p>
                        <p className="text-4xl font-bold text-blue-600">{results.singleDose.toFixed(1)} mg</p>
                        <p className="text-sm text-slate-400 mt-1">
                            = {results.volumePerDose.toFixed(1)} mL
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Daily Dose</p>
                            <p className="text-xl font-bold text-emerald-600">{results.dailyDose.toFixed(0)} mg</p>
                            <p className="text-xs text-slate-400">{results.volumePerDay.toFixed(1)} mL</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Course</p>
                            <p className="text-xl font-bold text-purple-600">{(results.totalDose / 1000).toFixed(2)} g</p>
                            <p className="text-xs text-slate-400">{results.totalVolume.toFixed(0)} mL</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Dosing Schedule
                            </p>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Frequency</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    Every {Math.round(24 / frequency)} hours
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Duration</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {duration} days
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total Doses</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {frequency * duration} doses
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                    Medical Disclaimer
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                    This calculator is for reference only. Always consult a healthcare professional before administering any medication.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Body Weight
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(Number(e.target.value))}
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <select
                            value={weightUnit}
                            onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lb')}
                            className="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value="kg">kg</option>
                            <option value="lb">lb</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Dose per kg (mg/kg)
                    </label>
                    <input
                        type="number"
                        value={dosePerKg}
                        onChange={(e) => setDosePerKg(Number(e.target.value))}
                        step={0.5}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Times per Day
                        </label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value={1}>Once daily</option>
                            <option value={2}>Twice daily</option>
                            <option value={3}>3 times daily</option>
                            <option value={4}>4 times daily</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Duration (days)
                        </label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Medication Concentration
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={concentrationMg}
                            onChange={(e) => setConcentrationMg(Number(e.target.value))}
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <span className="text-sm text-slate-500">mg per</span>
                        <input
                            type="number"
                            value={concentrationMl}
                            onChange={(e) => setConcentrationMl(Number(e.target.value))}
                            className="w-20 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <span className="text-sm text-slate-500">mL</span>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
