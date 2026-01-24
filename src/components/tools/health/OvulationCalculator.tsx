'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Baby, Calendar, Heart } from 'lucide-react';

export default function OvulationCalculator() {
    const [lastPeriodDate, setLastPeriodDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 14);
        return d.toISOString().split('T')[0];
    });
    const [cycleLength, setCycleLength] = useState(28);

    const results = useMemo(() => {
        const lastPeriod = new Date(lastPeriodDate);

        // Ovulation typically occurs 14 days before next period
        const ovulationDay = new Date(lastPeriod);
        ovulationDay.setDate(ovulationDay.getDate() + cycleLength - 14);

        // Fertile window: 5 days before ovulation + ovulation day + 1 day after
        const fertileStart = new Date(ovulationDay);
        fertileStart.setDate(fertileStart.getDate() - 5);

        const fertileEnd = new Date(ovulationDay);
        fertileEnd.setDate(fertileEnd.getDate() + 1);

        // Next period
        const nextPeriod = new Date(lastPeriod);
        nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

        // Days until
        const today = new Date();
        const daysUntilOvulation = Math.ceil((ovulationDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const daysUntilPeriod = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return {
            ovulationDay,
            fertileStart,
            fertileEnd,
            nextPeriod,
            daysUntilOvulation,
            daysUntilPeriod,
            formatDate
        };
    }, [lastPeriodDate, cycleLength]);

    return (
        <CalculatorLayout
            title="Ovulation Calculator"
            description="Calculate your fertile window and ovulation date"
            category="Health & Medical"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl">
                        <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Estimated Ovulation</p>
                        <p className="text-3xl font-bold text-pink-600">
                            {results.formatDate(results.ovulationDay)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {results.daysUntilOvulation > 0
                                ? `In ${results.daysUntilOvulation} days`
                                : results.daysUntilOvulation === 0
                                    ? 'Today!'
                                    : `${Math.abs(results.daysUntilOvulation)} days ago`
                            }
                        </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Baby className="w-5 h-5 text-emerald-500" />
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Fertile Window
                            </p>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <span className="text-sm text-emerald-700 dark:text-emerald-400">
                                {results.formatDate(results.fertileStart)}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span className="text-sm text-emerald-700 dark:text-emerald-400">
                                {results.formatDate(results.fertileEnd)}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            7 most fertile days
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                            <p className="text-xs text-slate-500">Next Period</p>
                            <p className="text-lg font-bold text-blue-600">
                                {results.formatDate(results.nextPeriod)}
                            </p>
                            <p className="text-xs text-slate-400">
                                {results.daysUntilPeriod > 0 ? `In ${results.daysUntilPeriod} days` : 'Overdue'}
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500">Cycle Length</p>
                            <p className="text-lg font-bold text-purple-600">{cycleLength} days</p>
                            <p className="text-xs text-slate-400">Average: 28 days</p>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            <strong>Note:</strong> This calculator provides estimates based on a typical cycle.
                            Actual ovulation can vary. Consult a healthcare provider for personalized advice.
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        First Day of Last Period
                    </label>
                    <input
                        type="date"
                        value={lastPeriodDate}
                        onChange={(e) => setLastPeriodDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Average Cycle Length: {cycleLength} days
                    </label>
                    <input
                        type="range"
                        min={21}
                        max={35}
                        value={cycleLength}
                        onChange={(e) => setCycleLength(Number(e.target.value))}
                        className="w-full accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>21</span>
                        <span>28 (typical)</span>
                        <span>35</span>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2">How It Works:</p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                        <li>Ovulation occurs ~14 days before your next period</li>
                        <li>The fertile window is 5 days before + 1 day after ovulation</li>
                        <li>Sperm can survive 3-5 days in the body</li>
                    </ul>
                </div>
            </div>
        </CalculatorLayout>
    );
}
