'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Stethoscope, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

const SYMPTOMS = [
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea',
    'Body Ache', 'Sore Throat', 'Congestion', 'Diarrhea',
    'Chest Pain', 'Dizziness', 'Shortness of Breath',
] as const;

interface Condition {
    name: string;
    symptoms: string[];
    severity: 'Low' | 'Moderate' | 'High';
    seeDoctor: boolean;
    description: string;
}

const CONDITIONS: Condition[] = [
    { name: 'Common Cold', symptoms: ['Cough', 'Congestion', 'Sore Throat', 'Fatigue', 'Headache'], severity: 'Low', seeDoctor: false, description: 'Viral upper respiratory infection; usually resolves in 7–10 days.' },
    { name: 'Influenza (Flu)', symptoms: ['Fever', 'Body Ache', 'Fatigue', 'Cough', 'Headache', 'Congestion'], severity: 'Moderate', seeDoctor: true, description: 'Influenza virus infection with sudden onset of systemic symptoms.' },
    { name: 'COVID-19', symptoms: ['Fever', 'Cough', 'Fatigue', 'Body Ache', 'Shortness of Breath', 'Headache', 'Sore Throat', 'Congestion', 'Diarrhea'], severity: 'High', seeDoctor: true, description: 'Coronavirus infection; seek testing and medical guidance.' },
    { name: 'Migraine', symptoms: ['Headache', 'Nausea', 'Dizziness', 'Fatigue'], severity: 'Moderate', seeDoctor: false, description: 'Recurrent throbbing headache, often with sensitivity to light and sound.' },
    { name: 'Gastroenteritis', symptoms: ['Nausea', 'Diarrhea', 'Fatigue', 'Body Ache', 'Fever'], severity: 'Moderate', seeDoctor: true, description: 'Stomach and intestinal inflammation, often viral ("stomach flu").' },
    { name: 'Allergies', symptoms: ['Congestion', 'Cough', 'Headache', 'Fatigue'], severity: 'Low', seeDoctor: false, description: 'Immune response to allergens like pollen, dust, or pet dander.' },
    { name: 'Pneumonia', symptoms: ['Cough', 'Fever', 'Shortness of Breath', 'Chest Pain', 'Fatigue', 'Body Ache'], severity: 'High', seeDoctor: true, description: 'Lung infection that can be bacterial, viral, or fungal. Requires medical attention.' },
    { name: 'Strep Throat', symptoms: ['Sore Throat', 'Fever', 'Headache', 'Body Ache', 'Nausea'], severity: 'Moderate', seeDoctor: true, description: 'Bacterial throat infection; antibiotics typically required.' },
    { name: 'Dehydration', symptoms: ['Dizziness', 'Fatigue', 'Headache', 'Nausea'], severity: 'Low', seeDoctor: false, description: 'Insufficient fluid intake; increase water consumption and rest.' },
    { name: 'Heart-Related Issue', symptoms: ['Chest Pain', 'Shortness of Breath', 'Dizziness', 'Nausea', 'Fatigue'], severity: 'High', seeDoctor: true, description: 'Possible cardiovascular concern. Seek immediate medical attention if symptoms are severe.' },
];

export default function SymptomChecker() {
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (s: string) => {
        setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    const results = useMemo(() => {
        if (selected.length === 0) return [];
        return CONDITIONS
            .map(c => {
                const matched = c.symptoms.filter(s => selected.includes(s));
                const score = matched.length / c.symptoms.length;
                return { ...c, matched, score, matchCount: matched.length };
            })
            .filter(c => c.matchCount >= 2)
            .sort((a, b) => b.score - a.score);
    }, [selected]);

    const severityColor = (s: string) => {
        if (s === 'High') return 'text-red-600 bg-red-50 dark:bg-red-900/20';
        if (s === 'Moderate') return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    };

    const highSeverityCount = results.filter(r => r.severity === 'High').length;

    return (
        <CalculatorLayout
            title="Symptom Checker"
            description="Select symptoms to see possible conditions — NOT medical advice"
            category="Health & Medical"
            insights={[
                { label: 'Symptoms Selected', value: `${selected.length}` },
                { label: 'Possible Conditions', value: `${results.length}`, color: 'text-blue-600' },
                { label: 'High Severity', value: `${highSeverityCount}`, color: highSeverityCount > 0 ? 'text-red-600' : 'text-emerald-600' },
                { label: 'See a Doctor', value: results.some(r => r.seeDoctor) ? 'Recommended' : 'Monitor', color: results.some(r => r.seeDoctor) ? 'text-red-600' : 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Disclaimer */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            <strong>Disclaimer:</strong> This tool is for informational purposes only and is NOT medical advice. Always consult a healthcare professional for diagnosis and treatment.
                        </p>
                    </div>

                    {selected.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Stethoscope size={32} className="mb-2 opacity-40" />
                            <p className="text-sm">Select at least 2 symptoms to see possible conditions</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <ShieldCheck size={32} className="mb-2 opacity-40" />
                            <p className="text-sm">No conditions matched. Select more symptoms or consult a doctor.</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary */}
                            <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                                <Stethoscope className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">Possible Conditions Found</p>
                                <p className="text-4xl font-bold text-blue-600">{results.length}</p>
                                <p className="text-sm text-slate-500 mt-1">{selected.length} symptoms selected</p>
                            </div>

                            {/* Match bar chart */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Match Strength</p>
                                <div className="space-y-2">
                                    {results.map(r => (
                                        <div key={r.name} className="flex items-center gap-3">
                                            <span className="text-xs text-slate-600 dark:text-slate-400 w-32 truncate text-right">{r.name}</span>
                                            <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${r.severity === 'High' ? 'bg-red-400' : r.severity === 'Moderate' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                    style={{ width: `${Math.round(r.score * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500 w-10">{Math.round(r.score * 100)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Condition cards */}
                            <div className="space-y-3">
                                {results.map(r => (
                                    <div key={r.name} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{r.name}</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${severityColor(r.severity)}`}>
                                                {r.severity}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {r.symptoms.map(s => (
                                                <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full ${r.matched.includes(s) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                                    {s} {r.matched.includes(s) ? '✓' : ''}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs mt-2">
                                            <span className="text-slate-500">Matched:</span>{' '}
                                            <span className="font-semibold text-blue-600">{r.matchCount}/{r.symptoms.length}</span>
                                        </p>
                                        {r.seeDoctor && (
                                            <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                                                <Activity size={12} /> Consult a doctor recommended
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Select Your Symptoms</label>
                <div className="grid grid-cols-1 gap-2">
                    {SYMPTOMS.map(s => (
                        <label key={s} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition ${selected.includes(s) ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'}`}>
                            <input type="checkbox" checked={selected.includes(s)} onChange={() => toggle(s)} className="accent-blue-500 w-4 h-4" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{s}</span>
                        </label>
                    ))}
                </div>
                {selected.length > 0 && (
                    <button onClick={() => setSelected([])} className="mt-3 w-full text-xs text-slate-500 hover:text-red-500 transition">
                        Clear all selections
                    </button>
                )}
            </div>
        </CalculatorLayout>
    );
}
