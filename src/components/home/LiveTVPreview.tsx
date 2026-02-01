'use client';

import Link from 'next/link';
import { ExternalLink, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useTVChannels } from '@/hooks/useMediaData';

export default function LiveTVPreview() {
    const { data: channels = [], isLoading: loading, isError: error } = useTVChannels(8);

    const getChannelIcon = (name: string) => {
        const icons: Record<string, string> = {
            'ABC News': '📺', 'Bloomberg TV': '📊', 'CNBC': '💹',
            'CNN': '📰', 'ESPN': '⚽', 'ET Tonight': '🌟', 'TechCrunch': '💻',
        };
        return icons[name] || '📺';
    };

    return (
        <section className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-xl">📺</span> Live TV – Watch Now
                </h3>
                <Link href="/tv" className="text-sm text-emerald-600 hover:text-emerald-500 font-medium flex items-center gap-1">
                    See All TV <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                </div>
            ) : error && channels.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                    <AlertCircle size={18} className="mr-2" />
                    <span>No channels available</span>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {channels.slice(0, 8).map((channel) => (
                        <Link
                            key={channel.id}
                            href={`/tv/${channel.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                                {channel.logoUrl ? (
                                    <img src={channel.logoUrl} alt={channel.name} className="w-full h-full object-cover" />
                                ) : (
                                    getChannelIcon(channel.name)
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{channel.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{channel.countryCode || 'US'} • {channel.language || 'English'}</p>
                            </div>
                            <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
