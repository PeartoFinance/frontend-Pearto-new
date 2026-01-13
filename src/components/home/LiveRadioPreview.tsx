'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { get } from '@/services/api';

interface RadioStation {
    id: number;
    name: string;
    logoUrl?: string;
    country?: string;
    countryCode?: string;
    genre?: string;
    language?: string;
    streamUrl?: string;
}

export default function LiveRadioPreview() {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                setLoading(true);
                const data = await get<RadioStation[]>('/content/radio', { limit: 8 });
                setStations(data || []);
                setError(false);
            } catch (err) {
                console.error('Failed to fetch radio stations:', err);
                setError(true);
                setStations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, []);

    const getStationIcon = (station: RadioStation) => {
        const icons: Record<string, string> = {
            'United States': '🇺🇸', 'Nepal': '🔴', 'Peru': '🎸',
            'Honduras': '📻', 'Bolivia': '🌎',
        };
        return icons[station.country || ''] || '📻';
    };

    return (
        <section className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-xl">🎧</span> Live Radio – Listen Now
                </h3>
                <Link href="/radio" className="text-sm text-emerald-600 hover:text-emerald-500 font-medium flex items-center gap-1">
                    See All Radios <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                </div>
            ) : error && stations.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                    <AlertCircle size={18} className="mr-2" />
                    <span>No radio stations available</span>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {stations.slice(0, 8).map((station) => (
                        <div
                            key={station.id}
                            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                                {station.logoUrl ? (
                                    <img src={station.logoUrl} alt={station.name} className="w-full h-full object-cover" />
                                ) : (
                                    getStationIcon(station)
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{station.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{station.country || 'Unknown'} • {station.language || 'Unknown'}</p>
                            </div>
                            <button className="p-2 rounded-full bg-emerald-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <Play size={12} fill="white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
