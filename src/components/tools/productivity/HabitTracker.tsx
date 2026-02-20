'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CheckSquare, Flame, Plus, Trash2, BarChart3 } from 'lucide-react';

interface Habit {
    id: string;
    name: string;
    frequency: 'daily' | 'weekly';
    completions: boolean[]; // 7 days (Mon-Sun)
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HabitTracker() {
    const { formatPrice } = useCurrency();
    const [habits, setHabits] = useState<Habit[]>([
        { id: '1', name: 'Exercise', frequency: 'daily', completions: [true, true, false, true, false, false, false] },
        { id: '2', name: 'Read 30 min', frequency: 'daily', completions: [true, false, true, true, true, false, false] },
        { id: '3', name: 'Meal prep', frequency: 'weekly', completions: [false, false, false, false, false, true, false] },
    ]);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitFreq, setNewHabitFreq] = useState<'daily' | 'weekly'>('daily');

    const addHabit = () => {
        if (!newHabitName.trim()) return;
        setHabits(prev => [...prev, {
            id: Date.now().toString(),
            name: newHabitName.trim(),
            frequency: newHabitFreq,
            completions: new Array(7).fill(false),
        }]);
        setNewHabitName('');
    };

    const removeHabit = (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
    };

    const toggleDay = (habitId: string, dayIdx: number) => {
        setHabits(prev => prev.map(h => {
            if (h.id !== habitId) return h;
            const newComp = [...h.completions];
            newComp[dayIdx] = !newComp[dayIdx];
            return { ...h, completions: newComp };
        }));
    };

    const stats = useMemo(() => {
        return habits.map(h => {
            const completed = h.completions.filter(Boolean).length;
            const target = h.frequency === 'daily' ? 7 : 1;
            const rate = target > 0 ? (completed / target) * 100 : 0;

            // Streak (consecutive from most recent completed)
            let streak = 0;
            for (let i = h.completions.length - 1; i >= 0; i--) {
                if (h.completions[i]) streak++;
                else if (streak > 0) break;
            }

            return { ...h, completed, target, rate: Math.min(rate, 100), streak };
        });
    }, [habits]);

    const overallRate = useMemo(() => {
        if (stats.length === 0) return 0;
        return stats.reduce((s, h) => s + h.rate, 0) / stats.length;
    }, [stats]);

    // Donut for overall completion
    const segments = [
        { label: 'Completed', value: overallRate, color: '#10b981' },
        { label: 'Remaining', value: 100 - overallRate, color: '#e2e8f0' },
    ];
    const rd = 42, circ = 2 * Math.PI * rd;

    return (
        <CalculatorLayout
            title="Habit Tracker"
            description="Track your daily and weekly habits, build streaks, and stay consistent"
            category="Productivity"
            insights={[
                { label: 'Habits', value: `${habits.length}` },
                { label: 'Overall Rate', value: `${overallRate.toFixed(0)}%`, color: overallRate >= 80 ? 'text-emerald-600' : overallRate >= 50 ? 'text-amber-600' : 'text-red-500' },
                { label: 'Best Streak', value: `${Math.max(0, ...stats.map(s => s.streak))} days`, color: 'text-purple-600' },
                { label: 'Today Done', value: `${stats.filter(s => s.completions[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]).length}/${habits.length}` },
            ]}
            results={
                <div className="space-y-4">
                    {/* Overall completion donut */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={rd} fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
                            <circle cx="50" cy="50" r={rd} fill="none" stroke="#10b981" strokeWidth="8"
                                strokeDasharray={`${(overallRate / 100) * circ} ${circ - (overallRate / 100) * circ}`}
                                strokeLinecap="round" transform="rotate(-90 50 50)" />
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[12px] font-bold">
                                {overallRate.toFixed(0)}%
                            </text>
                            <text x="50" y="60" textAnchor="middle" className="fill-slate-500 text-[7px]">complete</text>
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Weekly Progress</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.filter(s => s.rate >= 100).length} of {habits.length} habits on track
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <p className="text-lg font-bold text-emerald-600">{stats.reduce((s, h) => s + h.completed, 0)}</p>
                                    <p className="text-[10px] text-slate-500">Check-ins</p>
                                </div>
                                <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <p className="text-lg font-bold text-purple-600">{Math.max(0, ...stats.map(s => s.streak))}</p>
                                    <p className="text-[10px] text-slate-500">Best Streak</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Habit grid */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Habit Grid</p>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left text-xs text-slate-500 pb-2 pr-3">Habit</th>
                                        {DAYS.map(d => (
                                            <th key={d} className="text-center text-[10px] text-slate-500 pb-2 w-8">{d}</th>
                                        ))}
                                        <th className="text-center text-[10px] text-slate-500 pb-2 w-12">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.map(h => (
                                        <tr key={h.id} className="border-t border-slate-100 dark:border-slate-700">
                                            <td className="py-2 pr-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{h.name}</span>
                                                    {h.streak >= 3 && <Flame size={12} className="text-orange-500" />}
                                                </div>
                                                <span className="text-[10px] text-slate-400">{h.frequency}</span>
                                            </td>
                                            {h.completions.map((done, di) => (
                                                <td key={di} className="text-center py-2">
                                                    <button
                                                        onClick={() => toggleDay(h.id, di)}
                                                        className={`w-6 h-6 rounded-md border transition-all text-[10px] ${done
                                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                                            : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300 text-slate-300'
                                                        }`}>
                                                        {done ? '✓' : ''}
                                                    </button>
                                                </td>
                                            ))}
                                            <td className="text-center py-2">
                                                <span className={`text-xs font-bold ${h.rate >= 100 ? 'text-emerald-600' : h.rate >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                                    {h.rate.toFixed(0)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Per-habit streaks */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Streaks & Progress</p>
                        <div className="space-y-2">
                            {stats.map(h => (
                                <div key={h.id} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-600 dark:text-slate-400 w-24 truncate">{h.name}</span>
                                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${h.rate >= 100 ? 'bg-emerald-500' : h.rate >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                                            style={{ width: `${h.rate}%` }} />
                                    </div>
                                    <div className="flex items-center gap-1 w-16">
                                        <Flame size={10} className={h.streak >= 1 ? 'text-orange-500' : 'text-slate-300'} />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{h.streak}d</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Add new habit */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Habit</label>
                    <input type="text" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                        placeholder="Habit name..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                        {(['daily', 'weekly'] as const).map(f => (
                            <button key={f} onClick={() => setNewHabitFreq(f)}
                                className={`px-3 py-2 rounded-lg border text-xs transition-all capitalize ${newHabitFreq === f
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                                }`}>
                                {f}
                            </button>
                        ))}
                    </div>
                    <button onClick={addHabit}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition">
                        <Plus size={14} />
                        Add Habit
                    </button>
                </div>

                {/* Habit list */}
                <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Habits</p>
                    {habits.length === 0 && (
                        <p className="text-xs text-slate-400 py-2">No habits yet. Add one above!</p>
                    )}
                    {habits.map(h => (
                        <div key={h.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{h.name}</span>
                                <span className="ml-2 text-[10px] text-slate-400 capitalize">{h.frequency}</span>
                            </div>
                            <button onClick={() => removeHabit(h.id)} className="p-1 text-slate-400 hover:text-red-500 transition">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
