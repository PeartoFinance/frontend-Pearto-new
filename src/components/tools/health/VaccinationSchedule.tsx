'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Syringe, AlertTriangle, Calendar, ShieldCheck } from 'lucide-react';

interface Vaccine {
    name: string;
    doses: string;
    schedule: string;
    notes: string;
}

const SCHEDULES: Record<string, Vaccine[]> = {
    'Infant (0-12 months)': [
        { name: 'Hepatitis B (HepB)', doses: '3 doses', schedule: 'Birth, 1 month, 6 months', notes: 'First dose within 24 hours of birth.' },
        { name: 'Rotavirus (RV)', doses: '2-3 doses', schedule: '2 months, 4 months, (6 months)', notes: 'Oral vaccine. Complete series by 8 months.' },
        { name: 'DTaP (Diphtheria, Tetanus, Pertussis)', doses: '3 doses', schedule: '2, 4, 6 months', notes: 'Additional boosters at 15-18 months and 4-6 years.' },
        { name: 'Haemophilus influenzae type b (Hib)', doses: '3-4 doses', schedule: '2, 4, (6), 12-15 months', notes: 'Protects against meningitis and severe bacterial infections.' },
        { name: 'Pneumococcal (PCV13)', doses: '3 doses', schedule: '2, 4, 6 months', notes: 'Booster at 12-15 months.' },
        { name: 'Inactivated Poliovirus (IPV)', doses: '3 doses', schedule: '2, 4, 6-18 months', notes: 'Final dose at 4-6 years.' },
        { name: 'Influenza (Flu)', doses: 'Annual', schedule: '6 months onwards', notes: 'First year: 2 doses, 4 weeks apart.' },
    ],
    'Child (1-6 years)': [
        { name: 'MMR (Measles, Mumps, Rubella)', doses: '2 doses', schedule: '12-15 months, 4-6 years', notes: 'Second dose before school entry.' },
        { name: 'Varicella (Chickenpox)', doses: '2 doses', schedule: '12-15 months, 4-6 years', notes: 'If not previously infected.' },
        { name: 'Hepatitis A (HepA)', doses: '2 doses', schedule: '12-23 months, 6 months later', notes: 'Two doses, 6 months apart.' },
        { name: 'DTaP Booster', doses: '2 doses', schedule: '15-18 months, 4-6 years', notes: 'Completing the primary series.' },
        { name: 'IPV Booster', doses: '1 dose', schedule: '4-6 years', notes: 'Final polio dose.' },
        { name: 'Influenza (Flu)', doses: 'Annual', schedule: 'Every fall', notes: 'Yearly vaccination recommended.' },
    ],
    'Teen (7-18 years)': [
        { name: 'Tdap (Tetanus, Diphtheria, Pertussis)', doses: '1 dose', schedule: '11-12 years', notes: 'Booster for adolescents. Td every 10 years after.' },
        { name: 'HPV (Human Papillomavirus)', doses: '2-3 doses', schedule: '11-12 years (up to 26)', notes: '2 doses if started before age 15; 3 doses if 15+. Prevents cervical and other cancers.' },
        { name: 'Meningococcal ACWY (MenACWY)', doses: '2 doses', schedule: '11-12 years, 16 years', notes: 'Booster at 16 for continued protection.' },
        { name: 'Meningococcal B (MenB)', doses: '2-3 doses', schedule: '16-23 years (clinical decision)', notes: 'Recommended based on risk factors.' },
        { name: 'Influenza (Flu)', doses: 'Annual', schedule: 'Every fall', notes: 'Yearly vaccination recommended.' },
        { name: 'COVID-19', doses: 'Per guidelines', schedule: 'Per current recommendations', notes: 'Follow CDC/WHO current guidance for boosters.' },
    ],
    'Adult (19-64 years)': [
        { name: 'Influenza (Flu)', doses: 'Annual', schedule: 'Every fall', notes: 'Recommended for all adults annually.' },
        { name: 'Td/Tdap', doses: 'Every 10 years', schedule: 'Td booster every 10 years', notes: 'One Tdap if not received as adolescent, then Td.' },
        { name: 'MMR', doses: '1-2 doses', schedule: 'If not previously vaccinated', notes: 'Born after 1957 without evidence of immunity.' },
        { name: 'Varicella', doses: '2 doses', schedule: 'If no evidence of immunity', notes: '4-8 weeks apart.' },
        { name: 'HPV', doses: '2-3 doses', schedule: 'Through age 26 (up to 45)', notes: 'Shared clinical decision for ages 27-45.' },
        { name: 'Hepatitis B', doses: '2-3 doses', schedule: 'If not previously vaccinated', notes: 'Especially for healthcare workers and at-risk groups.' },
        { name: 'COVID-19', doses: 'Per guidelines', schedule: 'Per current recommendations', notes: 'Follow CDC/WHO current guidance.' },
    ],
    'Senior (65+ years)': [
        { name: 'Influenza (Flu) — High Dose', doses: 'Annual', schedule: 'Every fall', notes: 'High-dose or adjuvanted formulation preferred for 65+.' },
        { name: 'Pneumococcal (PCV20 or PCV15+PPSV23)', doses: '1-2 doses', schedule: '65+ years', notes: 'If not previously vaccinated with PCV.' },
        { name: 'Shingles (Recombinant Zoster — Shingrix)', doses: '2 doses', schedule: '50+ years, 2-6 months apart', notes: 'Recommended even if had chickenpox or prior Zostavax.' },
        { name: 'Td/Tdap', doses: 'Every 10 years', schedule: 'Td booster every 10 years', notes: 'Continue regular boosters.' },
        { name: 'COVID-19', doses: 'Per guidelines', schedule: 'Per current recommendations', notes: 'Updated boosters recommended annually or per guidance.' },
        { name: 'RSV (Respiratory Syncytial Virus)', doses: '1 dose', schedule: '60+ years (shared decision)', notes: 'New vaccine; discuss with healthcare provider.' },
    ],
};

const AGE_GROUPS = Object.keys(SCHEDULES);

export default function VaccinationSchedule() {
    const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[0]);

    const vaccines = useMemo(() => SCHEDULES[ageGroup] || [], [ageGroup]);

    return (
        <CalculatorLayout
            title="Vaccination Schedule"
            description="View recommended vaccinations by age group"
            category="Health & Medical"
            insights={[
                { label: 'Age Group', value: ageGroup },
                { label: 'Vaccines', value: `${vaccines.length}`, color: 'text-blue-600' },
                { label: 'Annual', value: `${vaccines.filter(v => v.doses === 'Annual').length}`, color: 'text-purple-600' },
                { label: 'Multi-Dose', value: `${vaccines.filter(v => v.doses.includes('doses')).length}` },
            ]}
            results={
                <div className="space-y-4">
                    {/* Disclaimer */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            <strong>Disclaimer:</strong> This schedule is based on general CDC/ACIP recommendations. Individual needs may vary. Always consult your healthcare provider for personalized vaccination advice.
                        </p>
                    </div>

                    {/* Summary header */}
                    <div className="text-center p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                        <Syringe className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Recommended Vaccines</p>
                        <p className="text-4xl font-bold text-emerald-600">{vaccines.length}</p>
                        <p className="text-sm text-slate-500 mt-1">for {ageGroup}</p>
                    </div>

                    {/* Schedule table */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 overflow-x-auto">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={14} className="text-blue-500" />
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Schedule</p>
                        </div>
                        <div className="min-w-[500px]">
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 mb-2">
                                <div className="col-span-4">Vaccine</div>
                                <div className="col-span-2">Doses</div>
                                <div className="col-span-3">Schedule</div>
                                <div className="col-span-3">Notes</div>
                            </div>
                            {vaccines.map((v, i) => (
                                <div key={i} className={`grid grid-cols-12 gap-2 py-2.5 text-xs ${i % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''} rounded-lg px-1`}>
                                    <div className="col-span-4 flex items-center gap-2">
                                        <ShieldCheck size={12} className="text-emerald-500 flex-shrink-0" />
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">{v.name}</span>
                                    </div>
                                    <div className="col-span-2 text-slate-500">{v.doses}</div>
                                    <div className="col-span-3 text-slate-500">{v.schedule}</div>
                                    <div className="col-span-3 text-slate-400 text-[10px]">{v.notes}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cards view (mobile friendly) */}
                    <div className="space-y-2 md:hidden">
                        {vaccines.map((v, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                <div className="flex items-start gap-2">
                                    <ShieldCheck size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{v.name}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{v.doses} · {v.schedule}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{v.notes}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Age Group</label>
                <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                    {AGE_GROUPS.map(ag => (
                        <option key={ag} value={ag}>{ag}</option>
                    ))}
                </select>

                <div className="mt-4 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quick Select</p>
                    {AGE_GROUPS.map(ag => (
                        <button key={ag} onClick={() => setAgeGroup(ag)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${ageGroup === ag ? 'bg-emerald-500 text-white font-medium' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                            {ag}
                            <span className="float-right text-xs opacity-75">{SCHEDULES[ag].length} vaccines</span>
                        </button>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
