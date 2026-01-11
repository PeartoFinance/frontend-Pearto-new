'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Timer, Calculator, Clock } from 'lucide-react';

export default function DateDifferenceCalculator() {
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    const result = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(totalDays / 7);
        const months = Math.floor(totalDays / 30.44);
        const years = Math.floor(totalDays / 365.25);

        // Detailed breakdown
        let tempDate = new Date(start);
        let yrs = 0, mths = 0, dys = 0;

        while (tempDate.getFullYear() < end.getFullYear() ||
            (tempDate.getFullYear() === end.getFullYear() && tempDate.getMonth() < end.getMonth())) {
            if (tempDate.getFullYear() < end.getFullYear()) {
                yrs++;
                tempDate.setFullYear(tempDate.getFullYear() + 1);
            } else {
                mths++;
                tempDate.setMonth(tempDate.getMonth() + 1);
            }
        }
        dys = Math.abs(end.getDate() - tempDate.getDate());

        const hours = totalDays * 24;
        const minutes = hours * 60;

        return {
            totalDays,
            weeks,
            months,
            years,
            detailedYears: yrs,
            detailedMonths: mths % 12,
            detailedDays: dys,
            hours,
            minutes
        };
    }, [startDate, endDate]);

    return (
        <CalculatorLayout
            title="Date Difference Calculator"
            description="Calculate the difference between two dates"
            category="Utilities"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Difference</p>
                        <p className="text-3xl font-bold text-emerald-600">
                            {result.detailedYears}y {result.detailedMonths}m {result.detailedDays}d
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-2xl font-bold text-blue-600">{result.totalDays.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Total Days</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-2xl font-bold text-purple-600">{result.weeks.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Weeks</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Hours</span>
                            <span className="font-medium">{result.hours.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Minutes</span>
                            <span className="font-medium">{result.minutes.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
