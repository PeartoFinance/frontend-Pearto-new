'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ShieldCheck, Target, TrendingUp, AlertTriangle, User } from 'lucide-react';

interface QuizQuestion {
    id: string;
    label: string;
    options: { text: string; score: number }[];
}

const QUESTIONS: QuizQuestion[] = [
    {
        id: 'age',
        label: 'What is your age range?',
        options: [
            { text: '18–25', score: 5 },
            { text: '26–35', score: 4 },
            { text: '36–45', score: 3 },
            { text: '46–55', score: 2 },
            { text: '56+', score: 1 },
        ],
    },
    {
        id: 'horizon',
        label: 'What is your investment horizon?',
        options: [
            { text: 'Less than 1 year', score: 1 },
            { text: '1–3 years', score: 2 },
            { text: '3–7 years', score: 3 },
            { text: '7–15 years', score: 4 },
            { text: '15+ years', score: 5 },
        ],
    },
    {
        id: 'loss',
        label: 'If your portfolio lost 20% in a month, you would:',
        options: [
            { text: 'Sell everything immediately', score: 1 },
            { text: 'Sell some to reduce risk', score: 2 },
            { text: 'Hold and wait for recovery', score: 3 },
            { text: 'Buy more at lower prices', score: 4 },
            { text: 'Aggressively buy the dip', score: 5 },
        ],
    },
    {
        id: 'income',
        label: 'How stable is your income?',
        options: [
            { text: 'Very unstable / irregular', score: 1 },
            { text: 'Somewhat unstable', score: 2 },
            { text: 'Moderately stable', score: 3 },
            { text: 'Stable with some variable', score: 4 },
            { text: 'Very stable / guaranteed', score: 5 },
        ],
    },
    {
        id: 'experience',
        label: 'What is your investment experience?',
        options: [
            { text: 'No experience', score: 1 },
            { text: 'Beginner (< 1 year)', score: 2 },
            { text: 'Intermediate (1–5 years)', score: 3 },
            { text: 'Advanced (5–10 years)', score: 4 },
            { text: 'Expert (10+ years)', score: 5 },
        ],
    },
];

function getProfile(score: number): { label: string; color: string; bgGradient: string; description: string } {
    if (score >= 20) return { label: 'Aggressive', color: 'text-rose-600', bgGradient: 'from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 border-rose-200/60 dark:border-rose-800/40', description: 'You have a high risk tolerance with a long time horizon. Growth-oriented investments suit your profile.' };
    if (score >= 15) return { label: 'Moderately Aggressive', color: 'text-orange-600', bgGradient: 'from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-orange-200/60 dark:border-orange-800/40', description: 'You can handle significant volatility in pursuit of above-average returns.' };
    if (score >= 12) return { label: 'Moderate', color: 'text-blue-600', bgGradient: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200/60 dark:border-blue-800/40', description: 'You seek a balance between growth and stability with moderate risk tolerance.' };
    if (score >= 8) return { label: 'Moderately Conservative', color: 'text-sky-600', bgGradient: 'from-sky-50 to-sky-100/50 dark:from-sky-900/20 dark:to-sky-800/10 border-sky-200/60 dark:border-sky-800/40', description: 'You prioritize capital preservation with some growth potential.' };
    return { label: 'Conservative', color: 'text-emerald-600', bgGradient: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-emerald-200/60 dark:border-emerald-800/40', description: 'You strongly prefer capital preservation and minimal volatility.' };
}

function getAllocation(score: number): { stocks: number; bonds: number; cash: number; alternatives: number } {
    if (score >= 20) return { stocks: 80, bonds: 10, cash: 5, alternatives: 5 };
    if (score >= 15) return { stocks: 65, bonds: 20, cash: 5, alternatives: 10 };
    if (score >= 12) return { stocks: 50, bonds: 30, cash: 10, alternatives: 10 };
    if (score >= 8) return { stocks: 30, bonds: 45, cash: 20, alternatives: 5 };
    return { stocks: 15, bonds: 50, cash: 30, alternatives: 5 };
}

export default function RiskLevelAssessment() {
    const { formatPrice } = useCurrency();
    const [answers, setAnswers] = useState<Record<string, number>>({});

    const result = useMemo(() => {
        const totalScore = Object.values(answers).reduce((s, v) => s + v, 0);
        const maxScore = QUESTIONS.length * 5;
        const profile = getProfile(totalScore);
        const allocation = getAllocation(totalScore);
        const completeness = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);
        return { totalScore, maxScore, profile, allocation, completeness };
    }, [answers]);

    const allAnswered = Object.keys(answers).length === QUESTIONS.length;

    // Donut chart for allocation
    const alloc = result.allocation;
    const segments = [
        { label: 'Stocks', value: alloc.stocks, color: '#3b82f6' },
        { label: 'Bonds', value: alloc.bonds, color: '#10b981' },
        { label: 'Cash', value: alloc.cash, color: '#f59e0b' },
        { label: 'Alternatives', value: alloc.alternatives, color: '#8b5cf6' },
    ];
    const r = 42, circ = 2 * Math.PI * r;
    let cumulativeOffset = 0;

    return (
        <CalculatorLayout
            title="Risk Level Assessment"
            description="Discover your investor risk profile and get personalized asset allocation recommendations"
            category="Investing"
            insights={[
                { label: 'Risk Profile', value: allAnswered ? result.profile.label : 'Incomplete', color: allAnswered ? result.profile.color : undefined },
                { label: 'Score', value: `${result.totalScore}/${result.maxScore}` },
                { label: 'Stocks', value: `${alloc.stocks}%`, color: 'text-blue-600' },
                { label: 'Bonds', value: `${alloc.bonds}%`, color: 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-6">
                    {!allAnswered ? (
                        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30 border border-slate-200/60 dark:border-slate-700/40">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Completion</p>
                            <p className="text-4xl font-bold text-slate-600 dark:text-slate-300">{result.completeness}%</p>
                            <p className="text-xs text-slate-500 mt-2">Answer all {QUESTIONS.length} questions to get your risk profile</p>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${result.completeness}%` }} />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Profile verdict */}
                            <div className={`text-center p-6 rounded-xl bg-gradient-to-br ${result.profile.bgGradient} border`}>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Your Risk Profile</p>
                                <p className={`text-3xl font-bold ${result.profile.color}`}>{result.profile.label}</p>
                                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">{result.profile.description}</p>
                            </div>

                            {/* Donut */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                                <svg width="110" height="110" viewBox="0 0 100 100" className="flex-shrink-0">
                                    <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                                    {segments.map((seg, i) => {
                                        const segLen = (seg.value / 100) * circ;
                                        const dashOffset = circ - segLen;
                                        const rotation = -90 + (cumulativeOffset / 100) * 360;
                                        cumulativeOffset += seg.value;
                                        return (
                                            <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="8" strokeDasharray={`${segLen} ${circ - segLen}`} strokeLinecap="butt" transform={`rotate(${rotation} 50 50)`} />
                                        );
                                    })}
                                    <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[10px] font-bold">{result.totalScore}</text>
                                    <text x="50" y="60" textAnchor="middle" className="fill-slate-500 text-[8px]">/ {result.maxScore}</text>
                                </svg>
                                <div className="space-y-2 flex-1">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recommended Allocation</p>
                                    {segments.map((seg, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                                                <span className="text-xs text-slate-600 dark:text-slate-400">{seg.label}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{seg.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Score breakdown */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Score Breakdown</p>
                                <div className="space-y-2">
                                    {QUESTIONS.map(q => {
                                        const score = answers[q.id] ?? 0;
                                        const selected = q.options.find(o => o.score === score);
                                        return (
                                            <div key={q.id} className="flex items-center justify-between text-xs">
                                                <span className="text-slate-600 dark:text-slate-400 truncate flex-1 mr-2">{q.label.replace('What is your ', '').replace('If your portfolio lost 20% in a month, you would:', 'Loss Reaction').replace('How stable is your income?', 'Income Stability')}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500 truncate max-w-[80px]">{selected?.text}</span>
                                                    <span className="font-bold text-slate-900 dark:text-white w-5 text-right">{score}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            }
        >
            {QUESTIONS.map((q, qIdx) => (
                <div key={q.id} className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{q.label}</label>
                        {answers[q.id] !== undefined && (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{answers[q.id]}/5</span>
                        )}
                    </div>
                    <div className="grid gap-1.5">
                        {q.options.map((opt, oIdx) => (
                            <button
                                key={oIdx}
                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.score }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                                    answers[q.id] === opt.score
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                {opt.text}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </CalculatorLayout>
    );
}
