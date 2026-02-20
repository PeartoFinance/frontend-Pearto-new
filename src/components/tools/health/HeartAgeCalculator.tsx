'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Heart, AlertTriangle, TrendingUp, TrendingDown, Activity, Cigarette } from 'lucide-react';

export default function HeartAgeCalculator() {
    const [actualAge, setActualAge] = useState(45);
    const [systolicBP, setSystolicBP] = useState(130);
    const [isSmoker, setIsSmoker] = useState(false);
    const [isDiabetic, setIsDiabetic] = useState(false);
    const [bmi, setBmi] = useState(26);
    const [exerciseFreq, setExerciseFreq] = useState<number>(2);

    const result = useMemo(() => {
        // Simplified heart age model based on Framingham risk factors
        let heartAge = actualAge;

        // Systolic BP impact
        if (systolicBP < 120) heartAge -= 2;
        else if (systolicBP >= 120 && systolicBP < 130) heartAge += 0;
        else if (systolicBP >= 130 && systolicBP < 140) heartAge += 3;
        else if (systolicBP >= 140 && systolicBP < 160) heartAge += 6;
        else heartAge += 10;

        // Smoking impact
        if (isSmoker) heartAge += 8;

        // Diabetes impact
        if (isDiabetic) heartAge += 6;

        // BMI impact
        if (bmi < 18.5) heartAge += 2;
        else if (bmi >= 18.5 && bmi < 25) heartAge -= 2;
        else if (bmi >= 25 && bmi < 30) heartAge += 3;
        else if (bmi >= 30 && bmi < 35) heartAge += 5;
        else heartAge += 8;

        // Exercise impact
        if (exerciseFreq >= 5) heartAge -= 5;
        else if (exerciseFreq >= 3) heartAge -= 3;
        else if (exerciseFreq >= 1) heartAge -= 1;
        else heartAge += 3;

        heartAge = Math.max(18, Math.round(heartAge));
        const difference = heartAge - actualAge;

        // Risk factors
        const riskFactors: { factor: string; status: 'good' | 'warning' | 'bad'; detail: string }[] = [];

        if (systolicBP >= 140) riskFactors.push({ factor: 'High Blood Pressure', status: 'bad', detail: `${systolicBP} mmHg — Stage 2 Hypertension` });
        else if (systolicBP >= 130) riskFactors.push({ factor: 'Elevated Blood Pressure', status: 'warning', detail: `${systolicBP} mmHg — Stage 1 Hypertension` });
        else riskFactors.push({ factor: 'Blood Pressure', status: 'good', detail: `${systolicBP} mmHg — Normal range` });

        riskFactors.push({ factor: 'Smoking', status: isSmoker ? 'bad' : 'good', detail: isSmoker ? 'Active smoker — major risk factor' : 'Non-smoker' });
        riskFactors.push({ factor: 'Diabetes', status: isDiabetic ? 'bad' : 'good', detail: isDiabetic ? 'Diabetic — increases cardiovascular risk' : 'No diabetes' });

        if (bmi >= 30) riskFactors.push({ factor: 'BMI', status: 'bad', detail: `${bmi} — Obese` });
        else if (bmi >= 25) riskFactors.push({ factor: 'BMI', status: 'warning', detail: `${bmi} — Overweight` });
        else riskFactors.push({ factor: 'BMI', status: 'good', detail: `${bmi} — Healthy range` });

        if (exerciseFreq < 1) riskFactors.push({ factor: 'Exercise', status: 'bad', detail: 'Sedentary — no regular exercise' });
        else if (exerciseFreq < 3) riskFactors.push({ factor: 'Exercise', status: 'warning', detail: `${exerciseFreq}x/week — below recommended` });
        else riskFactors.push({ factor: 'Exercise', status: 'good', detail: `${exerciseFreq}x/week — active` });

        // Improvement tips
        const tips: string[] = [];
        if (isSmoker) tips.push('Quit smoking — could reduce heart age by up to 8 years');
        if (systolicBP >= 130) tips.push('Work on lowering blood pressure through diet, exercise, and medication');
        if (bmi >= 25) tips.push('Aim for a healthy BMI (18.5–24.9) through balanced nutrition and activity');
        if (exerciseFreq < 3) tips.push('Increase to at least 150 minutes of moderate exercise per week');
        if (isDiabetic) tips.push('Manage blood sugar levels carefully — regular monitoring and medication adherence');
        if (tips.length === 0) tips.push('You\'re doing great! Maintain your healthy lifestyle habits.');

        return { heartAge, difference, riskFactors, tips };
    }, [actualAge, systolicBP, isSmoker, isDiabetic, bmi, exerciseFreq]);

    const statusColor = (s: string) => {
        if (s === 'bad') return 'text-red-600 bg-red-50 dark:bg-red-900/20';
        if (s === 'warning') return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    };

    const statusIcon = (s: string) => {
        if (s === 'bad') return '✕';
        if (s === 'warning') return '!';
        return '✓';
    };

    const exerciseLabels = ['None', '1x/week', '2x/week', '3x/week', '4x/week', '5x/week', '6x/week', 'Daily'];

    return (
        <CalculatorLayout
            title="Heart Age Calculator"
            description="Estimate your heart's biological age based on cardiovascular risk factors"
            category="Health & Medical"
            insights={[
                { label: 'Actual Age', value: `${actualAge} yrs` },
                { label: 'Heart Age', value: `${result.heartAge} yrs`, color: result.difference > 0 ? 'text-red-600' : 'text-emerald-600' },
                { label: 'Difference', value: `${result.difference > 0 ? '+' : ''}${result.difference} yrs`, color: result.difference > 0 ? 'text-red-600' : 'text-emerald-600' },
                { label: 'Risk Factors', value: `${result.riskFactors.filter(r => r.status !== 'good').length}`, color: result.riskFactors.filter(r => r.status !== 'good').length > 0 ? 'text-amber-600' : 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Disclaimer */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            <strong>Disclaimer:</strong> This is an estimate based on simplified risk models. Consult a healthcare professional for a thorough cardiovascular assessment.
                        </p>
                    </div>

                    {/* Main display */}
                    <div className="text-center p-5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
                        <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Your Estimated Heart Age</p>
                        <p className={`text-5xl font-bold ${result.difference > 5 ? 'text-red-600' : result.difference > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {result.heartAge}
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            {result.difference > 0 ? (
                                <TrendingUp size={16} className="text-red-500" />
                            ) : (
                                <TrendingDown size={16} className="text-emerald-500" />
                            )}
                            <span className={`text-sm font-medium ${result.difference > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {result.difference > 0 ? '+' : ''}{result.difference} years {result.difference > 0 ? 'older' : 'younger'} than actual age
                            </span>
                        </div>
                    </div>

                    {/* Age comparison visual */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Age Comparison</p>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Actual Age</span>
                                    <span>{actualAge} years</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min((actualAge / 100) * 100, 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Heart Age</span>
                                    <span>{result.heartAge} years</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${result.heartAge > actualAge ? 'bg-red-400' : 'bg-emerald-400'}`}
                                        style={{ width: `${Math.min((result.heartAge / 100) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Risk factors */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Risk Factors</p>
                        <div className="space-y-2">
                            {result.riskFactors.map(rf => (
                                <div key={rf.factor} className="flex items-center gap-3 p-2 rounded-lg">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${statusColor(rf.status)}`}>
                                        {statusIcon(rf.status)}
                                    </span>
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{rf.factor}</span>
                                        <p className="text-xs text-slate-500">{rf.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Improvement tips */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Improvement Tips</p>
                        <div className="space-y-2">
                            {result.tips.map((tip, i) => (
                                <div key={i} className="flex items-start gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <Activity size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Actual Age</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{actualAge} yrs</span>
                    </div>
                    <input type="number" value={actualAge} onChange={(e) => setActualAge(Math.max(18, Math.min(100, Number(e.target.value))))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={18} max={100} value={actualAge}
                        onChange={(e) => setActualAge(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Systolic Blood Pressure</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{systolicBP} mmHg</span>
                    </div>
                    <input type="number" value={systolicBP} onChange={(e) => setSystolicBP(Math.max(80, Math.min(220, Number(e.target.value))))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={80} max={220} value={systolicBP}
                        onChange={(e) => setSystolicBP(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">BMI</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{bmi}</span>
                    </div>
                    <input type="number" value={bmi} onChange={(e) => setBmi(Math.max(12, Math.min(60, Number(e.target.value))))} step={0.1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={12} max={50} value={bmi} step={0.5}
                        onChange={(e) => setBmi(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Exercise Frequency</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{exerciseLabels[exerciseFreq]}</span>
                    </div>
                    <input type="range" min={0} max={7} value={exerciseFreq}
                        onChange={(e) => setExerciseFreq(Number(e.target.value))} className="w-full accent-blue-500" />
                </div>

                <div className="space-y-2">
                    <label className={`flex items-center gap-3 px-3 py-3 rounded-lg border cursor-pointer transition ${isSmoker ? 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
                        <input type="checkbox" checked={isSmoker} onChange={(e) => setIsSmoker(e.target.checked)} className="accent-red-500 w-4 h-4" />
                        <div className="flex items-center gap-2">
                            <Cigarette size={14} className={isSmoker ? 'text-red-500' : 'text-slate-400'} />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Current smoker</span>
                        </div>
                    </label>

                    <label className={`flex items-center gap-3 px-3 py-3 rounded-lg border cursor-pointer transition ${isDiabetic ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
                        <input type="checkbox" checked={isDiabetic} onChange={(e) => setIsDiabetic(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Diabetic</span>
                    </label>
                </div>
            </div>
        </CalculatorLayout>
    );
}
