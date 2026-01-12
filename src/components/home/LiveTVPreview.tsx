'use client';

import Link from 'next/link';
import { ExternalLink, ChevronRight } from 'lucide-react';

interface TVChannel {
    name: string;
    icon: string;
    country: string;
    language: string;
}

const tvChannels: TVChannel[] = [
    { name: 'ABC News', icon: '📺', country: 'US', language: 'English' },
    { name: 'Bloomberg TV', icon: '📊', country: 'US', language: 'English' },
    { name: 'CNBC', icon: '💹', country: 'US', language: 'English' },
    { name: 'CNN', icon: '📰', country: 'US', language: 'English' },
    { name: 'ESPN', icon: '⚽', country: 'US', language: 'English' },
    { name: 'ET Tonight', icon: '🌟', country: 'US', language: 'English' },
    { name: 'TechCrunch', icon: '💻', country: 'US', language: 'English' },
];

export default function LiveTVPreview() {
    return (
        <section className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-xl">📺</span> Live TV – Watch Now
                </h3>
                <Link href="/tvs" className="text-sm text-emerald-600 hover:text-emerald-500 font-medium flex items-center gap-1">
                    See All TV <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {tvChannels.map((channel) => (
                    <Link
                        key={channel.name}
                        href={`/tvs/${channel.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                            {channel.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{channel.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{channel.country} • {channel.language}</p>
                        </div>
                        <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                    </Link>
                ))}
            </div>
        </section>
    );
}
