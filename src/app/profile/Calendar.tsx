'use client';

import { useState } from 'react';

interface CalendarProps {
    month: Date;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export default function Calendar({ month, selectedDate, onDateSelect }: CalendarProps) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Get days from previous month to fill the first week
    const prevMonth = new Date(year, monthIndex - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    const prevMonthDays: number[] = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        prevMonthDays.push(daysInPrevMonth - i);
    }

    // Get days from next month to fill the last week
    const remainingCells = 42 - (startingDayOfWeek + daysInMonth);
    const nextMonthDays: number[] = [];
    for (let i = 1; i <= remainingCells; i++) {
        nextMonthDays.push(i);
    }

    const weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

    const isSelected = (day: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return false;
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === monthIndex &&
            selectedDate.getFullYear() === year
        );
    };

    const isToday = (day: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return false;
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === monthIndex &&
            today.getFullYear() === year
        );
    };

    const handleDateClick = (day: number, isPrevMonth: boolean, isNextMonth: boolean) => {
        let newDate: Date;
        if (isPrevMonth) {
            newDate = new Date(year, monthIndex - 1, day);
        } else if (isNextMonth) {
            newDate = new Date(year, monthIndex + 1, day);
        } else {
            newDate = new Date(year, monthIndex, day);
        }
        onDateSelect(newDate);
    };

    return (
        <div className="w-full">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-1"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Previous month days */}
                {prevMonthDays.map((day) => {
                    return (
                        <button
                            key={`prev-${day}`}
                            onClick={() => handleDateClick(day, true, false)}
                            className={`
                                aspect-square rounded-lg text-sm transition
                                text-slate-400 dark:text-slate-600
                                hover:bg-slate-100 dark:hover:bg-slate-700
                            `}
                        >
                            {day}
                        </button>
                    );
                })}

                {/* Current month days */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const selected = isSelected(day, true);
                    const today = isToday(day, true);
                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day, false, false)}
                            className={`
                                aspect-square rounded-lg text-sm font-medium transition
                                ${selected
                                    ? 'bg-emerald-500 text-white'
                                    : today
                                    ? 'ring-2 ring-emerald-500 text-emerald-500'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }
                            `}
                        >
                            {day}
                        </button>
                    );
                })}

                {/* Next month days */}
                {nextMonthDays.map((day) => {
                    return (
                        <button
                            key={`next-${day}`}
                            onClick={() => handleDateClick(day, false, true)}
                            className={`
                                aspect-square rounded-lg text-sm transition
                                text-slate-400 dark:text-slate-600
                                hover:bg-slate-100 dark:hover:bg-slate-700
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
