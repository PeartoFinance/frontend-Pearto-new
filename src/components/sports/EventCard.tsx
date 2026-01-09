'use client';

import { SportsEvent } from '@/types/sports';
import { Trophy, Play, Clock, MapPin } from 'lucide-react';

interface EventCardProps {
    event: SportsEvent;
    onClick: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
    const isLive = event.status?.toLowerCase().includes('live');

    return (
        <button
            onClick={onClick}
            className="group relative rounded-xl overflow-hidden border border-emerald-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 backdrop-blur shadow-sm hover:shadow-lg transition text-left w-full"
        >
            {/* Event Image */}
            <div className="aspect-video relative flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-100 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
                {event.logo ? (
                    <img
                        src={event.logo}
                        alt={event.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(event.name)}&background=10b981&color=fff&size=128`;
                        }}
                    />
                ) : (
                    <Trophy className="h-12 w-12 text-emerald-500 opacity-60" />
                )}

                {/* Live Badge */}
                {isLive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                    </div>
                )}

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
                        {event.match_type || event.category}
                    </span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    🏆 {event.description}
                </div>

                {event.series && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        📋 {event.series}
                    </div>
                )}

                {event.venue && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3" />
                        {event.venue}
                    </div>
                )}

                {event.team_home && event.team_away && (
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {event.team_home} vs {event.team_away}
                    </div>
                )}

                {event.score_home && event.score_away && (
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded inline-block">
                        {event.score_home} - {event.score_away}
                    </div>
                )}

                {event.result && (
                    <div className="text-[11px] text-green-600 dark:text-green-400 font-medium">
                        {event.result}
                    </div>
                )}

                {event.event_date && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.event_date}
                    </div>
                )}
            </div>
        </button>
    );
}
