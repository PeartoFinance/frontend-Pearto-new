'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { BookOpen, Search, AlertTriangle, Tag } from 'lucide-react';

interface MedicalTerm {
    term: string;
    definition: string;
    category: string;
}

const TERMS: MedicalTerm[] = [
    { term: 'Hypertension', definition: 'A chronic condition where the blood pressure in the arteries is persistently elevated (≥130/80 mmHg). Major risk factor for heart disease, stroke, and kidney disease.', category: 'Cardiovascular' },
    { term: 'Tachycardia', definition: 'A heart rate that exceeds the normal resting rate, generally over 100 beats per minute in adults. Can be caused by exercise, stress, fever, or medical conditions.', category: 'Cardiovascular' },
    { term: 'Bradycardia', definition: 'A slower than normal heart rate, usually below 60 beats per minute. May be normal in athletes but can indicate underlying heart problems.', category: 'Cardiovascular' },
    { term: 'Arrhythmia', definition: 'An irregular heartbeat. The heart may beat too fast, too slow, or with an irregular rhythm. Some are harmless while others can be life-threatening.', category: 'Cardiovascular' },
    { term: 'Anemia', definition: 'A condition where you lack enough healthy red blood cells to carry adequate oxygen to tissues. Symptoms include fatigue, weakness, and pale skin.', category: 'Blood' },
    { term: 'Thrombocytopenia', definition: 'A condition characterized by abnormally low levels of platelets (thrombocytes) in the blood, which can lead to easy bruising and excessive bleeding.', category: 'Blood' },
    { term: 'Diabetes Mellitus', definition: 'A group of metabolic diseases characterized by high blood sugar levels over a prolonged period. Type 1 is autoimmune; Type 2 involves insulin resistance.', category: 'Endocrine' },
    { term: 'Hypothyroidism', definition: 'A condition where the thyroid gland does not produce enough thyroid hormones. Causes fatigue, weight gain, cold intolerance, and depression.', category: 'Endocrine' },
    { term: 'Hyperthyroidism', definition: 'Overproduction of thyroid hormones by the thyroid gland. Causes weight loss, rapid heartbeat, anxiety, and heat intolerance.', category: 'Endocrine' },
    { term: 'Pneumonia', definition: 'An infection that inflames the air sacs in one or both lungs, which may fill with fluid or pus. Caused by bacteria, viruses, or fungi.', category: 'Respiratory' },
    { term: 'Asthma', definition: 'A chronic condition in which the airways narrow, swell, and produce extra mucus. This can make breathing difficult and trigger coughing, wheezing, and shortness of breath.', category: 'Respiratory' },
    { term: 'COPD', definition: 'Chronic Obstructive Pulmonary Disease — a group of progressive lung diseases including emphysema and chronic bronchitis. Causes breathing difficulty, cough, and mucus.', category: 'Respiratory' },
    { term: 'Gastritis', definition: 'Inflammation of the stomach lining. Can be caused by H. pylori infection, excessive alcohol use, NSAIDs, or stress. Symptoms include nausea and upper abdominal pain.', category: 'Gastrointestinal' },
    { term: 'GERD', definition: 'Gastroesophageal Reflux Disease — a chronic digestive condition where stomach acid flows back into the esophagus, causing heartburn and acid indigestion.', category: 'Gastrointestinal' },
    { term: 'Cirrhosis', definition: 'Late-stage scarring (fibrosis) of the liver caused by many forms of liver disease, including hepatitis and chronic alcoholism. Impairs liver function.', category: 'Gastrointestinal' },
    { term: 'Osteoporosis', definition: 'A bone disease that occurs when the body loses too much bone, makes too little, or both. Bones become weak and brittle, increasing fracture risk.', category: 'Musculoskeletal' },
    { term: 'Arthritis', definition: 'Inflammation of one or more joints, causing pain and stiffness. Major types include osteoarthritis (wear-and-tear) and rheumatoid arthritis (autoimmune).', category: 'Musculoskeletal' },
    { term: 'Meningitis', definition: 'Inflammation of the membranes (meninges) surrounding the brain and spinal cord. Usually caused by viral or bacterial infection. A medical emergency.', category: 'Neurological' },
    { term: 'Epilepsy', definition: 'A neurological disorder marked by recurrent, unprovoked seizures. Caused by abnormal electrical activity in the brain. Treatment includes anticonvulsant medications.', category: 'Neurological' },
    { term: 'Neuropathy', definition: 'Damage or dysfunction of one or more nerves, resulting in numbness, tingling, muscle weakness, and pain. Common in diabetes.', category: 'Neurological' },
    { term: 'Sepsis', definition: 'A life-threatening condition caused by the body\'s extreme response to an infection. Can lead to tissue damage, organ failure, and death without treatment.', category: 'Infectious' },
    { term: 'Cellulitis', definition: 'A common and potentially serious bacterial skin infection. The affected skin appears swollen, red, and is typically painful and warm to the touch.', category: 'Infectious' },
    { term: 'Edema', definition: 'Swelling caused by excess fluid trapped in the body\'s tissues. Can result from medications, pregnancy, heart failure, or kidney disease.', category: 'General' },
    { term: 'Inflammation', definition: 'The body\'s immune response to injury, infection, or irritation. Characterized by redness, heat, swelling, pain, and sometimes loss of function.', category: 'General' },
    { term: 'Biopsy', definition: 'A medical procedure involving extraction of sample cells or tissues for examination to determine the presence or extent of a disease.', category: 'Procedures' },
    { term: 'MRI', definition: 'Magnetic Resonance Imaging — a medical imaging technique using magnetic fields and radio waves to create detailed images of organs and tissues.', category: 'Procedures' },
    { term: 'CT Scan', definition: 'Computed Tomography — an imaging procedure that uses X-rays and computer processing to create cross-sectional images of bones, blood vessels, and soft tissues.', category: 'Procedures' },
    { term: 'Benign', definition: 'Not cancerous. A benign tumor does not invade nearby tissue or spread to other parts of the body. Usually not life-threatening.', category: 'Oncology' },
    { term: 'Malignant', definition: 'Cancerous. A malignant tumor can invade and destroy nearby tissue and spread (metastasize) to other parts of the body.', category: 'Oncology' },
    { term: 'Metastasis', definition: 'The spread of cancer cells from the place where they first formed to another part of the body. Cancer cells can metastasize through blood or lymph systems.', category: 'Oncology' },
    { term: 'Antibiotic', definition: 'A type of medication used to treat bacterial infections. They work by killing bacteria or preventing them from reproducing. Not effective against viruses.', category: 'Pharmacology' },
    { term: 'NSAID', definition: 'Non-Steroidal Anti-Inflammatory Drug — a class of drugs that reduce pain, fever, and inflammation. Examples include ibuprofen, aspirin, and naproxen.', category: 'Pharmacology' },
    { term: 'Prognosis', definition: 'The likely course and expected outcome of a disease. A prognosis may predict the chance of recovery or recurrence.', category: 'General' },
    { term: 'Chronic', definition: 'A disease or condition that is persistent or long-lasting (typically more than 3 months). Examples include diabetes, hypertension, and asthma.', category: 'General' },
    { term: 'Acute', definition: 'A disease or condition with a rapid onset and/or short duration. Can be severe. Examples: acute appendicitis, acute myocardial infarction.', category: 'General' },
];

export default function MedicalDictionary() {
    const [search, setSearch] = useState('');

    const results = useMemo(() => {
        if (!search.trim()) return TERMS;
        const q = search.toLowerCase();
        return TERMS.filter(t =>
            t.term.toLowerCase().includes(q) ||
            t.definition.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        );
    }, [search]);

    const categories = useMemo(() => {
        const cats = new Set(results.map(r => r.category));
        return Array.from(cats).sort();
    }, [results]);

    return (
        <CalculatorLayout
            title="Medical Dictionary"
            description="Search common medical terms and their definitions"
            category="Health & Medical"
            insights={[
                { label: 'Total Terms', value: `${TERMS.length}` },
                { label: 'Results', value: `${results.length}`, color: 'text-blue-600' },
                { label: 'Categories', value: `${categories.length}`, color: 'text-purple-600' },
                { label: 'Search', value: search || 'All', color: 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Disclaimer */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            <strong>Disclaimer:</strong> Definitions are simplified for general understanding. They are NOT a substitute for professional medical education or clinical guidance.
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Matching Terms</p>
                        <p className="text-4xl font-bold text-blue-600">{results.length}</p>
                        <p className="text-sm text-slate-500 mt-1">{categories.length} categories</p>
                    </div>

                    {/* Category badges */}
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map(c => (
                            <button key={c} onClick={() => setSearch(c)}
                                className="text-[10px] px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition">
                                {c} ({results.filter(r => r.category === c).length})
                            </button>
                        ))}
                    </div>

                    {/* Results */}
                    {results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Search size={32} className="mb-2 opacity-40" />
                            <p className="text-sm">No terms found for &quot;{search}&quot;</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {results.map((t, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t.term}</h3>
                                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                                            <Tag size={8} />
                                            {t.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t.definition}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search Term</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search medical terms..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                </div>
                {search && (
                    <button onClick={() => setSearch('')} className="mt-2 text-xs text-slate-500 hover:text-red-500 transition">
                        Clear search
                    </button>
                )}

                <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Browse by Category</p>
                    <div className="space-y-1">
                        <button onClick={() => setSearch('')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!search ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                            All Terms
                            <span className="float-right text-xs opacity-75">{TERMS.length}</span>
                        </button>
                        {Array.from(new Set(TERMS.map(t => t.category))).sort().map(cat => (
                            <button key={cat} onClick={() => setSearch(cat)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${search === cat ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                                {cat}
                                <span className="float-right text-xs opacity-75">{TERMS.filter(t => t.category === cat).length}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
