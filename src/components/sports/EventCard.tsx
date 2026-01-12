'use client';

import { SportsEvent } from '@/types/sports';
import { Trophy, Play, Clock, MapPin } from 'lucide-react';
import { getSportEmoji } from '@/data/sportsConfig';

interface EventCardProps {
    event: SportsEvent;
    onClick: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
    const isLive = event.isLive || event.status === 'live';
    const emoji = getSportEmoji(event.sportType);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <button
            onClick={onClick}
            className="group relative rounded-xl overflow-hidden border border-emerald-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800 backdrop-blur shadow-sm hover:shadow-lg transition text-left w-full"
        >
            {/* Event Header with gradient */}
            <div className="aspect-video relative flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-700 overflow-hidden p-4">
                {event.thumbnailUrl ? (
                    <img
                        src={event.thumbnailUrl}
                        alt={event.name}
                        className="w-full h-full object-cover absolute inset-0"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="text-center">
                        <span className="text-4xl">{emoji}</span>
                        <Trophy className="h-8 w-8 text-white/60 mx-auto mt-2" />
                    </div>
                )}

                {/* Live Badge */}
                {isLive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        LIVE
                    </div>
                )}

                {/* Sport Type Badge */}
                <div className="absolute top-2 left-2 text-xs bg-black/40 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                    {emoji} {event.sportType}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-3">
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-600 text-white px-3 py-1.5 rounded shadow hover:bg-emerald-500">
                        <Play className="h-4 w-4" />
                        View Details
                    </div>
                </div>
            </div>

            {/* Event Info */}
            <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-tight truncate">
                        {event.name}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${isLive
                        ? 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-600'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-600'
                        }`}>
                        {event.status}
                    </span>
                </div>

                {event.league && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        🏆 {event.league}
                    </div>
                )}

                {event.venue && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3" />
                        {event.venue}
                    </div>
                )}

                {event.teamHome && event.teamAway && (
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {event.teamHome} vs {event.teamAway}
                    </div>
                )}

                {(event.scoreHome || event.scoreAway) && (
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded inline-block">
                        {event.scoreHome || '0'} - {event.scoreAway || '0'}
                    </div>
                )}

                {event.eventDate && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(event.eventDate)}
                    </div>
                )}
            </div>
        </button>
    );
}
