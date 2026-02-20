'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Clock, Globe, ArrowRightLeft, Sun, Moon } from 'lucide-react';

const TIMEZONES = [
    { label: 'UTC (GMT)', offset: 0 },
    { label: 'US Eastern (EST)', offset: -5 },
    { label: 'US Central (CST)', offset: -6 },
    { label: 'US Mountain (MST)', offset: -7 },
    { label: 'US Pacific (PST)', offset: -8 },
    { label: 'US Alaska (AKST)', offset: -9 },
    { label: 'US Hawaii (HST)', offset: -10 },
    { label: 'London (GMT)', offset: 0 },
    { label: 'Paris (CET)', offset: 1 },
    { label: 'Berlin (CET)', offset: 1 },
    { label: 'Moscow (MSK)', offset: 3 },
    { label: 'Dubai (GST)', offset: 4 },
    { label: 'Mumbai (IST)', offset: 5.5 },
    { label: 'Kathmandu (NPT)', offset: 5.75 },
    { label: 'Bangkok (ICT)', offset: 7 },
    { label: 'Singapore (SGT)', offset: 8 },
    { label: 'Beijing (CST)', offset: 8 },
    { label: 'Tokyo (JST)', offset: 9 },
    { label: 'Sydney (AEST)', offset: 10 },
    { label: 'Auckland (NZST)', offset: 12 },
    { label: 'São Paulo (BRT)', offset: -3 },
    { label: 'Buenos Aires (ART)', offset: -3 },
    { label: 'Cairo (EET)', offset: 2 },
    { label: 'Johannesburg (SAST)', offset: 2 },
];

export default function TimeZoneConverter() {
    const { formatPrice } = useCurrency();
    const [sourceHour, setSourceHour] = useState(9);
    const [sourceMinute, setSourceMinute] = useState(0);
    const [sourceTimezone, setSourceTimezone] = useState(0);
    const [targetTimezone, setTargetTimezone] = useState(5.5);

    const result = useMemo(() => {
        const diff = targetTimezone - sourceTimezone;

        // Convert source time to target
        let totalMinutes = sourceHour * 60 + sourceMinute + diff * 60;
        let dayOffset = 0;

        if (totalMinutes >= 24 * 60) {
            dayOffset = 1;
            totalMinutes -= 24 * 60;
        } else if (totalMinutes < 0) {
            dayOffset = -1;
            totalMinutes += 24 * 60;
        }

        const targetHour = Math.floor(totalMinutes / 60);
        const targetMinute = Math.round(totalMinutes % 60);

        const formatTime = (h: number, m: number) => {
            const hour12 = h % 12 || 12;
            const ampm = h >= 12 ? 'PM' : 'AM';
            return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
        };

        const sourceTimeStr = formatTime(sourceHour, sourceMinute);
        const targetTimeStr = formatTime(targetHour, targetMinute);

        const absDiff = Math.abs(diff);
        const diffHours = Math.floor(absDiff);
        const diffMins = Math.round((absDiff - diffHours) * 60);
        const diffStr = `${diff >= 0 ? '+' : '-'}${diffHours}h${diffMins > 0 ? ` ${diffMins}m` : ''}`;

        const isDay = targetHour >= 6 && targetHour < 18;

        return { targetHour, targetMinute, sourceTimeStr, targetTimeStr, diff, diffStr, dayOffset, isDay };
    }, [sourceHour, sourceMinute, sourceTimezone, targetTimezone]);

    const sourceLabel = TIMEZONES.find(t => t.offset === sourceTimezone)?.label || `UTC${sourceTimezone >= 0 ? '+' : ''}${sourceTimezone}`;
    const targetLabel = TIMEZONES.find(t => t.offset === targetTimezone)?.label || `UTC${targetTimezone >= 0 ? '+' : ''}${targetTimezone}`;

    return (
        <CalculatorLayout
            title="Time Zone Converter"
            description="Convert time between any two time zones instantly"
            category="Utilities"
            insights={[
                { label: 'Source', value: result.sourceTimeStr },
                { label: 'Target', value: result.targetTimeStr, color: 'text-blue-600' },
                { label: 'Difference', value: result.diffStr, color: 'text-purple-600' },
                { label: 'Day', value: result.dayOffset === 0 ? 'Same day' : result.dayOffset > 0 ? 'Next day' : 'Prev day', color: result.dayOffset !== 0 ? 'text-amber-600' : undefined },
            ]}
            results={
                <div className="space-y-4">
                    {/* Converted time hero */}
                    <div className={`text-center p-6 rounded-xl ${result.isDay
                        ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20'
                        : 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20'
                    }`}>
                        {result.isDay ? (
                            <Sun className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        ) : (
                            <Moon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                        )}
                        <p className="text-sm text-slate-500">Converted Time</p>
                        <p className={`text-5xl font-bold ${result.isDay ? 'text-amber-600' : 'text-indigo-600'}`}>
                            {result.targetTimeStr}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">{targetLabel}</p>
                    </div>

                    {/* Side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                            <Globe className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-500 mb-1">Source</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{result.sourceTimeStr}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{sourceLabel}</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center border border-blue-200 dark:border-blue-800">
                            <Globe className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-500 mb-1">Target</p>
                            <p className="text-xl font-bold text-blue-600">{result.targetTimeStr}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{targetLabel}</p>
                        </div>
                    </div>

                    {/* Info cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Time Difference</p>
                            <p className="text-xl font-bold text-purple-600">{result.diffStr}</p>
                        </div>
                        <div className={`p-4 rounded-xl text-center ${result.dayOffset !== 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                            <p className="text-xs text-slate-500 mb-1">Day Offset</p>
                            <p className={`text-xl font-bold ${result.dayOffset !== 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {result.dayOffset === 0 ? 'Same Day' : result.dayOffset > 0 ? 'Next Day (+1)' : 'Previous Day (-1)'}
                            </p>
                        </div>
                    </div>

                    {/* Quick reference */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Quick Reference</p>
                        <div className="grid grid-cols-4 gap-1.5">
                            {[0, 3, 6, 9, 12, 15, 18, 21].map(h => {
                                let totalMin = h * 60 + (targetTimezone - sourceTimezone) * 60;
                                let dOff = 0;
                                if (totalMin >= 24 * 60) { dOff = 1; totalMin -= 24 * 60; }
                                else if (totalMin < 0) { dOff = -1; totalMin += 24 * 60; }
                                const tH = Math.floor(totalMin / 60);
                                const tH12 = tH % 12 || 12;
                                const ampm = tH >= 12 ? 'PM' : 'AM';
                                const isD = tH >= 6 && tH < 18;
                                return (
                                    <div key={h} className={`p-2 rounded-lg text-center text-[10px] ${isD ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-indigo-50 dark:bg-indigo-900/10'}`}>
                                        <p className="text-slate-500">{(h % 12 || 12)}:00 {h >= 12 ? 'PM' : 'AM'}</p>
                                        <p className={`font-bold ${isD ? 'text-amber-600' : 'text-indigo-600'}`}>{tH12}:00 {ampm}</p>
                                        {dOff !== 0 && <p className="text-amber-500 text-[8px]">{dOff > 0 ? '+1d' : '-1d'}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Source Time</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500">Hour</span>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{sourceHour}:00</span>
                            </div>
                            <select value={sourceHour} onChange={(e) => setSourceHour(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>{(i % 12 || 12)}:00 {i >= 12 ? 'PM' : 'AM'}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500">Minute</span>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">:{sourceMinute.toString().padStart(2, '0')}</span>
                            </div>
                            <select value={sourceMinute} onChange={(e) => setSourceMinute(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                {[0, 15, 30, 45].map(m => (
                                    <option key={m} value={m}>:{m.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Timezone</label>
                    </div>
                    <select value={sourceTimezone} onChange={(e) => setSourceTimezone(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {TIMEZONES.map((tz, i) => (
                            <option key={i} value={tz.offset}>{tz.label} (UTC{tz.offset >= 0 ? '+' : ''}{tz.offset})</option>
                        ))}
                    </select>
                </div>

                {/* Swap button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => { setSourceTimezone(targetTimezone); setTargetTimezone(sourceTimezone); }}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-400 hover:text-emerald-500"
                    >
                        <ArrowRightLeft size={16} />
                    </button>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Timezone</label>
                    </div>
                    <select value={targetTimezone} onChange={(e) => setTargetTimezone(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {TIMEZONES.map((tz, i) => (
                            <option key={i} value={tz.offset}>{tz.label} (UTC{tz.offset >= 0 ? '+' : ''}{tz.offset})</option>
                        ))}
                    </select>
                </div>
            </div>
        </CalculatorLayout>
    );
}
