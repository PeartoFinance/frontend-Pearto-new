'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Baby, Calendar, Heart } from 'lucide-react';

export default function PregnancyDueDateCalculator() {
    const [lmpDate, setLmpDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 2);
        return date.toISOString().split('T')[0];
    });

    const result = useMemo(() => {
        const lmp = new Date(lmpDate);
        const dueDate = new Date(lmp);
        dueDate.setDate(dueDate.getDate() + 280); // 40 weeks

        const today = new Date();
        const daysPregnant = Math.floor((today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
        const weeksPregnant = Math.floor(daysPregnant / 7);
        const daysRemaining = Math.floor(daysPregnant % 7);
        const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Trimester
        let trimester = 1;
        if (weeksPregnant >= 13 && weeksPregnant < 27) trimester = 2;
        if (weeksPregnant >= 27) trimester = 3;

        // Conception date estimate
        const conceptionDate = new Date(lmp);
        conceptionDate.setDate(conceptionDate.getDate() + 14);

        return {
            dueDate: dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            weeksPregnant: Math.max(0, weeksPregnant),
            daysRemaining: Math.max(0, daysRemaining),
            daysUntilDue: Math.max(0, daysUntilDue),
            trimester,
            conceptionDate: conceptionDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            progress: Math.min(100, (daysPregnant / 280) * 100)
        };
    }, [lmpDate]);

    return (
        <CalculatorLayout
            title="Pregnancy Due Date"
            description="Calculate your estimated due date and pregnancy progress"
            category="Health & Fitness"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex justify-center mb-2">
                            <Baby className="w-8 h-8 text-pink-500" />
                        </div>
                        <p className="text-sm text-slate-500 mb-1">Estimated Due Date</p>
                        <p className="text-3xl font-bold text-emerald-600">{result.dueDate}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-3xl font-bold text-pink-600">{result.weeksPregnant}</p>
                            <p className="text-xs text-slate-500">Weeks Pregnant</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-3xl font-bold text-purple-600">{result.daysUntilDue}</p>
                            <p className="text-xs text-slate-500">Days Until Due</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-medium text-emerald-600">Trimester {result.trimester}</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all" style={{ width: `${result.progress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Week 1</span>
                            <span>Week 40</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Day of Last Menstrual Period (LMP)</label>
                <input type="date" value={lmpDate} onChange={(e) => setLmpDate(e.target.value)} max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                <p className="text-sm text-pink-700 dark:text-pink-400">
                    <strong>Note:</strong> This is an estimate based on a 28-day cycle. Actual due date may vary. Consult your healthcare provider for accurate dates.
                </p>
            </div>
        </CalculatorLayout>
    );
}
