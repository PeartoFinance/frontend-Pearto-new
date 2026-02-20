'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Clock, DollarSign, Coffee, Calendar } from 'lucide-react';

export default function WorkHoursCalculator() {
    const { formatPrice } = useCurrency();
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:30');
    const [breakMinutes, setBreakMinutes] = useState(30);
    const [hourlyRate, setHourlyRate] = useState(25);
    const [workDaysPerWeek, setWorkDaysPerWeek] = useState(5);

    const result = useMemo(() => {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (totalMinutes < 0) totalMinutes += 24 * 60; // overnight shift
        const netMinutes = Math.max(0, totalMinutes - breakMinutes);
        const hours = netMinutes / 60;
        const dailyEarnings = hours * hourlyRate;
        const weeklyEarnings = dailyEarnings * workDaysPerWeek;
        const monthlyEarnings = weeklyEarnings * 4.33;
        const yearlyEarnings = weeklyEarnings * 52;
        const weeklyHours = hours * workDaysPerWeek;
        const monthlyHours = weeklyHours * 4.33;

        return {
            totalMinutes,
            netMinutes,
            hours: Math.round(hours * 100) / 100,
            dailyEarnings: Math.round(dailyEarnings * 100) / 100,
            weeklyEarnings: Math.round(weeklyEarnings * 100) / 100,
            monthlyEarnings: Math.round(monthlyEarnings),
            yearlyEarnings: Math.round(yearlyEarnings),
            weeklyHours: Math.round(weeklyHours * 100) / 100,
            monthlyHours: Math.round(monthlyHours * 100) / 100,
        };
    }, [startTime, endTime, breakMinutes, hourlyRate, workDaysPerWeek]);

    // Donut: work vs break ratio
    const workPct = result.totalMinutes > 0 ? Math.round((result.netMinutes / result.totalMinutes) * 100) : 100;
    const breakPct = 100 - workPct;
    const r = 42, circ = 2 * Math.PI * r;
    const breakOffset = circ - (breakPct / 100) * circ;

    // Earnings bar chart
    const maxEarning = result.yearlyEarnings || 1;
    const earningBars = [
        { label: 'Daily', value: result.dailyEarnings, color: 'bg-blue-500' },
        { label: 'Weekly', value: result.weeklyEarnings, color: 'bg-emerald-500' },
        { label: 'Monthly', value: result.monthlyEarnings, color: 'bg-violet-500' },
        { label: 'Yearly', value: result.yearlyEarnings, color: 'bg-amber-500' },
    ];

    const formatHoursMinutes = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    return (
        <CalculatorLayout
            title="Work Hours Calculator"
            description="Calculate work hours, daily/weekly/monthly earnings from your schedule and hourly rate"
            category="Income & Employment"
            insights={[
                { label: 'Daily Hours', value: `${result.hours}h`, color: 'text-blue-600' },
                { label: 'Weekly Hours', value: `${result.weeklyHours}h` },
                { label: 'Daily Earnings', value: formatPrice(result.dailyEarnings), color: 'text-emerald-600' },
                { label: 'Annual Earnings', value: formatPrice(result.yearlyEarnings), color: 'text-amber-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Hero card */}
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/60 dark:border-blue-800/40">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Daily Work Hours</p>
                        <p className="text-4xl font-bold text-blue-600">{result.hours}h</p>
                        <p className="text-xs text-slate-500 mt-1">{formatHoursMinutes(result.totalMinutes)} total – {breakMinutes}min break</p>
                    </div>

                    {/* Donut + breakdown */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            <circle cx="50" cy="50" r={r} fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={breakOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-sm font-bold">{workPct}%</text>
                            <text x="50" y="62" textAnchor="middle" className="fill-slate-500 text-[9px]">Work</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs text-slate-600 dark:text-slate-400">Work Time</span></div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatHoursMinutes(result.netMinutes)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs text-slate-600 dark:text-slate-400">Break</span></div>
                                <span className="text-sm font-semibold text-amber-600">{breakMinutes}min</span>
                            </div>
                        </div>
                    </div>

                    {/* Earnings breakdown cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Daily</span>
                            <p className="text-lg font-semibold text-blue-600">{formatPrice(result.dailyEarnings)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Weekly</span>
                            <p className="text-lg font-semibold text-emerald-600">{formatPrice(result.weeklyEarnings)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Monthly</span>
                            <p className="text-lg font-semibold text-violet-600">{formatPrice(result.monthlyEarnings)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Yearly</span>
                            <p className="text-lg font-semibold text-amber-600">{formatPrice(result.yearlyEarnings)}</p>
                        </div>
                    </div>

                    {/* Earnings bar chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Earnings Scale</p>
                        <div className="space-y-2.5">
                            {earningBars.map(b => (
                                <div key={b.label}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-600 dark:text-slate-400">{b.label}</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(b.value)}</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${b.color} rounded-full transition-all`} style={{ width: `${Math.max(2, (b.value / maxEarning) * 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            {/* Start / End Times */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Time</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Time</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
            </div>

            {/* Break Duration */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Break Duration</label>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{breakMinutes} min</span>
                </div>
                <input type="number" value={breakMinutes} onChange={e => setBreakMinutes(Number(e.target.value))} min={0} max={120}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={120} step={5} value={breakMinutes} onChange={e => setBreakMinutes(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
            </div>

            {/* Hourly Rate */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hourly Rate</label>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(hourlyRate)}/hr</span>
                </div>
                <input type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} min={0} step={0.5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={5} max={200} step={1} value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Work Days Per Week */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Work Days / Week</label>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{workDaysPerWeek} days</span>
                </div>
                <input type="number" value={workDaysPerWeek} onChange={e => setWorkDaysPerWeek(Number(e.target.value))} min={1} max={7}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={1} max={7} step={1} value={workDaysPerWeek} onChange={e => setWorkDaysPerWeek(Number(e.target.value))} className="w-full mt-2 accent-blue-500" />
            </div>
        </CalculatorLayout>
    );
}
