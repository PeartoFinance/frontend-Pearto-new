'use client';

import { useState } from 'react';
import { Sun, Cloud, CloudRain } from 'lucide-react';

interface DayForecast {
    day: string;
    icon: 'sun' | 'cloud' | 'rain';
    high: number;
    low: number;
}

const forecast: DayForecast[] = [
    { day: 'Tue', icon: 'sun', high: 12, low: 7 },
    { day: 'Wed', icon: 'sun', high: 12, low: 7 },
    { day: 'Thu', icon: 'cloud', high: 12, low: 7 },
    { day: 'Fri', icon: 'rain', high: 10, low: 8 },
];

const iconMap = {
    sun: Sun,
    cloud: Cloud,
    rain: CloudRain,
};

export default function WeatherWidget() {
    const [city] = useState('Your location');
    const currentTemp = 7;
    const feelsLike = 5;
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Weather</h3>

            {/* Search placeholder */}
            <input
                type="text"
                placeholder="Search city"
                className="w-full mb-4 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            {/* Current weather */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{city}</p>
                    <p className="text-xs text-slate-500">{time}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Sun className="w-10 h-10 text-amber-400" />
                    <div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{currentTemp}°C</p>
                        <p className="text-xs text-slate-500">Feels like {feelsLike}°C</p>
                    </div>
                </div>
            </div>

            {/* Forecast */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                {forecast.map((day) => {
                    const Icon = iconMap[day.icon];
                    return (
                        <div key={day.day} className="text-center">
                            <p className="text-xs text-slate-500 mb-1">{day.day}</p>
                            <Icon className={`w-5 h-5 mx-auto mb-1 ${day.icon === 'sun' ? 'text-amber-400' : day.icon === 'cloud' ? 'text-slate-400' : 'text-blue-400'
                                }`} />
                            <p className="text-xs text-slate-600 dark:text-slate-300">{day.high}° / {day.low}°</p>
                        </div>
                    );
                })}
            </div>

            <p className="text-[10px] text-slate-400 mt-3">Source: Open Meteo</p>
        </div>
    );
}
