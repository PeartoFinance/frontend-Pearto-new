'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Timer, Play, Pause, RotateCcw, Plus, Trash2, Bell, Volume2 } from 'lucide-react';

interface TimerItem {
    id: string;
    name: string;
    hours: number;
    minutes: number;
    seconds: number;
    remaining: number; // in seconds
    running: boolean;
    done: boolean;
}

function uid() {
    return Math.random().toString(36).slice(2, 10);
}

function formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CookingTimer() {
    const [timers, setTimers] = useState<TimerItem[]>([
        { id: uid(), name: 'Pasta', hours: 0, minutes: 10, seconds: 0, remaining: 600, running: false, done: false },
        { id: uid(), name: 'Sauce', hours: 0, minutes: 25, seconds: 0, remaining: 1500, running: false, done: false },
    ]);
    const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const clearTimerInterval = useCallback((id: string) => {
        const interval = intervalsRef.current.get(id);
        if (interval) {
            clearInterval(interval);
            intervalsRef.current.delete(id);
        }
    }, []);

    useEffect(() => {
        return () => {
            intervalsRef.current.forEach((interval) => clearInterval(interval));
        };
    }, []);

    const startTimer = useCallback((id: string) => {
        clearTimerInterval(id);

        const interval = setInterval(() => {
            setTimers(prev => prev.map(t => {
                if (t.id !== id) return t;
                if (t.remaining <= 1) {
                    clearTimerInterval(id);
                    // Play alert sound via browser API
                    try {
                        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                        const oscillator = audioContext.createOscillator();
                        oscillator.type = 'sine';
                        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                        oscillator.connect(audioContext.destination);
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.5);
                    } catch {
                        // Audio not available
                    }
                    return { ...t, remaining: 0, running: false, done: true };
                }
                return { ...t, remaining: t.remaining - 1 };
            }));
        }, 1000);

        intervalsRef.current.set(id, interval);
        setTimers(prev => prev.map(t => t.id === id ? { ...t, running: true, done: false } : t));
    }, [clearTimerInterval]);

    const pauseTimer = useCallback((id: string) => {
        clearTimerInterval(id);
        setTimers(prev => prev.map(t => t.id === id ? { ...t, running: false } : t));
    }, [clearTimerInterval]);

    const resetTimer = useCallback((id: string) => {
        clearTimerInterval(id);
        setTimers(prev => prev.map(t => {
            if (t.id !== id) return t;
            const total = t.hours * 3600 + t.minutes * 60 + t.seconds;
            return { ...t, remaining: total, running: false, done: false };
        }));
    }, [clearTimerInterval]);

    const addTimer = () => {
        setTimers(prev => [
            ...prev,
            { id: uid(), name: `Timer ${prev.length + 1}`, hours: 0, minutes: 5, seconds: 0, remaining: 300, running: false, done: false },
        ]);
    };

    const removeTimer = (id: string) => {
        clearTimerInterval(id);
        setTimers(prev => prev.filter(t => t.id !== id));
    };

    const updateTimer = (id: string, field: 'name' | 'hours' | 'minutes' | 'seconds', value: string | number) => {
        setTimers(prev => prev.map(t => {
            if (t.id !== id || t.running) return t;
            const updated = { ...t, [field]: value };
            updated.remaining = updated.hours * 3600 + updated.minutes * 60 + updated.seconds;
            updated.done = false;
            return updated;
        }));
    };

    const activeCount = timers.filter(t => t.running).length;
    const doneCount = timers.filter(t => t.done).length;

    return (
        <CalculatorLayout
            title="Cooking Timer"
            description="Multiple named timers for cooking — never overcook again"
            category="Cooking & Recipes"
            insights={[
                { label: 'Timers', value: `${timers.length}` },
                { label: 'Active', value: `${activeCount}`, color: 'text-emerald-600' },
                { label: 'Done', value: `${doneCount}`, color: 'text-amber-600' },
                { label: 'Total Time', value: formatTime(timers.reduce((s, t) => s + t.hours * 3600 + t.minutes * 60 + t.seconds, 0)), color: 'text-blue-600' },
            ]}
            results={
                <div className="space-y-4">
                    <div className="text-center p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                        <Timer className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Cooking Timers</p>
                        <p className="text-4xl font-bold text-emerald-600">{timers.length}</p>
                        <p className="text-sm text-slate-500 mt-1">{activeCount} running &middot; {doneCount} completed</p>
                    </div>

                    {timers.map(timer => {
                        const totalSet = timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
                        const progress = totalSet > 0 ? ((totalSet - timer.remaining) / totalSet) * 100 : 0;

                        return (
                            <div key={timer.id}
                                className={`p-4 rounded-xl border transition ${timer.done
                                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 animate-pulse'
                                    : timer.running
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                                    }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {timer.done && <Bell size={16} className="text-amber-500" />}
                                        {timer.running && <Volume2 size={16} className="text-emerald-500" />}
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">{timer.name}</span>
                                    </div>
                                    {timer.done && (
                                        <span className="text-xs font-bold text-amber-600 animate-pulse">⏰ Done!</span>
                                    )}
                                </div>

                                <div className="text-center mb-3">
                                    <p className={`text-4xl font-mono font-bold ${timer.done ? 'text-amber-600' : timer.running ? 'text-emerald-600' : 'text-slate-700 dark:text-white'}`}>
                                        {formatTime(timer.remaining)}
                                    </p>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-3">
                                    <div
                                        className={`h-1.5 rounded-full transition-all ${timer.done ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${timer.done ? 100 : progress}%` }}
                                    />
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-center gap-2">
                                    {!timer.running && !timer.done && (
                                        <button onClick={() => startTimer(timer.id)}
                                            className="flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition">
                                            <Play size={12} /> Start
                                        </button>
                                    )}
                                    {timer.running && (
                                        <button onClick={() => pauseTimer(timer.id)}
                                            className="flex items-center gap-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition">
                                            <Pause size={12} /> Pause
                                        </button>
                                    )}
                                    <button onClick={() => resetTimer(timer.id)}
                                        className="flex items-center gap-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-300 transition">
                                        <RotateCcw size={12} /> Reset
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Timer Setup</p>

                {timers.map(timer => (
                    <div key={timer.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={timer.name}
                                onChange={e => updateTimer(timer.id, 'name', e.target.value)}
                                disabled={timer.running}
                                placeholder="Timer name"
                                className="flex-1 px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-50"
                            />
                            <button onClick={() => removeTimer(timer.id)} className="text-red-400 hover:text-red-600">
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Hours</label>
                                <input type="number" value={timer.hours} onChange={e => updateTimer(timer.id, 'hours', Math.max(0, Number(e.target.value)))}
                                    disabled={timer.running} min={0} max={23}
                                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center disabled:opacity-50" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Minutes</label>
                                <input type="number" value={timer.minutes} onChange={e => updateTimer(timer.id, 'minutes', Math.max(0, Math.min(59, Number(e.target.value))))}
                                    disabled={timer.running} min={0} max={59}
                                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center disabled:opacity-50" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Seconds</label>
                                <input type="number" value={timer.seconds} onChange={e => updateTimer(timer.id, 'seconds', Math.max(0, Math.min(59, Number(e.target.value))))}
                                    disabled={timer.running} min={0} max={59}
                                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center disabled:opacity-50" />
                            </div>
                        </div>
                    </div>
                ))}

                <button onClick={addTimer}
                    className="w-full py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700 transition flex items-center justify-center gap-1">
                    <Plus size={14} /> Add Timer
                </button>

                {/* Quick presets */}
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Presets</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {[
                            { name: 'Eggs (soft boil)', m: 6 },
                            { name: 'Eggs (hard boil)', m: 12 },
                            { name: 'Pasta', m: 10 },
                            { name: 'Rice', m: 18 },
                            { name: 'Chicken Breast', m: 25 },
                            { name: 'Bake Cookies', m: 12 },
                        ].map(preset => (
                            <button key={preset.name}
                                onClick={() => setTimers(prev => [...prev, {
                                    id: uid(), name: preset.name, hours: 0, minutes: preset.m, seconds: 0,
                                    remaining: preset.m * 60, running: false, done: false,
                                }])}
                                className="text-xs px-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition text-left">
                                {preset.name} <span className="text-slate-400">({preset.m}m)</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
