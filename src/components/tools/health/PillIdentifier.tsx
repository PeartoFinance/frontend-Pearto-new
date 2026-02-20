'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Pill, AlertTriangle, Search, ShieldCheck } from 'lucide-react';

interface PillEntry {
    name: string;
    color: string;
    shape: string;
    imprint: string;
    use: string;
    strength: string;
    warnings: string;
}

const PILLS: PillEntry[] = [
    { name: 'Ibuprofen 200mg', color: 'Brown', shape: 'Round', imprint: 'I-2', use: 'Pain relief, anti-inflammatory, fever reducer (NSAID)', strength: '200mg', warnings: 'May cause stomach bleeding. Avoid with kidney disease or blood thinners.' },
    { name: 'Acetaminophen 500mg', color: 'White', shape: 'Capsule-shaped', imprint: 'L484', use: 'Pain relief and fever reducer', strength: '500mg', warnings: 'Do not exceed 4g/day. Can cause liver damage with alcohol or overdose.' },
    { name: 'Aspirin 325mg', color: 'White', shape: 'Round', imprint: 'BAYER', use: 'Pain relief, blood thinner, anti-inflammatory', strength: '325mg', warnings: 'Not for children. Increases bleeding risk. Take with food.' },
    { name: 'Lisinopril 10mg', color: 'Pink', shape: 'Round', imprint: 'LUPIN 10', use: 'ACE inhibitor for high blood pressure and heart failure', strength: '10mg', warnings: 'May cause dry cough. Do not use in pregnancy. Monitor potassium.' },
    { name: 'Metformin 500mg', color: 'White', shape: 'Round', imprint: 'MET 500', use: 'Type 2 diabetes — lowers blood sugar', strength: '500mg', warnings: 'Take with food. May cause GI upset. Rare risk of lactic acidosis.' },
    { name: 'Atorvastatin 20mg', color: 'White', shape: 'Oval', imprint: 'PD 157 20', use: 'Statin — lowers cholesterol', strength: '20mg', warnings: 'Avoid grapefruit. Report muscle pain. Monitor liver function.' },
    { name: 'Omeprazole 20mg', color: 'Purple', shape: 'Capsule', imprint: 'OMP 20', use: 'Proton pump inhibitor for acid reflux/GERD', strength: '20mg', warnings: 'Not for long-term use without guidance. May reduce magnesium.' },
    { name: 'Amoxicillin 500mg', color: 'Pink/Red', shape: 'Capsule', imprint: 'AMOX 500', use: 'Antibiotic for bacterial infections', strength: '500mg', warnings: 'Complete full course. Check for penicillin allergy. May cause diarrhea.' },
    { name: 'Sertraline 50mg', color: 'Blue', shape: 'Oval', imprint: 'SRT 50', use: 'SSRI antidepressant for depression and anxiety', strength: '50mg', warnings: 'May increase suicidal thoughts in youth. Do not stop abruptly.' },
    { name: 'Metoprolol 25mg', color: 'White', shape: 'Round', imprint: 'M 25', use: 'Beta-blocker for high blood pressure and heart conditions', strength: '25mg', warnings: 'Do not stop abruptly. May cause fatigue and dizziness.' },
    { name: 'Losartan 50mg', color: 'Green', shape: 'Oval', imprint: 'LOS 50', use: 'ARB for high blood pressure', strength: '50mg', warnings: 'Do not use in pregnancy. Monitor potassium and kidney function.' },
    { name: 'Amlodipine 5mg', color: 'White', shape: 'Round', imprint: 'AML 5', use: 'Calcium channel blocker for blood pressure and chest pain', strength: '5mg', warnings: 'May cause ankle swelling and dizziness.' },
    { name: 'Gabapentin 300mg', color: 'Yellow', shape: 'Capsule', imprint: 'GAB 300', use: 'Nerve pain, seizures, off-label anxiety', strength: '300mg', warnings: 'Do not stop abruptly. May cause drowsiness and dizziness.' },
    { name: 'Levothyroxine 50mcg', color: 'White', shape: 'Round', imprint: 'LEVO 50', use: 'Thyroid hormone replacement for hypothyroidism', strength: '50mcg', warnings: 'Take on empty stomach. Many drug interactions. Regular blood tests needed.' },
    { name: 'Prednisone 10mg', color: 'White', shape: 'Round', imprint: 'PRED 10', use: 'Corticosteroid for inflammation, allergies, autoimmune conditions', strength: '10mg', warnings: 'Do not stop abruptly. Long-term use causes many side effects.' },
    { name: 'Ciprofloxacin 500mg', color: 'White', shape: 'Oval', imprint: 'CIPRO 500', use: 'Fluoroquinolone antibiotic for bacterial infections', strength: '500mg', warnings: 'Risk of tendon rupture. Avoid in children. Many drug interactions.' },
    { name: 'Hydrochlorothiazide 25mg', color: 'White', shape: 'Round', imprint: 'HCT 25', use: 'Thiazide diuretic for high blood pressure', strength: '25mg', warnings: 'May cause dehydration and electrolyte imbalance. Sun sensitivity.' },
    { name: 'Alprazolam 0.5mg', color: 'Orange', shape: 'Oval', imprint: 'XANAX 0.5', use: 'Benzodiazepine for anxiety and panic disorders', strength: '0.5mg', warnings: 'Highly habit-forming. CNS depressant. Do not combine with alcohol.' },
    { name: 'Fluoxetine 20mg', color: 'Green/White', shape: 'Capsule', imprint: 'FL 20', use: 'SSRI antidepressant (Prozac)', strength: '20mg', warnings: 'May increase suicidal thoughts in youth. Many drug interactions.' },
    { name: 'Diphenhydramine 25mg', color: 'Pink', shape: 'Capsule-shaped', imprint: 'ZLP 25', use: 'Antihistamine for allergies and sleep aid (Benadryl)', strength: '25mg', warnings: 'Causes drowsiness. Avoid in elderly. Do not drive after taking.' },
    { name: 'Naproxen 220mg', color: 'Blue', shape: 'Oval', imprint: 'ALEVE', use: 'NSAID for pain, inflammation, fever', strength: '220mg', warnings: 'Take with food. GI bleeding risk. Avoid with blood thinners.' },
    { name: 'Cetirizine 10mg', color: 'White', shape: 'Round', imprint: 'ZYR 10', use: 'Antihistamine for allergies (Zyrtec)', strength: '10mg', warnings: 'May cause mild drowsiness. Generally well-tolerated.' },
];

const COLORS = ['Any', 'White', 'Blue', 'Pink', 'Pink/Red', 'Brown', 'Green', 'Green/White', 'Purple', 'Yellow', 'Orange'] as const;
const SHAPES = ['Any', 'Round', 'Oval', 'Capsule', 'Capsule-shaped'] as const;

export default function PillIdentifier() {
    const [color, setColor] = useState<string>('Any');
    const [shape, setShape] = useState<string>('Any');
    const [imprint, setImprint] = useState('');

    const results = useMemo(() => {
        return PILLS.filter(p => {
            if (color !== 'Any' && !p.color.toLowerCase().includes(color.toLowerCase())) return false;
            if (shape !== 'Any' && !p.shape.toLowerCase().includes(shape.toLowerCase())) return false;
            if (imprint && !p.imprint.toLowerCase().includes(imprint.toLowerCase()) && !p.name.toLowerCase().includes(imprint.toLowerCase())) return false;
            return true;
        });
    }, [color, shape, imprint]);

    const colorDot = (c: string) => {
        const map: Record<string, string> = {
            'White': 'bg-white border border-slate-300',
            'Blue': 'bg-blue-400',
            'Pink': 'bg-pink-300',
            'Pink/Red': 'bg-red-300',
            'Brown': 'bg-amber-700',
            'Green': 'bg-green-400',
            'Green/White': 'bg-green-300',
            'Purple': 'bg-purple-400',
            'Yellow': 'bg-yellow-400',
            'Orange': 'bg-orange-400',
        };
        return map[c] || 'bg-slate-300';
    };

    return (
        <CalculatorLayout
            title="Pill Identifier"
            description="Identify pills by color, shape, and imprint text"
            category="Health & Medical"
            insights={[
                { label: 'Database', value: `${PILLS.length} pills` },
                { label: 'Matches', value: `${results.length}`, color: 'text-blue-600' },
                { label: 'Color', value: color },
                { label: 'Shape', value: shape },
            ]}
            results={
                <div className="space-y-4">
                    {/* Disclaimer */}
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-700 dark:text-red-400">
                            <strong>Important:</strong> This tool is for informational purposes ONLY. Do NOT take any medication based solely on this tool&apos;s identification. Always verify with a pharmacist or healthcare provider. Many pills look similar.
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <Pill className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Matching Medications</p>
                        <p className="text-4xl font-bold text-blue-600">{results.length}</p>
                        <p className="text-sm text-slate-500 mt-1">
                            {color !== 'Any' ? `${color} · ` : ''}{shape !== 'Any' ? `${shape} · ` : ''}{imprint ? `"${imprint}"` : 'All filters'}
                        </p>
                    </div>

                    {results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Search size={32} className="mb-2 opacity-40" />
                            <p className="text-sm">No pills match your criteria. Try broadening your search.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {results.map((p, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex-shrink-0 ${colorDot(p.color)}`} />
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{p.name}</h3>
                                                <p className="text-[10px] text-slate-400">{p.color} · {p.shape} · "{p.imprint}"</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">{p.strength}</span>
                                    </div>
                                    <div className="mb-2">
                                        <p className="text-xs text-slate-500 mb-0.5 font-medium">Use:</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">{p.use}</p>
                                    </div>
                                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <p className="text-[10px] text-amber-700 dark:text-amber-400">
                                            <strong>⚠ Warnings:</strong> {p.warnings}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pill Color</label>
                    <select value={color} onChange={(e) => setColor(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {COLORS.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {COLORS.filter(c => c !== 'Any').map(c => (
                            <button key={c} onClick={() => setColor(c)}
                                className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full transition ${color === c ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 font-semibold' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                <span className={`w-2.5 h-2.5 rounded-full inline-block ${colorDot(c)}`} />
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shape</label>
                    <select value={shape} onChange={(e) => setShape(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {SHAPES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Imprint Text</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={imprint}
                            onChange={(e) => setImprint(e.target.value)}
                            placeholder="Letters or numbers on the pill..."
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                        />
                    </div>
                </div>

                {(color !== 'Any' || shape !== 'Any' || imprint) && (
                    <button onClick={() => { setColor('Any'); setShape('Any'); setImprint(''); }}
                        className="w-full text-xs text-slate-500 hover:text-red-500 transition py-2">
                        Reset all filters
                    </button>
                )}

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1">
                        <ShieldCheck size={12} className="text-blue-500" />
                        <p className="text-xs font-semibold text-blue-600">Tip</p>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-400">Look for letters, numbers, or symbols stamped or printed on the pill. Enter them in the imprint field for best results.</p>
                </div>
            </div>
        </CalculatorLayout>
    );
}
