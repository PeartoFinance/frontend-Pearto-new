'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, Clock, Calculator } from 'lucide-react';

export default function SalaryToHourlyConverter() {
    const [salary, setSalary] = useState(600000);
    const [hoursPerWeek, setHoursPerWeek] = useState(40);
    const [paidLeaves, setPaidLeaves] = useState(24);

    const result = useMemo(() => {
        const workingWeeks = 52 - (paidLeaves / 5);
        const totalHours = hoursPerWeek * workingWeeks;
        const hourlyRate = salary / totalHours;
        const dailyRate = salary / (workingWeeks * 5);
        const monthlyRate = salary / 12;
        const weeklyRate = salary / 52;

        return {
            hourlyRate: Math.round(hourlyRate),
            dailyRate: Math.round(dailyRate),
            monthlyRate: Math.round(monthlyRate),
            weeklyRate: Math.round(weeklyRate),
            totalHours: Math.round(totalHours)
        };
    }, [salary, hoursPerWeek, paidLeaves]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Salary Converter"
            description="Convert annual salary to hourly, daily, weekly rates"
            category="Personal Finance"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Hourly Rate</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.hourlyRate)}</p>
                        <p className="text-sm text-slate-500 mt-1">per hour</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Daily</span>
                            <p className="text-lg font-semibold">{formatCurrency(result.dailyRate)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Weekly</span>
                            <p className="text-lg font-semibold">{formatCurrency(result.weeklyRate)}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between">
                        <span className="text-slate-500">Monthly</span>
                        <span className="font-semibold">{formatCurrency(result.monthlyRate)}</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <p className="text-xs text-slate-500">Working {result.totalHours} hours/year</p>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Annual Salary (CTC)</label>
                <input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} min={100000}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={100000} max={10000000} step={50000} value={salary} onChange={(e) => setSalary(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Hours Per Week</label>
                <input type="number" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} min={20} max={60}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={20} max={60} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Paid Leave Days</label>
                <input type="number" value={paidLeaves} onChange={(e) => setPaidLeaves(Number(e.target.value))} min={0} max={60}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
