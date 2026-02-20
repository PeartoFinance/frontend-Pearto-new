'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CalendarDays, Plus, Trash2, Clock, ArrowRight } from 'lucide-react';

interface ProjectTask {
    id: string;
    name: string;
    duration: number; // days
    dependency: string | null; // id of task it depends on
}

export default function ProjectTimeline() {
    const { formatPrice } = useCurrency();
    const [tasks, setTasks] = useState<ProjectTask[]>([
        { id: '1', name: 'Research & Planning', duration: 5, dependency: null },
        { id: '2', name: 'Design Mockups', duration: 7, dependency: '1' },
        { id: '3', name: 'Frontend Development', duration: 14, dependency: '2' },
        { id: '4', name: 'Backend API', duration: 10, dependency: '1' },
        { id: '5', name: 'Integration & Testing', duration: 5, dependency: '3' },
        { id: '6', name: 'Deployment', duration: 2, dependency: '5' },
    ]);
    const [newName, setNewName] = useState('');
    const [newDuration, setNewDuration] = useState(5);
    const [newDep, setNewDep] = useState<string>('');

    const addTask = () => {
        if (!newName.trim()) return;
        setTasks(prev => [...prev, {
            id: Date.now().toString(),
            name: newName.trim(),
            duration: newDuration,
            dependency: newDep || null,
        }]);
        setNewName('');
        setNewDuration(5);
        setNewDep('');
    };

    const removeTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id).map(t =>
            t.dependency === id ? { ...t, dependency: null } : t
        ));
    };

    // Calculate start/end for each task
    const timeline = useMemo(() => {
        const taskMap = new Map<string, ProjectTask>();
        tasks.forEach(t => taskMap.set(t.id, t));

        const starts = new Map<string, number>();

        const getStart = (id: string): number => {
            if (starts.has(id)) return starts.get(id)!;
            const task = taskMap.get(id);
            if (!task) return 0;
            if (!task.dependency) {
                starts.set(id, 0);
                return 0;
            }
            const depTask = taskMap.get(task.dependency);
            if (!depTask) {
                starts.set(id, 0);
                return 0;
            }
            const depStart = getStart(task.dependency);
            const start = depStart + depTask.duration;
            starts.set(id, start);
            return start;
        };

        const entries = tasks.map(t => {
            const start = getStart(t.id);
            const end = start + t.duration;
            return { ...t, start, end };
        });

        const totalDuration = entries.length > 0 ? Math.max(...entries.map(e => e.end)) : 0;

        // Critical path estimate
        const criticalPath = entries
            .sort((a, b) => a.start - b.start)
            .filter(t => t.end === totalDuration || t.start === 0);

        return { entries, totalDuration, criticalPath };
    }, [tasks]);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

    return (
        <CalculatorLayout
            title="Project Timeline Generator"
            description="Create a simple Gantt-like timeline with task dependencies"
            category="Project Management"
            insights={[
                { label: 'Total Tasks', value: `${tasks.length}` },
                { label: 'Total Duration', value: `${timeline.totalDuration} days`, color: 'text-blue-600' },
                { label: 'Weeks', value: `${(timeline.totalDuration / 5).toFixed(1)}`, color: 'text-purple-600' },
                { label: 'Parallel Tracks', value: `${new Set(timeline.entries.map(e => e.start)).size}` },
            ]}
            results={
                <div className="space-y-4">
                    {/* Summary */}
                    <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <CalendarDays className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Total Project Duration</p>
                        <p className="text-4xl font-bold text-blue-600">{timeline.totalDuration} days</p>
                        <p className="text-sm text-slate-500 mt-1">{(timeline.totalDuration / 5).toFixed(1)} work weeks · {tasks.length} tasks</p>
                    </div>

                    {/* Gantt Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 overflow-x-auto">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Timeline</p>

                        {/* Day markers */}
                        <div className="flex items-center mb-2 ml-[130px]">
                            {timeline.totalDuration > 0 && Array.from({ length: Math.min(Math.ceil(timeline.totalDuration / 5) + 1, 20) }, (_, i) => (
                                <div key={i} className="text-[9px] text-slate-400" style={{ position: 'absolute', left: `${130 + (i * 5 / timeline.totalDuration) * (100 - 20)}%` }}>
                                    W{i + 1}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {timeline.entries.map((t, i) => {
                                const leftPct = timeline.totalDuration > 0 ? (t.start / timeline.totalDuration) * 100 : 0;
                                const widthPct = timeline.totalDuration > 0 ? (t.duration / timeline.totalDuration) * 100 : 100;
                                const color = colors[i % colors.length];
                                return (
                                    <div key={t.id} className="flex items-center gap-2">
                                        <div className="w-[120px] flex-shrink-0 text-right pr-2">
                                            <span className="text-xs text-slate-600 dark:text-slate-400 truncate block">{t.name}</span>
                                            <span className="text-[10px] text-slate-400">{t.duration}d</span>
                                        </div>
                                        <div className="flex-1 relative h-7 bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden">
                                            <div
                                                className="absolute top-0.5 bottom-0.5 rounded-md flex items-center justify-center transition-all"
                                                style={{
                                                    left: `${leftPct}%`,
                                                    width: `${Math.max(widthPct, 3)}%`,
                                                    backgroundColor: color,
                                                }}
                                            >
                                                <span className="text-[9px] text-white font-medium truncate px-1">
                                                    D{t.start + 1}–D{t.end}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Day scale */}
                        <div className="flex items-center gap-0 mt-2 ml-[130px]">
                            <div className="flex-1 flex justify-between text-[9px] text-slate-400">
                                <span>Day 1</span>
                                {timeline.totalDuration > 10 && <span>Day {Math.floor(timeline.totalDuration / 2)}</span>}
                                <span>Day {timeline.totalDuration}</span>
                            </div>
                        </div>
                    </div>

                    {/* Task details */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Task Details</p>
                        <div className="space-y-2">
                            {timeline.entries.map((t, i) => (
                                <div key={t.id} className="flex items-center gap-3 text-sm">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                                    <span className="text-slate-700 dark:text-slate-300 flex-1 truncate">{t.name}</span>
                                    <span className="text-[10px] text-slate-400">D{t.start + 1}–D{t.end}</span>
                                    <span className="text-xs font-semibold text-slate-500">{t.duration}d</span>
                                    {t.dependency && (
                                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                            <ArrowRight size={8} />
                                            {tasks.find(x => x.id === t.dependency)?.name?.slice(0, 10)}...
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Task Name</label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        placeholder="Task name..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Duration (days)</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{newDuration}d</span>
                    </div>
                    <input type="number" value={newDuration} onChange={(e) => setNewDuration(Math.max(1, Number(e.target.value)))} min={1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={1} max={30} value={newDuration}
                        onChange={(e) => setNewDuration(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Depends On</label>
                    <select value={newDep} onChange={(e) => setNewDep(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        <option value="">None (starts immediately)</option>
                        {tasks.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <button onClick={addTask}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition">
                    <Plus size={14} />
                    Add Task
                </button>

                {/* Task list */}
                <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tasks ({tasks.length})</p>
                    {tasks.map((t, i) => (
                        <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                                <div className="min-w-0">
                                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate block">{t.name}</span>
                                    <span className="text-[10px] text-slate-400">{t.duration}d{t.dependency ? ` · after ${tasks.find(x => x.id === t.dependency)?.name?.slice(0, 15)}` : ''}</span>
                                </div>
                            </div>
                            <button onClick={() => removeTask(t.id)} className="p-1 text-slate-400 hover:text-red-500 transition ml-2">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
