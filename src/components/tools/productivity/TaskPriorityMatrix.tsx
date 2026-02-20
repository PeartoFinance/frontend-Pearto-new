'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Grid3X3, Plus, Trash2, AlertTriangle, Calendar, UserCheck, XCircle } from 'lucide-react';

interface Task {
    id: string;
    name: string;
    urgency: number;
    importance: number;
}

function getQuadrant(urgency: number, importance: number): { label: string; action: string; color: string; bg: string } {
    if (urgency >= 3 && importance >= 3) return { label: 'Do First', action: 'Do it now', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' };
    if (urgency < 3 && importance >= 3) return { label: 'Schedule', action: 'Plan it', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' };
    if (urgency >= 3 && importance < 3) return { label: 'Delegate', action: 'Hand it off', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' };
    return { label: 'Eliminate', action: 'Drop it', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' };
}

export default function TaskPriorityMatrix() {
    const { formatPrice } = useCurrency();
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', name: 'Client deadline project', urgency: 5, importance: 5 },
        { id: '2', name: 'Learn new framework', urgency: 1, importance: 4 },
        { id: '3', name: 'Reply to emails', urgency: 4, importance: 2 },
        { id: '4', name: 'Organize desk', urgency: 1, importance: 1 },
        { id: '5', name: 'Team meeting prep', urgency: 4, importance: 4 },
    ]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newUrgency, setNewUrgency] = useState(3);
    const [newImportance, setNewImportance] = useState(3);

    const addTask = () => {
        if (!newTaskName.trim()) return;
        setTasks(prev => [...prev, {
            id: Date.now().toString(),
            name: newTaskName.trim(),
            urgency: newUrgency,
            importance: newImportance,
        }]);
        setNewTaskName('');
    };

    const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

    const quadrants = useMemo(() => {
        const doFirst = tasks.filter(t => t.urgency >= 3 && t.importance >= 3);
        const schedule = tasks.filter(t => t.urgency < 3 && t.importance >= 3);
        const delegate = tasks.filter(t => t.urgency >= 3 && t.importance < 3);
        const eliminate = tasks.filter(t => t.urgency < 3 && t.importance < 3);
        return { doFirst, schedule, delegate, eliminate };
    }, [tasks]);

    const quadrantData = [
        { key: 'doFirst', label: 'Do First', subtitle: 'Urgent & Important', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', tasks: quadrants.doFirst },
        { key: 'schedule', label: 'Schedule', subtitle: 'Not Urgent & Important', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', tasks: quadrants.schedule },
        { key: 'delegate', label: 'Delegate', subtitle: 'Urgent & Not Important', icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', tasks: quadrants.delegate },
        { key: 'eliminate', label: 'Eliminate', subtitle: 'Not Urgent & Not Important', icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/50', border: 'border-slate-200 dark:border-slate-700', tasks: quadrants.eliminate },
    ];

    return (
        <CalculatorLayout
            title="Task Priority Matrix"
            description="Organize tasks using the Eisenhower Matrix — focus on what truly matters"
            category="Productivity"
            insights={[
                { label: 'Total Tasks', value: `${tasks.length}` },
                { label: 'Do First', value: `${quadrants.doFirst.length}`, color: 'text-red-600' },
                { label: 'Schedule', value: `${quadrants.schedule.length}`, color: 'text-blue-600' },
                { label: 'Delegate', value: `${quadrants.delegate.length}`, color: 'text-amber-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Eisenhower Matrix Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {quadrantData.map(q => (
                            <div key={q.key} className={`p-4 rounded-xl border ${q.bg} ${q.border}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <q.icon size={14} className={q.color} />
                                    <p className={`text-sm font-semibold ${q.color}`}>{q.label}</p>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-2">{q.subtitle}</p>
                                {q.tasks.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No tasks</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {q.tasks.map(t => (
                                            <li key={t.id} className="flex items-center justify-between">
                                                <span className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1 mr-2">{t.name}</span>
                                                <span className="text-[10px] text-slate-400">{t.urgency}/{t.importance}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Axis labels */}
                    <div className="flex items-center justify-center gap-6 text-[10px] text-slate-400">
                        <span>← Not Urgent</span>
                        <span className="font-semibold text-slate-500">URGENCY →</span>
                        <span>↑ Important</span>
                    </div>

                    {/* Visual scatter plot */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Task Map</p>
                        <div className="relative w-full aspect-square max-w-[280px] mx-auto">
                            {/* Grid lines */}
                            <div className="absolute inset-0 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                                <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200 dark:bg-slate-700" />
                            </div>
                            {/* Quadrant labels */}
                            <span className="absolute top-1 right-2 text-[8px] text-red-400 font-bold">DO FIRST</span>
                            <span className="absolute top-1 left-2 text-[8px] text-blue-400 font-bold">SCHEDULE</span>
                            <span className="absolute bottom-1 right-2 text-[8px] text-amber-400 font-bold">DELEGATE</span>
                            <span className="absolute bottom-1 left-2 text-[8px] text-slate-400 font-bold">ELIMINATE</span>
                            {/* Axis labels */}
                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-400">Urgency →</span>
                            <span className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] text-slate-400">Importance →</span>
                            {/* Task dots */}
                            {tasks.map(t => {
                                const x = ((t.urgency - 1) / 4) * 90 + 5;
                                const y = (1 - (t.importance - 1) / 4) * 90 + 5;
                                const q = getQuadrant(t.urgency, t.importance);
                                return (
                                    <div key={t.id}
                                        className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 group"
                                        style={{ left: `${x}%`, top: `${y}%` }}>
                                        <div className={`w-full h-full rounded-full border-2 ${q.color} ${q.color.replace('text-', 'bg-').replace('600', '200')} dark:bg-opacity-40 flex items-center justify-center text-[8px] font-bold`}>
                                            {t.name.charAt(0)}
                                        </div>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                                            <div className="px-2 py-1 bg-slate-900 text-white text-[10px] rounded-md whitespace-nowrap">
                                                {t.name}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* All tasks list */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">All Tasks</p>
                        <div className="space-y-1.5">
                            {tasks.map(t => {
                                const q = getQuadrant(t.urgency, t.importance);
                                return (
                                    <div key={t.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${q.bg} ${q.bg.includes('border') ? '' : 'border-slate-100 dark:border-slate-700'}`}>
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className={`text-xs font-bold ${q.color}`}>{q.label}</span>
                                            <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{t.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400">U:{t.urgency} I:{t.importance}</span>
                                            <button onClick={() => removeTask(t.id)} className="p-1 text-slate-400 hover:text-red-500 transition">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Task Name</label>
                    <input type="text" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        placeholder="What needs to be done?"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Urgency</label>
                        <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md">{newUrgency}/5</span>
                    </div>
                    <input type="range" min={1} max={5} value={newUrgency}
                        onChange={(e) => setNewUrgency(Number(e.target.value))} className="w-full accent-red-500" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5"><span>Not urgent</span><span>Very urgent</span></div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Importance</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{newImportance}/5</span>
                    </div>
                    <input type="range" min={1} max={5} value={newImportance}
                        onChange={(e) => setNewImportance(Number(e.target.value))} className="w-full accent-blue-500" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5"><span>Not important</span><span>Very important</span></div>
                </div>

                <button onClick={addTask}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition">
                    <Plus size={14} />
                    Add Task
                </button>

                {/* Task list with remove */}
                <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tasks ({tasks.length})</p>
                    {tasks.map(t => {
                        const q = getQuadrant(t.urgency, t.importance);
                        return (
                            <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                <div className="min-w-0 flex-1">
                                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate block">{t.name}</span>
                                    <span className={`text-[10px] font-medium ${q.color}`}>{q.label}</span>
                                </div>
                                <button onClick={() => removeTask(t.id)} className="p-1 text-slate-400 hover:text-red-500 transition ml-2">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </CalculatorLayout>
    );
}
