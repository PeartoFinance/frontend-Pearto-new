'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Calendar, Cake, Clock } from 'lucide-react';

export default function AgeCalculator() {
    const today = new Date();
    const [birthDate, setBirthDate] = useState('1990-01-15');

    const result = useMemo(() => {
        const birth = new Date(birthDate);
        if (isNaN(birth.getTime())) {
            return { years: 0, months: 0, days: 0, totalDays: 0, nextBirthday: 0, zodiac: '' };
        }

        const now = new Date();

        // Calculate age
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();

        if (days < 0) {
            months--;
            days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        // Total days alive
        const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

        // Days until next birthday
        const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
        if (nextBday < now) nextBday.setFullYear(nextBday.getFullYear() + 1);
        const nextBirthday = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Zodiac sign
        const month = birth.getMonth() + 1;
        const day = birth.getDate();
        let zodiac = '';
        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiac = 'Aries ♈';
        else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiac = 'Taurus ♉';
        else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) zodiac = 'Gemini ♊';
        else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) zodiac = 'Cancer ♋';
        else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiac = 'Leo ♌';
        else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiac = 'Virgo ♍';
        else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) zodiac = 'Libra ♎';
        else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) zodiac = 'Scorpio ♏';
        else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) zodiac = 'Sagittarius ♐';
        else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) zodiac = 'Capricorn ♑';
        else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) zodiac = 'Aquarius ♒';
        else zodiac = 'Pisces ♓';

        return { years, months, days, totalDays, nextBirthday, zodiac };
    }, [birthDate]);

    return (
        <CalculatorLayout
            title="Age Calculator"
            description="Calculate your exact age and days until next birthday"
            category="Utilities"
            results={
                <div className="space-y-6">
                    {/* Main Age Display */}
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-2">Your Age</p>
                        <div className="flex justify-center gap-4">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-emerald-600">{result.years}</p>
                                <p className="text-xs text-slate-500">Years</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-blue-600">{result.months}</p>
                                <p className="text-xs text-slate-500">Months</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-purple-600">{result.days}</p>
                                <p className="text-xs text-slate-500">Days</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-500">Total Days</span>
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {result.totalDays.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Cake className="w-4 h-4 text-pink-500" />
                                <span className="text-xs text-slate-500">Next Birthday</span>
                            </div>
                            <p className="text-lg font-semibold text-pink-600">
                                {result.nextBirthday} days
                            </p>
                        </div>
                    </div>

                    {/* Zodiac */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl flex justify-between items-center">
                        <span className="text-slate-500">Zodiac Sign</span>
                        <span className="font-semibold text-lg">{result.zodiac}</span>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date of Birth
                </label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        max={today.toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    Enter your birth date to calculate your exact age, total days lived, and countdown to your next birthday.
                </p>
            </div>
        </CalculatorLayout>
    );
}
