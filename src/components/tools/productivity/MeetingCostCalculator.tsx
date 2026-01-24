'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Calendar, DollarSign, Calculator, TrendingUp } from 'lucide-react';

export default function MeetingCostCalculator() {
    const [attendees, setAttendees] = useState(5);
    const [avgSalary, setAvgSalary] = useState(75000);
    const [durationHours, setDurationHours] = useState(1);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [meetingsPerWeek, setMeetingsPerWeek] = useState(3);

    const results = useMemo(() => {
        const totalDurationHours = durationHours + durationMinutes / 60;
        const hourlyRate = avgSalary / 2080; // 52 weeks × 40 hours
        const meetingCost = attendees * hourlyRate * totalDurationHours;
        const weeklyCost = meetingCost * meetingsPerWeek;
        const monthlyCost = weeklyCost * 4.33;
        const yearlyCost = weeklyCost * 52;

        // Time calculations
        const weeklyHours = totalDurationHours * meetingsPerWeek * attendees;
        const yearlyHours = weeklyHours * 52;

        return {
            meetingCost,
            weeklyCost,
            monthlyCost,
            yearlyCost,
            hourlyRate,
            totalDurationHours,
            weeklyHours,
            yearlyHours,
            yearlyDays: yearlyHours / 8
        };
    }, [attendees, avgSalary, durationHours, durationMinutes, meetingsPerWeek]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

    return (
        <CalculatorLayout
            title="Meeting Cost Calculator"
            description="Calculate the true cost of meetings"
            category="Productivity"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                        <DollarSign className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">This Meeting Costs</p>
                        <p className="text-4xl font-bold text-amber-600">{formatCurrency(results.meetingCost)}</p>
                        <p className="text-sm text-slate-500 mt-1">
                            {results.totalDurationHours}hr × {attendees} people
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Weekly</p>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(results.weeklyCost)}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Monthly</p>
                            <p className="text-lg font-bold text-emerald-600">{formatCurrency(results.monthlyCost)}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Yearly</p>
                            <p className="text-lg font-bold text-red-600">{formatCurrency(results.yearlyCost)}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Time Investment
                        </p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Person-hours/week</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {results.weeklyHours.toFixed(1)} hrs
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Person-hours/year</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {results.yearlyHours.toFixed(0)} hrs
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Equivalent work days/year</span>
                                <span className="font-medium text-amber-600">
                                    {results.yearlyDays.toFixed(0)} days
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-600 dark:text-red-400 mb-1">💡 Could you...</p>
                        <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                            <li>• Make it an email instead?</li>
                            <li>• Reduce attendees by 50%?</li>
                            <li>• Cut the meeting time in half?</li>
                        </ul>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Number of Attendees: {attendees}
                    </label>
                    <input
                        type="range"
                        min={2}
                        max={50}
                        value={attendees}
                        onChange={(e) => setAttendees(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Average Salary ($)
                    </label>
                    <input
                        type="number"
                        value={avgSalary}
                        onChange={(e) => setAvgSalary(Number(e.target.value))}
                        step={5000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                        Hourly: {formatCurrency(results.hourlyRate)}/hr
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Hours
                        </label>
                        <select
                            value={durationHours}
                            onChange={(e) => setDurationHours(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            {[0, 1, 2, 3, 4].map(h => (
                                <option key={h} value={h}>{h}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Minutes
                        </label>
                        <select
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            {[0, 15, 30, 45].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Similar Meetings per Week: {meetingsPerWeek}
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={20}
                        value={meetingsPerWeek}
                        onChange={(e) => setMeetingsPerWeek(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>
            </div>
        </CalculatorLayout>
    );
}
