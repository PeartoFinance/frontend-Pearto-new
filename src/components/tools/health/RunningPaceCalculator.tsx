'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Timer, TrendingUp, MapPin, Zap } from 'lucide-react';

const RACE_DISTANCES = [
    { name: '5K', km: 5 },
    { name: '10K', km: 10 },
    { name: 'Half Marathon', km: 21.0975 },
    { name: 'Marathon', km: 42.195 },
];

export default function RunningPaceCalculator() {
    const [distance, setDistance] = useState(10);
    const [distUnit, setDistUnit] = useState<'km' | 'miles'>('km');
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(50);
    const [seconds, setSeconds] = useState(0);

    const result = useMemo(() => {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        if (totalSeconds === 0 || distance === 0) return null;

        const distKm = distUnit === 'km' ? distance : distance * 1.60934;
        const distMiles = distUnit === 'miles' ? distance : distance / 1.60934;

        // Pace per km
        const pacePerKmSec = totalSeconds / distKm;
        const paceKmMin = Math.floor(pacePerKmSec / 60);
        const paceKmSec = Math.round(pacePerKmSec % 60);

        // Pace per mile
        const pacePerMileSec = totalSeconds / distMiles;
        const paceMileMin = Math.floor(pacePerMileSec / 60);
        const paceMileSec = Math.round(pacePerMileSec % 60);

        // Speed
        const speedKmh = (distKm / totalSeconds) * 3600;
        const speedMph = (distMiles / totalSeconds) * 3600;

        // Predicted race times using Riegel formula: T2 = T1 × (D2/D1)^1.06
        const predictions = RACE_DISTANCES.map(race => {
            const predictedSec = totalSeconds * Math.pow(race.km / distKm, 1.06);
            const h = Math.floor(predictedSec / 3600);
            const m = Math.floor((predictedSec % 3600) / 60);
            const s = Math.round(predictedSec % 60);
            const pPerKm = predictedSec / race.km;
            const pMin = Math.floor(pPerKm / 60);
            const pSec = Math.round(pPerKm % 60);
            return {
                name: race.name,
                km: race.km,
                time: `${h > 0 ? `${h}:` : ''}${h > 0 ? String(m).padStart(2, '0') : m}:${String(s).padStart(2, '0')}`,
                pace: `${pMin}:${String(pSec).padStart(2, '0')}/km`,
                totalSeconds: predictedSec,
            };
        });

        return {
            paceKm: `${paceKmMin}:${String(paceKmSec).padStart(2, '0')}`,
            paceMile: `${paceMileMin}:${String(paceMileSec).padStart(2, '0')}`,
            speedKmh: Math.round(speedKmh * 10) / 10,
            speedMph: Math.round(speedMph * 10) / 10,
            predictions,
            totalSeconds,
            timeFormatted: `${hours > 0 ? `${hours}:` : ''}${hours > 0 ? String(minutes).padStart(2, '0') : minutes}:${String(seconds).padStart(2, '0')}`,
        };
    }, [distance, distUnit, hours, minutes, seconds]);

    return (
        <CalculatorLayout
            title="Running Pace Calculator"
            description="Calculate pace per km/mile and predict race finish times"
            category="Health & Fitness"
            insights={[
                { label: 'Pace/km', value: result?.paceKm ? `${result.paceKm} min` : '—', color: 'text-blue-600' },
                { label: 'Pace/mile', value: result?.paceMile ? `${result.paceMile} min` : '—', color: 'text-purple-600' },
                { label: 'Speed', value: result ? `${result.speedKmh} km/h` : '—' },
                { label: 'Total Time', value: result?.timeFormatted || '—', color: 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    {!result ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Timer size={32} className="mb-2 opacity-40" />
                            <p className="text-sm">Enter distance and time to calculate pace</p>
                        </div>
                    ) : (
                        <>
                            {/* Main pace display */}
                            <div className="text-center p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                                <Timer className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">Your Pace</p>
                                <p className="text-5xl font-bold text-emerald-600">{result.paceKm}</p>
                                <p className="text-sm text-slate-500 mt-1">min/km · {result.paceMile} min/mile</p>
                            </div>

                            {/* Speed & time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
                                    <Zap className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Speed</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">{result.speedKmh} km/h</p>
                                    <p className="text-[10px] text-slate-400">{result.speedMph} mph</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
                                    <MapPin className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Distance</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">{distance} {distUnit}</p>
                                    <p className="text-[10px] text-slate-400">in {result.timeFormatted}</p>
                                </div>
                            </div>

                            {/* Race predictions */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp size={14} className="text-blue-500" />
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Predicted Race Times</p>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-3">Based on Riegel formula (T2 = T1 × (D2/D1)^1.06)</p>
                                <div className="space-y-2">
                                    {result.predictions.map(pred => (
                                        <div key={pred.name} className="flex items-center gap-3">
                                            <span className="text-xs text-slate-600 dark:text-slate-400 w-24">{pred.name}</span>
                                            <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-400 rounded-full transition-all"
                                                    style={{ width: `${Math.min((pred.km / 42.195) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-20 text-right">{pred.time}</span>
                                            <span className="text-[10px] text-slate-400 w-16">{pred.pace}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pace comparison visual */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Pace Zones</p>
                                <div className="space-y-1.5">
                                    {[
                                        { label: 'Sprint', paceRange: '< 3:30/km', color: 'bg-red-400' },
                                        { label: 'Fast', paceRange: '3:30-4:30/km', color: 'bg-orange-400' },
                                        { label: 'Moderate', paceRange: '4:30-5:30/km', color: 'bg-amber-400' },
                                        { label: 'Comfortable', paceRange: '5:30-6:30/km', color: 'bg-emerald-400' },
                                        { label: 'Easy', paceRange: '6:30-8:00/km', color: 'bg-blue-400' },
                                        { label: 'Walking', paceRange: '> 8:00/km', color: 'bg-slate-400' },
                                    ].map(zone => {
                                        const paceSeconds = result.totalSeconds / (distUnit === 'km' ? distance : distance * 1.60934);
                                        const paceMin = paceSeconds / 60;
                                        const isActive = (
                                            (zone.label === 'Sprint' && paceMin < 3.5) ||
                                            (zone.label === 'Fast' && paceMin >= 3.5 && paceMin < 4.5) ||
                                            (zone.label === 'Moderate' && paceMin >= 4.5 && paceMin < 5.5) ||
                                            (zone.label === 'Comfortable' && paceMin >= 5.5 && paceMin < 6.5) ||
                                            (zone.label === 'Easy' && paceMin >= 6.5 && paceMin < 8) ||
                                            (zone.label === 'Walking' && paceMin >= 8)
                                        );
                                        return (
                                            <div key={zone.label} className={`flex items-center justify-between px-3 py-2 rounded-lg ${isActive ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${zone.color}`} />
                                                    <span className={`text-xs ${isActive ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>{zone.label}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400">{zone.paceRange}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Distance Unit</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setDistUnit('km')} className={`py-3 px-4 rounded-lg text-sm font-medium transition ${distUnit === 'km' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Kilometers</button>
                        <button onClick={() => setDistUnit('miles')} className={`py-3 px-4 rounded-lg text-sm font-medium transition ${distUnit === 'miles' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>Miles</button>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Distance</label>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{distance} {distUnit}</span>
                    </div>
                    <input type="number" value={distance} onChange={(e) => setDistance(Math.max(0.1, Number(e.target.value)))} step={0.1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={0.5} max={distUnit === 'km' ? 50 : 31} step={0.5} value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))} className="w-full accent-emerald-500 mt-1" />
                    {/* Quick race buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {RACE_DISTANCES.map(r => (
                            <button key={r.name} onClick={() => { setDistance(distUnit === 'km' ? r.km : Math.round(r.km / 1.60934 * 10) / 10); setDistUnit(distUnit); }}
                                className="text-[10px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition">
                                {r.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Time</label>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Hours</label>
                            <input type="number" value={hours} onChange={(e) => setHours(Math.max(0, Number(e.target.value)))} min={0} max={24}
                                className="w-full px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-center" />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Minutes</label>
                            <input type="number" value={minutes} onChange={(e) => setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))} min={0} max={59}
                                className="w-full px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-center" />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Seconds</label>
                            <input type="number" value={seconds} onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))} min={0} max={59}
                                className="w-full px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-center" />
                        </div>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
