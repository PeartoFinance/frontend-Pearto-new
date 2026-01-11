'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Moon, Sun, Clock } from 'lucide-react';

export default function SleepCalculator() {
    const [mode, setMode] = useState<'wakeUp' | 'bedTime'>('wakeUp');
    const [targetTime, setTargetTime] = useState('07:00');

    const result = useMemo(() => {
        const [hours, mins] = targetTime.split(':').map(Number);
        const cycleTime = 90; // Sleep cycle in minutes
        const fallAsleepTime = 15; // Time to fall asleep

        const results: string[] = [];

        if (mode === 'wakeUp') {
            // Calculate when to go to bed
            for (let cycles = 6; cycles >= 4; cycles--) {
                const totalMins = cycles * cycleTime + fallAsleepTime;
                const bedTime = new Date();
                bedTime.setHours(hours, mins, 0, 0);
                bedTime.setMinutes(bedTime.getMinutes() - totalMins);
                results.push(`${bedTime.getHours().toString().padStart(2, '0')}:${bedTime.getMinutes().toString().padStart(2, '0')}`);
            }
        } else {
            // Calculate when to wake up
            for (let cycles = 4; cycles <= 6; cycles++) {
                const totalMins = cycles * cycleTime + fallAsleepTime;
                const wakeTime = new Date();
                wakeTime.setHours(hours, mins, 0, 0);
                wakeTime.setMinutes(wakeTime.getMinutes() + totalMins);
                results.push(`${wakeTime.getHours().toString().padStart(2, '0')}:${wakeTime.getMinutes().toString().padStart(2, '0')}`);
            }
        }

        return { times: results.reverse(), mode };
    }, [targetTime, mode]);

    return (
        <CalculatorLayout
            title="Sleep Calculator"
            description="Calculate optimal sleep/wake times based on sleep cycles"
            category="Health & Fitness"
            results={
                <div className="space-y-6">
                    <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-2">
                            {mode === 'wakeUp' ? 'To wake up at ' : 'If you sleep at '}
                            <span className="font-bold text-emerald-600">{targetTime}</span>
                            {mode === 'wakeUp' ? ', go to bed at:' : ', wake up at:'}
                        </p>
                    </div>
                    <div className="space-y-3">
                        {result.times.map((time, idx) => (
                            <div key={idx} className={`p-4 rounded-xl ${idx === 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200' : 'bg-white dark:bg-slate-800'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {mode === 'wakeUp' ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{time}</span>
                                    </div>
                                    <span className={`text-sm px-2 py-0.5 rounded ${idx === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                                        {6 - idx} cycles ({(6 - idx) * 1.5}hrs)
                                    </span>
                                </div>
                                {idx === 0 && <p className="text-xs text-emerald-600 mt-1">Recommended ⭐</p>}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-sm text-slate-600 dark:text-slate-400">
                        💡 A sleep cycle lasts ~90 minutes. Waking between cycles helps you feel refreshed.
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I want to calculate...</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setMode('wakeUp')} className={`py-3 px-4 rounded-lg font-medium text-sm ${mode === 'wakeUp' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        When to Sleep
                    </button>
                    <button onClick={() => setMode('bedTime')} className={`py-3 px-4 rounded-lg font-medium text-sm ${mode === 'bedTime' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        When to Wake
                    </button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {mode === 'wakeUp' ? 'I want to wake up at:' : 'I plan to go to bed at:'}
                </label>
                <input type="time" value={targetTime} onChange={(e) => setTargetTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
