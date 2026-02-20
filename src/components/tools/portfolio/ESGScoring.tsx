'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Leaf, Users, Shield, Building2, Star } from 'lucide-react';

interface CompanyESG {
    name: string;
    environmental: number;
    social: number;
    governance: number;
}

const DEFAULT_COMPANIES: CompanyESG[] = [
    { name: 'Company A', environmental: 8, social: 7, governance: 9 },
    { name: 'Company B', environmental: 5, social: 6, governance: 7 },
    { name: 'Company C', environmental: 9, social: 8, governance: 6 },
];

function esgGrade(score: number): { label: string; color: string } {
    if (score >= 8) return { label: 'Excellent', color: 'text-emerald-600' };
    if (score >= 6) return { label: 'Good', color: 'text-blue-600' };
    if (score >= 4) return { label: 'Average', color: 'text-amber-600' };
    return { label: 'Poor', color: 'text-rose-600' };
}

export default function ESGScoring() {
    const { formatPrice } = useCurrency();
    const [companies, setCompanies] = useState<CompanyESG[]>(DEFAULT_COMPANIES);

    const updateCompany = (idx: number, field: keyof CompanyESG, value: string | number) => {
        setCompanies(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
    };

    const addCompany = () => {
        if (companies.length < 5) setCompanies(prev => [...prev, { name: `Company ${prev.length + 1}`, environmental: 5, social: 5, governance: 5 }]);
    };

    const removeCompany = (idx: number) => {
        if (companies.length > 1) setCompanies(prev => prev.filter((_, i) => i !== idx));
    };

    const result = useMemo(() => {
        const scores = companies.map(c => ({
            ...c,
            total: Math.round(((c.environmental + c.social + c.governance) / 3) * 100) / 100,
        }));

        const avgE = scores.reduce((s, c) => s + c.environmental, 0) / scores.length;
        const avgS = scores.reduce((s, c) => s + c.social, 0) / scores.length;
        const avgG = scores.reduce((s, c) => s + c.governance, 0) / scores.length;
        const aggregate = Math.round(((avgE + avgS + avgG) / 3) * 100) / 100;

        const best = scores.reduce((a, b) => a.total > b.total ? a : b);
        const worst = scores.reduce((a, b) => a.total < b.total ? a : b);

        return { scores, avgE, avgS, avgG, aggregate, best, worst };
    }, [companies]);

    const grade = esgGrade(result.aggregate);

    // Bar chart dimensions
    const barMaxW = 180;
    const categories = [
        { label: 'Environmental', value: result.avgE, icon: Leaf, color: 'bg-emerald-500' },
        { label: 'Social', value: result.avgS, icon: Users, color: 'bg-blue-500' },
        { label: 'Governance', value: result.avgG, icon: Shield, color: 'bg-purple-500' },
    ];

    // SVG donut for aggregate
    const r = 42, circ = 2 * Math.PI * r;
    const fillPct = (result.aggregate / 10) * 100;
    const offset = circ - (fillPct / 100) * circ;

    return (
        <CalculatorLayout
            title="ESG Scoring"
            description="Rate and compare Environmental, Social, and Governance performance across your portfolio companies"
            category="Portfolio Analysis"
            insights={[
                { label: 'Aggregate ESG', value: `${result.aggregate}/10`, color: grade.color },
                { label: 'Environmental', value: `${result.avgE.toFixed(1)}/10`, color: 'text-emerald-600' },
                { label: 'Social', value: `${result.avgS.toFixed(1)}/10`, color: 'text-blue-600' },
                { label: 'Governance', value: `${result.avgG.toFixed(1)}/10`, color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Aggregate score */}
                    <div className={`text-center p-6 rounded-xl bg-gradient-to-br ${result.aggregate >= 7 ? 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/60 dark:border-emerald-800/40' : result.aggregate >= 5 ? 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/60 dark:border-blue-800/40' : 'from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200/60 dark:border-amber-800/40'}`}>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Aggregate ESG Score</p>
                        <p className={`text-4xl font-bold ${grade.color}`}>{result.aggregate}/10</p>
                        <p className={`text-sm font-semibold mt-1 ${grade.color}`}>{grade.label}</p>
                        <p className="text-xs text-slate-500 mt-2">Across {companies.length} {companies.length === 1 ? 'company' : 'companies'}</p>
                    </div>

                    {/* ESG radar-like bar visualization */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            <circle cx="50" cy="50" r={r} fill="none" stroke={result.aggregate >= 7 ? '#10b981' : result.aggregate >= 5 ? '#3b82f6' : '#f59e0b'} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-sm font-bold">{result.aggregate}</text>
                            <text x="50" y="62" textAnchor="middle" className="fill-slate-500 text-[9px]">/ 10</text>
                        </svg>
                        <div className="space-y-3 flex-1">
                            {categories.map(cat => (
                                <div key={cat.label}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <cat.icon size={12} className="text-slate-500" />
                                            <span className="text-xs text-slate-600 dark:text-slate-400">{cat.label}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{cat.value.toFixed(1)}</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${cat.color} rounded-full transition-all`} style={{ width: `${(cat.value / 10) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Company comparison */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Company Comparison</p>
                        <div className="space-y-3">
                            {result.scores.sort((a, b) => b.total - a.total).map((c, i) => {
                                const g = esgGrade(c.total);
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.name}</span>
                                                <span className={`text-sm font-bold ${g.color}`}>{c.total.toFixed(1)}</span>
                                            </div>
                                            <div className="flex gap-1 mt-1">
                                                <div className="h-1.5 flex-1 bg-emerald-400 rounded-full" style={{ opacity: c.environmental / 10 }} />
                                                <div className="h-1.5 flex-1 bg-blue-400 rounded-full" style={{ opacity: c.social / 10 }} />
                                                <div className="h-1.5 flex-1 bg-purple-400 rounded-full" style={{ opacity: c.governance / 10 }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-3 mt-3 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-1 rounded-sm bg-emerald-400 inline-block" /> E</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-1 rounded-sm bg-blue-400 inline-block" /> S</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-1 rounded-sm bg-purple-400 inline-block" /> G</span>
                        </div>
                    </div>

                    {/* Best & Worst */}
                    {companies.length > 1 && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star size={14} className="text-emerald-500" />
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Top Performer</p>
                                </div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{result.best.name}</p>
                                <p className="text-lg font-bold text-emerald-600">{result.best.total.toFixed(1)}/10</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 size={14} className="text-amber-500" />
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Needs Improvement</p>
                                </div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{result.worst.name}</p>
                                <p className="text-lg font-bold text-amber-600">{result.worst.total.toFixed(1)}/10</p>
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            {companies.map((company, idx) => (
                <div key={idx} className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company {idx + 1}</label>
                        {companies.length > 1 && (
                            <button onClick={() => removeCompany(idx)} className="text-xs text-rose-500 hover:text-rose-700">Remove</button>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Name</span>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{company.name}</span>
                        </div>
                        <input type="text" value={company.name} onChange={e => updateCompany(idx, 'name', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-slate-500 flex items-center gap-1"><Leaf size={12} /> Environmental</label>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{company.environmental}/10</span>
                        </div>
                        <input type="range" min={1} max={10} step={1} value={company.environmental} onChange={e => updateCompany(idx, 'environmental', Number(e.target.value))} className="w-full accent-emerald-500" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-slate-500 flex items-center gap-1"><Users size={12} /> Social</label>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{company.social}/10</span>
                        </div>
                        <input type="range" min={1} max={10} step={1} value={company.social} onChange={e => updateCompany(idx, 'social', Number(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-slate-500 flex items-center gap-1"><Shield size={12} /> Governance</label>
                            <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">{company.governance}/10</span>
                        </div>
                        <input type="range" min={1} max={10} step={1} value={company.governance} onChange={e => updateCompany(idx, 'governance', Number(e.target.value))} className="w-full accent-purple-500" />
                    </div>
                </div>
            ))}
            {companies.length < 5 && (
                <button onClick={addCompany} className="w-full py-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                    + Add Company
                </button>
            )}
        </CalculatorLayout>
    );
}
