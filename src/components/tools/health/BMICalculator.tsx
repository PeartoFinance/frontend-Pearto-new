'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { User, Ruler, Scale } from 'lucide-react';

export default function BMICalculator() {
    const [height, setHeight] = useState(170);
    const [weight, setWeight] = useState(70);
    const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

    const result = useMemo(() => {
        let bmi: number;
        if (unit === 'metric') {
            const heightM = height / 100;
            bmi = weight / (heightM * heightM);
        } else {
            bmi = (weight / (height * height)) * 703;
        }

        let category: string;
        let color: string;
        if (bmi < 18.5) { category = 'Underweight'; color = 'text-blue-600'; }
        else if (bmi < 25) { category = 'Normal'; color = 'text-emerald-600'; }
        else if (bmi < 30) { category = 'Overweight'; color = 'text-amber-600'; }
        else { category = 'Obese'; color = 'text-red-600'; }

        // Ideal weight range (BMI 18.5 - 24.9)
        const heightM = unit === 'metric' ? height / 100 : height * 0.0254;
        const idealMin = 18.5 * heightM * heightM;
        const idealMax = 24.9 * heightM * heightM;

        return {
            bmi: Math.round(bmi * 10) / 10,
            category,
            color,
            idealMin: Math.round(idealMin),
            idealMax: Math.round(idealMax)
        };
    }, [height, weight, unit]);

    return (
        <CalculatorLayout
            title="BMI Calculator"
            description="Calculate your Body Mass Index and health category"
            category="Health & Fitness"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Your BMI</p>
                        <p className={`text-5xl font-bold ${result.color}`}>{result.bmi}</p>
                        <p className={`text-lg font-medium mt-2 ${result.color}`}>{result.category}</p>
                    </div>

                    {/* BMI Scale */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex h-4 rounded-full overflow-hidden">
                            <div className="bg-blue-400 flex-1" />
                            <div className="bg-emerald-400 flex-1" />
                            <div className="bg-amber-400 flex-1" />
                            <div className="bg-red-400 flex-1" />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>Under 18.5</span>
                            <span>18.5-24.9</span>
                            <span>25-29.9</span>
                            <span>30+</span>
                        </div>
                        {/* Pointer */}
                        <div className="relative h-2 mt-1">
                            <div
                                className="absolute w-3 h-3 bg-slate-800 dark:bg-white rounded-full -top-1 transform -translate-x-1/2"
                                style={{ left: `${Math.min(Math.max((result.bmi - 15) / 25 * 100, 0), 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500">Ideal Weight Range</p>
                        <p className="font-semibold text-emerald-600">{result.idealMin} - {result.idealMax} kg</p>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Unit System</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setUnit('metric')} className={`py-3 px-4 rounded-lg font-medium transition ${unit === 'metric' ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        Metric (cm/kg)
                    </button>
                    <button onClick={() => setUnit('imperial')} className={`py-3 px-4 rounded-lg font-medium transition ${unit === 'imperial' ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        Imperial (in/lb)
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Height ({unit === 'metric' ? 'cm' : 'inches'})</label>
                <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <input type="range" min={unit === 'metric' ? 100 : 40} max={unit === 'metric' ? 220 : 85} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full mt-2 accent-red-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
                <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <input type="range" min={unit === 'metric' ? 30 : 65} max={unit === 'metric' ? 200 : 440} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full mt-2 accent-red-500" />
            </div>
        </CalculatorLayout>
    );
}
