'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Target, CheckCircle2, Calendar, TrendingUp, Lightbulb } from 'lucide-react';

export default function GoalSettingTemplate() {
    const { formatPrice } = useCurrency();
    const [specific, setSpecific] = useState('Increase monthly savings to $1,500');
    const [measurable, setMeasurable] = useState('Track monthly bank balance and savings transfers');
    const [achievable, setAchievable] = useState('Currently saving $800/month, need to cut $700 in expenses');
    const [relevant, setRelevant] = useState('Building emergency fund for financial security');
    const [timeBound, setTimeBound] = useState('Within 6 months by July 2026');

    const [milestones, setMilestones] = useState([
        { label: 'Audit current expenses', done: true },
        { label: 'Identify $700 in cuts', done: true },
        { label: 'Hit $1,000/month savings', done: false },
        { label: 'Hit $1,500/month savings', done: false },
    ]);

    const toggleMilestone = (idx: number) => {
        setMilestones(prev => prev.map((m, i) => i === idx ? { ...m, done: !m.done } : m));
    };

    const addMilestone = () => {
        setMilestones(prev => [...prev, { label: '', done: false }]);
    };

    const updateMilestoneLabel = (idx: number, label: string) => {
        setMilestones(prev => prev.map((m, i) => i === idx ? { ...m, label } : m));
    };

    const removeMilestone = (idx: number) => {
        setMilestones(prev => prev.filter((_, i) => i !== idx));
    };

    const result = useMemo(() => {
        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter(m => m.done).length;
        const progressPct = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

        const hasSpecific = specific.trim().length > 5;
        const hasMeasurable = measurable.trim().length > 5;
        const hasAchievable = achievable.trim().length > 5;
        const hasRelevant = relevant.trim().length > 5;
        const hasTimeBound = timeBound.trim().length > 5;
        const smartScore = [hasSpecific, hasMeasurable, hasAchievable, hasRelevant, hasTimeBound].filter(Boolean).length;

        // Generate formatted goal statement
        const goalStatement = specific.trim()
            ? `I will ${specific.trim().toLowerCase()}, measured by ${measurable.trim().toLowerCase() || '...'}, which is achievable because ${achievable.trim().toLowerCase() || '...'}, relevant because ${relevant.trim().toLowerCase() || '...'}, and I will accomplish this ${timeBound.trim().toLowerCase() || '...'}. `
            : 'Fill in all SMART fields to generate your goal statement.';

        return { totalMilestones, completedMilestones, progressPct, smartScore, goalStatement, hasSpecific, hasMeasurable, hasAchievable, hasRelevant, hasTimeBound };
    }, [specific, measurable, achievable, relevant, timeBound, milestones]);

    // Donut for SMART completeness
    const rd = 42, circ = 2 * Math.PI * rd;
    const smartPct = (result.smartScore / 5) * 100;

    const smartItems = [
        { key: 'S', label: 'Specific', filled: result.hasSpecific, color: '#3b82f6' },
        { key: 'M', label: 'Measurable', filled: result.hasMeasurable, color: '#10b981' },
        { key: 'A', label: 'Achievable', filled: result.hasAchievable, color: '#f59e0b' },
        { key: 'R', label: 'Relevant', filled: result.hasRelevant, color: '#8b5cf6' },
        { key: 'T', label: 'Time-bound', filled: result.hasTimeBound, color: '#ef4444' },
    ];

    return (
        <CalculatorLayout
            title="SMART Goal Setting Template"
            description="Create well-defined goals using the SMART framework and track your progress"
            category="Productivity"
            insights={[
                { label: 'SMART Score', value: `${result.smartScore}/5`, color: result.smartScore === 5 ? 'text-emerald-600' : 'text-amber-600' },
                { label: 'Milestones', value: `${result.completedMilestones}/${result.totalMilestones}` },
                { label: 'Progress', value: `${result.progressPct.toFixed(0)}%`, color: result.progressPct >= 75 ? 'text-emerald-600' : 'text-blue-600' },
                { label: 'Status', value: result.smartScore === 5 ? 'Complete' : 'Incomplete', color: result.smartScore === 5 ? 'text-emerald-600' : 'text-amber-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* SMART completeness */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={rd} fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
                            <circle cx="50" cy="50" r={rd} fill="none" stroke="#10b981" strokeWidth="8"
                                strokeDasharray={`${(smartPct / 100) * circ} ${circ - (smartPct / 100) * circ}`}
                                strokeLinecap="round" transform="rotate(-90 50 50)" />
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[12px] font-bold">
                                {result.smartScore}/5
                            </text>
                            <text x="50" y="60" textAnchor="middle" className="fill-slate-500 text-[7px]">SMART</text>
                        </svg>
                        <div className="space-y-1.5 flex-1">
                            {smartItems.map(item => (
                                <div key={item.key} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white`}
                                        style={{ backgroundColor: item.filled ? item.color : '#cbd5e1' }}>
                                        {item.key}
                                    </div>
                                    <span className={`text-xs ${item.filled ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                                        {item.label}
                                    </span>
                                    {item.filled && <CheckCircle2 size={12} className="text-emerald-500 ml-auto" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Goal statement */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb size={14} className="text-blue-500" />
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Your Goal Statement</p>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                            &ldquo;{result.goalStatement}&rdquo;
                        </p>
                    </div>

                    {/* Progress tracking */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Milestones</p>
                            <span className="text-xs font-semibold text-emerald-600">{result.progressPct.toFixed(0)}%</span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${result.progressPct}%` }} />
                        </div>
                        <div className="space-y-2">
                            {milestones.map((m, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <button onClick={() => toggleMilestone(i)}
                                        className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition ${m.done
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                        {m.done && <CheckCircle2 size={12} />}
                                    </button>
                                    <span className={`text-sm flex-1 ${m.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {m.label || 'Unnamed milestone'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">💡 Goal Setting Tips</p>
                        <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                            <li>• Write goals in positive language (what you will do, not won&apos;t)</li>
                            <li>• Break large goals into weekly milestones</li>
                            <li>• Review your goals weekly and adjust as needed</li>
                            <li>• Share your goal with an accountability partner</li>
                            <li>• Celebrate small wins along the way</li>
                        </ul>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">S</div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specific</label>
                    </div>
                    <textarea value={specific} onChange={(e) => setSpecific(e.target.value)} rows={2}
                        placeholder="What exactly do you want to accomplish?"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none" />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">M</div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Measurable</label>
                    </div>
                    <textarea value={measurable} onChange={(e) => setMeasurable(e.target.value)} rows={2}
                        placeholder="How will you measure progress?"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none" />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white">A</div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Achievable</label>
                    </div>
                    <textarea value={achievable} onChange={(e) => setAchievable(e.target.value)} rows={2}
                        placeholder="Why is this realistic for you?"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none" />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white">R</div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Relevant</label>
                    </div>
                    <textarea value={relevant} onChange={(e) => setRelevant(e.target.value)} rows={2}
                        placeholder="Why does this matter to you?"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none" />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">T</div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time-bound</label>
                    </div>
                    <textarea value={timeBound} onChange={(e) => setTimeBound(e.target.value)} rows={2}
                        placeholder="When will you achieve this?"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none" />
                </div>

                {/* Milestones editor */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Milestones</p>
                    {milestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input type="text" value={m.label} onChange={(e) => updateMilestoneLabel(i, e.target.value)}
                                placeholder={`Milestone ${i + 1}`}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                            <button onClick={() => removeMilestone(i)} className="p-1.5 text-slate-400 hover:text-red-500 transition text-xs">✕</button>
                        </div>
                    ))}
                    <button onClick={addMilestone}
                        className="w-full px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-500 hover:border-emerald-400 hover:text-emerald-500 transition">
                        + Add Milestone
                    </button>
                </div>
            </div>
        </CalculatorLayout>
    );
}
