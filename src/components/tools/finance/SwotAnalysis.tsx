'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Shield, Target, TrendingUp, AlertTriangle, Plus, Trash2 } from 'lucide-react';

export default function SwotAnalysis() {
    const [strengths, setStrengths] = useState<string[]>(['Strong brand recognition', 'Experienced team']);
    const [weaknesses, setWeaknesses] = useState<string[]>(['Limited budget', 'Small market share']);
    const [opportunities, setOpportunities] = useState<string[]>(['Emerging markets', 'New technology trends']);
    const [threats, setThreats] = useState<string[]>(['Increasing competition', 'Regulatory changes']);

    const [newItem, setNewItem] = useState({ S: '', W: '', O: '', T: '' });

    const addItem = (quadrant: 'S' | 'W' | 'O' | 'T') => {
        const text = newItem[quadrant].trim();
        if (!text) return;
        if (quadrant === 'S') setStrengths([...strengths, text]);
        if (quadrant === 'W') setWeaknesses([...weaknesses, text]);
        if (quadrant === 'O') setOpportunities([...opportunities, text]);
        if (quadrant === 'T') setThreats([...threats, text]);
        setNewItem({ ...newItem, [quadrant]: '' });
    };

    const removeItem = (quadrant: 'S' | 'W' | 'O' | 'T', idx: number) => {
        if (quadrant === 'S') setStrengths(strengths.filter((_, i) => i !== idx));
        if (quadrant === 'W') setWeaknesses(weaknesses.filter((_, i) => i !== idx));
        if (quadrant === 'O') setOpportunities(opportunities.filter((_, i) => i !== idx));
        if (quadrant === 'T') setThreats(threats.filter((_, i) => i !== idx));
    };

    const totalItems = strengths.length + weaknesses.length + opportunities.length + threats.length;

    const quadrants = useMemo(() => [
        {
            key: 'S' as const, title: 'Strengths', items: strengths,
            icon: Shield, color: 'emerald',
            bgGrad: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10',
            border: 'border-emerald-200/60 dark:border-emerald-800/40',
            iconColor: 'text-emerald-600', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40',
            badgeText: 'text-emerald-700 dark:text-emerald-400',
            dotColor: 'bg-emerald-500',
        },
        {
            key: 'W' as const, title: 'Weaknesses', items: weaknesses,
            icon: AlertTriangle, color: 'rose',
            bgGrad: 'from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10',
            border: 'border-rose-200/60 dark:border-rose-800/40',
            iconColor: 'text-rose-600', badgeBg: 'bg-rose-100 dark:bg-rose-900/40',
            badgeText: 'text-rose-700 dark:text-rose-400',
            dotColor: 'bg-rose-500',
        },
        {
            key: 'O' as const, title: 'Opportunities', items: opportunities,
            icon: TrendingUp, color: 'blue',
            bgGrad: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10',
            border: 'border-blue-200/60 dark:border-blue-800/40',
            iconColor: 'text-blue-600', badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
            badgeText: 'text-blue-700 dark:text-blue-400',
            dotColor: 'bg-blue-500',
        },
        {
            key: 'T' as const, title: 'Threats', items: threats,
            icon: Target, color: 'amber',
            bgGrad: 'from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10',
            border: 'border-amber-200/60 dark:border-amber-800/40',
            iconColor: 'text-amber-600', badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
            badgeText: 'text-amber-700 dark:text-amber-400',
            dotColor: 'bg-amber-500',
        },
    ], [strengths, weaknesses, opportunities, threats]);

    // Donut chart data
    const r = 42, circ = 2 * Math.PI * r;
    const counts = [strengths.length, weaknesses.length, opportunities.length, threats.length];
    const colors = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b'];

    return (
        <CalculatorLayout
            title="SWOT Analysis"
            description="Visualize your Strengths, Weaknesses, Opportunities, and Threats in a structured grid"
            category="Business Strategy"
            insights={[
                { label: 'Strengths', value: `${strengths.length}`, color: 'text-emerald-600' },
                { label: 'Weaknesses', value: `${weaknesses.length}`, color: 'text-rose-600' },
                { label: 'Opportunities', value: `${opportunities.length}`, color: 'text-blue-600' },
                { label: 'Threats', value: `${threats.length}`, color: 'text-amber-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Overview donut */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            {totalItems > 0 && (() => {
                                let offset = 0;
                                return counts.map((count, i) => {
                                    const pct = count / totalItems;
                                    const dashLen = pct * circ;
                                    const dashOffset = -offset;
                                    offset += dashLen;
                                    return (
                                        <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={colors[i]} strokeWidth="8"
                                            strokeDasharray={`${dashLen} ${circ - dashLen}`} strokeDashoffset={dashOffset}
                                            transform="rotate(-90 50 50)" />
                                    );
                                });
                            })()}
                            <text x="50" y="54" textAnchor="middle" className="fill-slate-900 dark:fill-white text-sm font-bold">{totalItems}</text>
                        </svg>
                        <div className="space-y-1.5 flex-1">
                            {quadrants.map(q => (
                                <div key={q.key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${q.dotColor}`} />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">{q.title}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{q.items.length}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SWOT 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {quadrants.map(q => {
                            const Icon = q.icon;
                            return (
                                <div key={q.key} className={`p-4 rounded-xl bg-gradient-to-br ${q.bgGrad} border ${q.border}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Icon size={15} className={q.iconColor} />
                                        <span className={`text-sm font-bold ${q.iconColor}`}>{q.title}</span>
                                        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${q.badgeBg} ${q.badgeText}`}>{q.items.length}</span>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {q.items.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                                                <span className={`w-1.5 h-1.5 rounded-full ${q.dotColor} mt-1.5 flex-shrink-0`} />
                                                <span className="flex-1">{item}</span>
                                            </li>
                                        ))}
                                        {q.items.length === 0 && (
                                            <li className="text-xs text-slate-400 italic">No items added</li>
                                        )}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            }
        >
            {/* Input sections for each quadrant */}
            {quadrants.map(q => {
                const Icon = q.icon;
                return (
                    <div key={q.key}>
                        <div className="flex items-center gap-2 mb-2">
                            <Icon size={14} className={q.iconColor} />
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{q.title}</label>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${q.badgeBg} ${q.badgeText}`}>{q.items.length}</span>
                        </div>
                        <div className="space-y-1.5 mb-2">
                            {q.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/30 rounded-md">
                                    <span className={`w-1.5 h-1.5 rounded-full ${q.dotColor} flex-shrink-0`} />
                                    <span className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate">{item}</span>
                                    <button onClick={() => removeItem(q.key, idx)} className="p-0.5 text-slate-400 hover:text-rose-500 transition">
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-1.5">
                            <input type="text" value={newItem[q.key]} onChange={e => setNewItem({ ...newItem, [q.key]: e.target.value })}
                                placeholder={`Add ${q.title.toLowerCase().slice(0, -1)}…`}
                                onKeyDown={e => e.key === 'Enter' && addItem(q.key)}
                                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-emerald-500" />
                            <button onClick={() => addItem(q.key)}
                                className="px-2.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition">
                                <Plus size={13} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </CalculatorLayout>
    );
}
