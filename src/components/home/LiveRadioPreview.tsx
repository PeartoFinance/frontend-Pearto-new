'use client';

import Link from 'next/link';
import { Play, ChevronRight } from 'lucide-react';

interface RadioStation {
    name: string;
    country: string;
    language: string;
    icon: string;
}

const radioStations: RadioStation[] = [
    { name: "America's Country", icon: '🇺🇸', country: 'United States', language: 'English' },
    { name: 'BBC Nepali', icon: '🔴', country: 'Nepal', language: 'Nepali' },
    { name: 'BBC Nepali 103 MHz', icon: '🔴', country: 'Nepal', language: 'Nepali' },
    { name: 'NetTalk America', icon: '🇺🇸', country: 'United States', language: 'English' },
    { name: 'Panamericana Retro Rock', icon: '🎸', country: 'Peru', language: 'Spanish' },
    { name: 'Radio America 94.7', icon: '📻', country: 'Honduras', language: 'Spanish' },
    { name: 'Radio Panamericana', icon: '🌎', country: 'Bolivia', language: 'Spanish' },
];

export default function LiveRadioPreview() {
    return (
        <section className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-xl">🎧</span> Live Radio – Listen Now
                </h3>
                <Link href="/radios" className="text-sm text-emerald-600 hover:text-emerald-500 font-medium flex items-center gap-1">
                    See All Radios <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {radioStations.map((station) => (
                    <div
                        key={station.name}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                            {station.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{station.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{station.country} • {station.language}</p>
                        </div>
                        <button className="p-2 rounded-full bg-emerald-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Play size={12} fill="white" />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
