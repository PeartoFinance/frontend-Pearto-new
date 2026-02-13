'use client';

import React from 'react';
import { MapPin, Clock, Play, Trophy, Pin, PinOff } from 'lucide-react';
import { SportsEvent } from '@/services/sportsService';
import { getSportEmoji } from '@/data/sportsConfig';

interface SportCardProps {
    event: SportsEvent;
    onClick?: () => void;
    isPinned?: boolean;
    onTogglePin?: (eventId: number) => void;
}

export function SportCard({ event, onClick, isPinned, onTogglePin }: SportCardProps) {
    const emoji = getSportEmoji(event.sportType);
    const isLive = event.isLive || event.status === 'live';
    const isCompleted = event.status === 'completed';

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div
            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer group"
            onClick={onClick}
        >
            {/* Header with emerald green theme */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 relative">
                {/* Live Badge */}
                {isLive && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600 px-2 py-1 rounded-full animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <span className="text-xs font-semibold text-white">LIVE</span>
                    </div>
                )}

                {/* Pin Button */}
                {onTogglePin && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onTogglePin(event.id); }}
                        className={`absolute ${isLive ? 'top-10 right-3' : 'top-3 right-3'} p-1.5 rounded-full transition ${isPinned ? 'bg-yellow-400/30 hover:bg-yellow-400/40' : 'bg-white/10 hover:bg-white/20'}`}
                        title={isPinned ? 'Unpin from ticker' : 'Pin to ticker'}
                    >
                        {isPinned ? (
                            <Pin className="h-3.5 w-3.5 text-yellow-300" />
                        ) : (
                            <PinOff className="h-3.5 w-3.5 text-white/60" />
                        )}
                    </button>
                )}

                {/* Sport Type */}
                <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="capitalize">{event.sportType}</span>
                    {event.league && (
                        <>
                            <span className="text-white/40">•</span>
                            <span>{event.league}</span>
                        </>
                    )}
                </div>

                {/* Match Title */}
                <h3 className="text-white font-bold text-lg leading-tight">{event.name}</h3>
            </div>

            {/* Teams & Score */}
            <div className="p-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Home Team */}
                    <div className="flex-1 text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-lg font-bold text-slate-900 dark:text-white">
                            {event.teamHome?.slice(0, 3).toUpperCase() || '???'}
                        </div>
                        <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{event.teamHome || 'TBD'}</p>
                    </div>

                    {/* Score/VS */}
                    <div className="text-center px-4">
                        {(event.scoreHome || event.scoreAway) ? (
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                <span>{event.scoreHome || '0'}</span>
                                <span className="text-slate-500 mx-1">-</span>
                                <span>{event.scoreAway || '0'}</span>
                            </div>
                        ) : (
                            <div className="text-xl font-semibold text-slate-500">VS</div>
                        )}
                        {isLive && (
                            <div className="text-xs text-emerald-400 mt-1">In Progress</div>
                        )}
                        {isCompleted && (
                            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                                <Trophy className="w-3 h-3" />
                                Final
                            </div>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-lg font-bold text-slate-900 dark:text-white">
                            {event.teamAway?.slice(0, 3).toUpperCase() || '???'}
                        </div>
                        <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{event.teamAway || 'TBD'}</p>
                    </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{event.venue || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(event.eventDate)}</span>
                    </div>
                </div>

                {/* Watch Button for Live */}
                {isLive && event.streamUrl && (
                    <button className="w-full mt-3 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-semibold transition group-hover:scale-[1.02]">
                        <Play className="w-4 h-4" />
                        Watch Live
                    </button>
                )}
            </div>
        </div>
    );
}

export default SportCard;
