'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Pill, AlertTriangle, ShieldAlert, ShieldCheck, Plus, X } from 'lucide-react';

const MEDICATIONS = [
    'Aspirin', 'Warfarin', 'Ibuprofen', 'Acetaminophen', 'Metformin',
    'Lisinopril', 'Atorvastatin', 'Omeprazole', 'Amoxicillin', 'Metoprolol',
    'Losartan', 'Amlodipine', 'Sertraline', 'Fluoxetine', 'Gabapentin',
    'Prednisone', 'Ciprofloxacin', 'Diazepam', 'Tramadol', 'Naproxen',
    'Clopidogrel', 'Simvastatin', 'Levothyroxine', 'Alprazolam', 'Hydrocodone',
] as const;

interface Interaction {
    drug1: string;
    drug2: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    description: string;
    recommendation: string;
}

const INTERACTIONS: Interaction[] = [
    { drug1: 'Aspirin', drug2: 'Warfarin', severity: 'Severe', description: 'Significantly increased risk of bleeding due to combined anticoagulant and antiplatelet effects.', recommendation: 'Avoid combination unless prescribed by a specialist. Monitor for signs of bleeding.' },
    { drug1: 'Aspirin', drug2: 'Ibuprofen', severity: 'Moderate', description: 'NSAIDs may reduce the cardioprotective effect of aspirin and increase GI bleeding risk.', recommendation: 'Take aspirin at least 30 minutes before ibuprofen. Use lowest effective dose.' },
    { drug1: 'Warfarin', drug2: 'Acetaminophen', severity: 'Mild', description: 'Regular acetaminophen use may slightly increase INR levels.', recommendation: 'Monitor INR closely if using acetaminophen regularly. Keep doses below 2g/day.' },
    { drug1: 'Warfarin', drug2: 'Amoxicillin', severity: 'Moderate', description: 'Antibiotics may alter gut flora affecting vitamin K production, potentially increasing anticoagulant effect.', recommendation: 'Monitor INR more frequently during and after antibiotic course.' },
    { drug1: 'Metformin', drug2: 'Ciprofloxacin', severity: 'Moderate', description: 'Fluoroquinolones may affect blood glucose control, causing hypo- or hyperglycemia.', recommendation: 'Monitor blood glucose closely. Adjust metformin dose if necessary.' },
    { drug1: 'Lisinopril', drug2: 'Losartan', severity: 'Severe', description: 'Dual RAAS blockade increases risk of hyperkalemia, hypotension, and renal impairment.', recommendation: 'Avoid combination. Use one agent or switch to alternative.' },
    { drug1: 'Sertraline', drug2: 'Tramadol', severity: 'Severe', description: 'Risk of serotonin syndrome—a potentially life-threatening condition.', recommendation: 'Avoid combination or use with extreme caution under close medical supervision.' },
    { drug1: 'Fluoxetine', drug2: 'Tramadol', severity: 'Severe', description: 'Risk of serotonin syndrome. Both drugs increase serotonin levels.', recommendation: 'Avoid concurrent use. Consider alternative pain management.' },
    { drug1: 'Diazepam', drug2: 'Hydrocodone', severity: 'Severe', description: 'Combined CNS depressant effects can cause profound sedation, respiratory depression, or death.', recommendation: 'Avoid combination. FDA black box warning exists for this combination.' },
    { drug1: 'Diazepam', drug2: 'Alprazolam', severity: 'Moderate', description: 'Combined benzodiazepine use increases sedation and CNS depression risk.', recommendation: 'Do not combine two benzodiazepines. Consult prescriber.' },
    { drug1: 'Atorvastatin', drug2: 'Simvastatin', severity: 'Moderate', description: 'Combining two statins increases risk of myopathy and rhabdomyolysis.', recommendation: 'Use only one statin. Consult prescriber for dose adjustment.' },
    { drug1: 'Metoprolol', drug2: 'Amlodipine', severity: 'Mild', description: 'Additive blood pressure lowering and heart rate reduction effects.', recommendation: 'Often used together therapeutically but monitor blood pressure and heart rate.' },
    { drug1: 'Omeprazole', drug2: 'Clopidogrel', severity: 'Severe', description: 'Omeprazole significantly reduces the antiplatelet effect of clopidogrel.', recommendation: 'Switch to pantoprazole or alternative PPI. Avoid omeprazole with clopidogrel.' },
    { drug1: 'Prednisone', drug2: 'Ibuprofen', severity: 'Moderate', description: 'Combined use increases risk of GI ulceration and bleeding.', recommendation: 'Use GI protection (PPI) if combination is necessary. Minimize duration.' },
    { drug1: 'Prednisone', drug2: 'Metformin', severity: 'Moderate', description: 'Corticosteroids can raise blood glucose, counteracting metformin.', recommendation: 'Monitor blood glucose closely. May need temporary dose adjustments.' },
    { drug1: 'Gabapentin', drug2: 'Hydrocodone', severity: 'Severe', description: 'Combined CNS depressant effects increase risk of respiratory depression.', recommendation: 'FDA warning: use lowest doses for shortest duration if combination unavoidable.' },
    { drug1: 'Levothyroxine', drug2: 'Omeprazole', severity: 'Mild', description: 'PPIs may reduce absorption of levothyroxine.', recommendation: 'Take levothyroxine on empty stomach, at least 4 hours apart from omeprazole.' },
    { drug1: 'Aspirin', drug2: 'Naproxen', severity: 'Moderate', description: 'Combining NSAIDs increases GI bleeding risk and may reduce aspirin efficacy.', recommendation: 'Avoid concurrent use. Choose one NSAID or analgesic.' },
    { drug1: 'Warfarin', drug2: 'Naproxen', severity: 'Severe', description: 'NSAIDs with warfarin significantly increase risk of GI and other bleeding.', recommendation: 'Avoid combination. Use acetaminophen for pain if possible.' },
    { drug1: 'Fluoxetine', drug2: 'Sertraline', severity: 'Severe', description: 'Do not combine two SSRIs—risk of serotonin syndrome.', recommendation: 'Use only one SSRI. Taper one before starting another.' },
];

export default function DrugInteractionChecker() {
    const [selectedDrugs, setSelectedDrugs] = useState<string[]>(['Aspirin', 'Warfarin']);
    const [search, setSearch] = useState('');

    const addDrug = (drug: string) => {
        if (!selectedDrugs.includes(drug)) {
            setSelectedDrugs(prev => [...prev, drug]);
        }
        setSearch('');
    };

    const removeDrug = (drug: string) => {
        setSelectedDrugs(prev => prev.filter(d => d !== drug));
    };

    const filtered = MEDICATIONS.filter(
        m => m.toLowerCase().includes(search.toLowerCase()) && !selectedDrugs.includes(m)
    );

    const interactions = useMemo(() => {
        const found: (Interaction & { pair: string })[] = [];
        for (let i = 0; i < selectedDrugs.length; i++) {
            for (let j = i + 1; j < selectedDrugs.length; j++) {
                const a = selectedDrugs[i];
                const b = selectedDrugs[j];
                const match = INTERACTIONS.find(
                    ix => (ix.drug1 === a && ix.drug2 === b) || (ix.drug1 === b && ix.drug2 === a)
                );
                if (match) {
                    found.push({ ...match, pair: `${a} + ${b}` });
                }
            }
        }
        return found.sort((a, b) => {
            const order = { Severe: 0, Moderate: 1, Mild: 2 };
            return order[a.severity] - order[b.severity];
        });
    }, [selectedDrugs]);

    const severityColor = (s: string) => {
        if (s === 'Severe') return 'text-red-600 bg-red-50 dark:bg-red-900/20';
        if (s === 'Moderate') return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    };

    const severeCount = interactions.filter(i => i.severity === 'Severe').length;
    const moderateCount = interactions.filter(i => i.severity === 'Moderate').length;

    return (
        <CalculatorLayout
            title="Drug Interaction Checker"
            description="Check for known interactions between common medications"
            category="Health & Medical"
            insights={[
                { label: 'Medications', value: `${selectedDrugs.length}` },
                { label: 'Interactions Found', value: `${interactions.length}`, color: interactions.length > 0 ? 'text-amber-600' : 'text-emerald-600' },
                { label: 'Severe', value: `${severeCount}`, color: severeCount > 0 ? 'text-red-600' : 'text-emerald-600' },
                { label: 'Moderate', value: `${moderateCount}`, color: moderateCount > 0 ? 'text-amber-600' : 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Disclaimer */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            <strong>Disclaimer:</strong> This is a simplified reference tool, NOT a substitute for professional medical or pharmaceutical advice. Always consult your pharmacist or physician.
                        </p>
                    </div>

                    {selectedDrugs.length < 2 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Pill size={32} className="mb-2 opacity-40" />
                            <p className="text-sm">Add at least 2 medications to check interactions</p>
                        </div>
                    ) : interactions.length === 0 ? (
                        <div className="text-center p-5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl">
                            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No Known Interactions</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">All Clear</p>
                            <p className="text-xs text-slate-400 mt-1">No interactions found in our database for these medications</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary */}
                            <div className="text-center p-5 bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20 rounded-xl">
                                <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">Interactions Found</p>
                                <p className="text-4xl font-bold text-red-600">{interactions.length}</p>
                                <p className="text-sm text-slate-500 mt-1">{severeCount} severe · {moderateCount} moderate</p>
                            </div>

                            {/* Severity bar */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Severity Breakdown</p>
                                <div className="flex h-4 rounded-full overflow-hidden">
                                    {severeCount > 0 && <div className="bg-red-400" style={{ flex: severeCount }} />}
                                    {moderateCount > 0 && <div className="bg-amber-400" style={{ flex: moderateCount }} />}
                                    {interactions.length - severeCount - moderateCount > 0 && <div className="bg-emerald-400" style={{ flex: interactions.length - severeCount - moderateCount }} />}
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>Severe ({severeCount})</span>
                                    <span>Moderate ({moderateCount})</span>
                                    <span>Mild ({interactions.length - severeCount - moderateCount})</span>
                                </div>
                            </div>

                            {/* Interaction cards */}
                            <div className="space-y-3">
                                {interactions.map((ix, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{ix.pair}</h3>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${severityColor(ix.severity)}`}>
                                                {ix.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2">{ix.description}</p>
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                                <strong>Recommendation:</strong> {ix.recommendation}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search & Add Medications</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Type medication name..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                    {search && filtered.length > 0 && (
                        <div className="mt-1 max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                            {filtered.map(m => (
                                <button key={m} onClick={() => addDrug(m)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                    <Plus size={12} className="text-emerald-500" />
                                    <span className="text-slate-700 dark:text-slate-300">{m}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Selected Medications ({selectedDrugs.length})</p>
                    <div className="space-y-1.5">
                        {selectedDrugs.map(d => (
                            <div key={d} className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2">
                                    <Pill size={14} className="text-blue-500" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{d}</span>
                                </div>
                                <button onClick={() => removeDrug(d)} className="p-1 text-slate-400 hover:text-red-500 transition">
                                    <X size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Quick Add</p>
                    <div className="flex flex-wrap gap-1.5">
                        {MEDICATIONS.filter(m => !selectedDrugs.includes(m)).slice(0, 8).map(m => (
                            <button key={m} onClick={() => addDrug(m)} className="text-[11px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition">
                                + {m}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
