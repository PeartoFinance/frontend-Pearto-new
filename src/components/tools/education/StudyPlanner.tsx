'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Book, Clock, CheckCircle, Target } from 'lucide-react';

interface Subject {
    name: string;
    hours: number;
    priority: 'high' | 'medium' | 'low';
}

export default function StudyPlanner() {
    const [subjects, setSubjects] = useState<Subject[]>([
        { name: 'Mathematics', hours: 8, priority: 'high' },
        { name: 'Physics', hours: 6, priority: 'high' },
        { name: 'Chemistry', hours: 5, priority: 'medium' },
        { name: 'English', hours: 3, priority: 'low' },
    ]);
    const [daysUntilExam, setDaysUntilExam] = useState(14);
    const [hoursPerDay, setHoursPerDay] = useState(6);

    const plan = useMemo(() => {
        const totalHoursNeeded = subjects.reduce((sum, s) => sum + s.hours, 0);
        const totalHoursAvailable = daysUntilExam * hoursPerDay;
        const canComplete = totalHoursAvailable >= totalHoursNeeded;

        // Distribute hours based on priority
        const priorityWeight = { high: 1.5, medium: 1.0, low: 0.7 };
        const totalWeight = subjects.reduce((sum, s) => sum + priorityWeight[s.priority], 0);

        const schedule = subjects.map(subject => {
            const weight = priorityWeight[subject.priority];
            const allocatedHours = Math.min(
                subject.hours,
                (weight / totalWeight) * totalHoursAvailable
            );
            const hoursPerDayForSubject = allocatedHours / daysUntilExam;

            return {
                ...subject,
                allocatedHours,
                hoursPerDayForSubject,
                completed: allocatedHours >= subject.hours
            };
        });

        return {
            schedule,
            totalHoursNeeded,
            totalHoursAvailable,
            canComplete,
            utilizationPercent: (totalHoursNeeded / totalHoursAvailable) * 100
        };
    }, [subjects, daysUntilExam, hoursPerDay]);

    const updateSubject = (index: number, field: keyof Subject, value: string | number) => {
        const updated = [...subjects];
        updated[index] = { ...updated[index], [field]: value };
        setSubjects(updated);
    };

    const addSubject = () => {
        setSubjects([...subjects, { name: 'New Subject', hours: 4, priority: 'medium' }]);
    };

    const removeSubject = (index: number) => {
        if (subjects.length > 1) {
            setSubjects(subjects.filter((_, i) => i !== index));
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-amber-100 text-amber-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <CalculatorLayout
            title="Study Planner"
            description="Plan your study schedule for exams"
            category="Education & Study"
            results={
                <div className="space-y-4">
                    <div className={`text-center p-6 rounded-xl ${plan.canComplete
                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
                            : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
                        }`}>
                        <Target className={`w-8 h-8 mx-auto mb-2 ${plan.canComplete ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <p className="text-sm text-slate-500">Schedule Status</p>
                        <p className={`text-2xl font-bold ${plan.canComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {plan.canComplete ? 'On Track!' : 'Need More Time'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {plan.totalHoursNeeded}h needed / {plan.totalHoursAvailable}h available
                        </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Daily Study Schedule
                        </p>
                        <div className="space-y-3">
                            {plan.schedule.map((subject, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-2 h-8 rounded-full ${subject.priority === 'high' ? 'bg-red-500' :
                                            subject.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {subject.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {subject.hoursPerDayForSubject.toFixed(1)}h/day × {daysUntilExam} days
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {subject.allocatedHours.toFixed(1)}h
                                        </p>
                                        {subject.completed && (
                                            <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                            <span>Time Utilization</span>
                            <span>{Math.min(100, plan.utilizationPercent).toFixed(0)}%</span>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${plan.utilizationPercent > 100 ? 'bg-red-500' :
                                        plan.utilizationPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                style={{ width: `${Math.min(100, plan.utilizationPercent)}%` }}
                            />
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Days Until Exam
                        </label>
                        <input
                            type="number"
                            value={daysUntilExam}
                            onChange={(e) => setDaysUntilExam(Math.max(1, Number(e.target.value)))}
                            min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Hours per Day
                        </label>
                        <input
                            type="number"
                            value={hoursPerDay}
                            onChange={(e) => setHoursPerDay(Math.max(1, Math.min(12, Number(e.target.value))))}
                            min={1}
                            max={12}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Subjects</p>
                    {subjects.map((subject, index) => (
                        <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={subject.name}
                                    onChange={(e) => updateSubject(index, 'name', e.target.value)}
                                    className="flex-1 px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                />
                                <button
                                    onClick={() => removeSubject(index)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500">Hours needed</label>
                                    <input
                                        type="number"
                                        value={subject.hours}
                                        onChange={(e) => updateSubject(index, 'hours', Number(e.target.value))}
                                        min={1}
                                        className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500">Priority</label>
                                    <select
                                        value={subject.priority}
                                        onChange={(e) => updateSubject(index, 'priority', e.target.value)}
                                        className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    >
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addSubject}
                    className="w-full py-2 text-sm text-emerald-600 border border-dashed border-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
                >
                    + Add Subject
                </button>
            </div>
        </CalculatorLayout>
    );
}
