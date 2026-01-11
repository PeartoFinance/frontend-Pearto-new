'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Heart, Activity, User } from 'lucide-react';

export default function IdealWeightCalculator() {
    const [height, setHeight] = useState(170);
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [frameSize, setFrameSize] = useState<'small' | 'medium' | 'large'>('medium');

    const result = useMemo(() => {
        // Multiple formulas for ideal weight
        const heightCm = height;
        const heightInches = heightCm / 2.54;

        // Devine Formula
        let devine: number;
        if (gender === 'male') {
            devine = 50 + 2.3 * (heightInches - 60);
        } else {
            devine = 45.5 + 2.3 * (heightInches - 60);
        }

        // Robinson Formula
        let robinson: number;
        if (gender === 'male') {
            robinson = 52 + 1.9 * (heightInches - 60);
        } else {
            robinson = 49 + 1.7 * (heightInches - 60);
        }

        // Miller Formula
        let miller: number;
        if (gender === 'male') {
            miller = 56.2 + 1.41 * (heightInches - 60);
        } else {
            miller = 53.1 + 1.36 * (heightInches - 60);
        }

        // Frame size adjustment
        const frameAdjust = frameSize === 'small' ? 0.9 : frameSize === 'large' ? 1.1 : 1;

        const average = (devine + robinson + miller) / 3 * frameAdjust;
        const rangeMin = average * 0.95;
        const rangeMax = average * 1.05;

        return {
            ideal: Math.round(average),
            rangeMin: Math.round(rangeMin),
            rangeMax: Math.round(rangeMax),
            devine: Math.round(devine * frameAdjust),
            robinson: Math.round(robinson * frameAdjust),
            miller: Math.round(miller * frameAdjust)
        };
    }, [height, gender, frameSize]);

    return (
        <CalculatorLayout
            title="Ideal Weight Calculator"
            description="Calculate your ideal body weight based on height"
            category="Health & Fitness"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Ideal Weight Range</p>
                        <p className="text-4xl font-bold text-emerald-600">{result.rangeMin} - {result.rangeMax} kg</p>
                        <p className="text-sm text-slate-500 mt-1">Average: {result.ideal} kg</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">By Formula</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Devine</span>
                                <span className="font-medium">{result.devine} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Robinson</span>
                                <span className="font-medium">{result.robinson} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Miller</span>
                                <span className="font-medium">{result.miller} kg</span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setGender('male')} className={`py-3 px-4 rounded-lg font-medium ${gender === 'male' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Male</button>
                    <button onClick={() => setGender('female')} className={`py-3 px-4 rounded-lg font-medium ${gender === 'female' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Female</button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Height: {height} cm</label>
                <input type="range" min={120} max={220} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Body Frame</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['small', 'medium', 'large'] as const).map((frame) => (
                        <button key={frame} onClick={() => setFrameSize(frame)} className={`py-2 px-3 rounded-lg text-sm font-medium ${frameSize === frame ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                            {frame.charAt(0).toUpperCase() + frame.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
