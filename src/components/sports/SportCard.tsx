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
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-3 sm:p-4 relative">
                {/* Live Badge */}
                {isLive && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                        <span className="text-[10px] sm:text-xs font-semibold text-white">LIVE</span>
                    </div>
                )}

                {/* Pin Button */}
                {onTogglePin && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onTogglePin(event.id); }}
                        className={`absolute ${isLive ? 'top-9 sm:top-10 right-2 sm:right-3' : 'top-2 sm:top-3 right-2 sm:right-3'} p-1 sm:p-1.5 rounded-full transition ${isPinned ? 'bg-yellow-400/30 hover:bg-yellow-400/40' : 'bg-white/10 hover:bg-white/20'}`}
                        title={isPinned ? 'Unpin from ticker' : 'Pin to ticker'}
                    >
                        {isPinned ? (
                            <Pin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-300" />
                        ) : (
                            <PinOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/60" />
                        )}
                    </button>
                )}

                {/* Sport Type */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-white/80 text-xs sm:text-sm mb-1 sm:mb-2 pr-16">
                    <span className="text-base sm:text-lg">{emoji}</span>
                    <span className="capitalize">{event.sportType}</span>
                    {event.league && (
                        <>
                            <span className="text-white/40">•</span>
                            <span className="truncate">{event.league}</span>
                        </>
                    )}
                </div>

                {/* Match Title */}
                <h3 className="text-white font-bold text-sm sm:text-lg leading-tight truncate">{event.name}</h3>
            </div>

            {/* Teams & Score */}
            <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                    {/* Home Team */}
                    <div className="flex-1 text-center min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-2 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
                            {event.teamHome?.slice(0, 3).toUpperCase() || '???'}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-medium truncate">{event.teamHome || 'TBD'}</p>
                    </div>

                    {/* Score/VS */}
                    <div className="text-center px-2 sm:px-4 flex-shrink-0">
                        {(event.scoreHome != null || event.scoreAway != null) ? (
                            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                <span>{event.scoreHome ?? '0'}</span>
                                <span className="text-slate-500 mx-1">-</span>
                                <span>{event.scoreAway ?? '0'}</span>
                            </div>
                        ) : (
                            <div className="text-lg sm:text-xl font-semibold text-slate-500">VS</div>
                        )}
                        {isLive && (
                            <div className="text-[10px] sm:text-xs text-emerald-400 mt-1">In Progress</div>
                        )}
                        {isCompleted && (
                            <div className="text-[10px] sm:text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                                <Trophy className="w-3 h-3" />
                                Final
                            </div>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-2 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
                            {event.teamAway?.slice(0, 3).toUpperCase() || '???'}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-medium truncate">{event.teamAway || 'TBD'}</p>
                    </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200 dark:border-slate-700/50 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1 min-w-0">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{event.venue || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(event.eventDate)}</span>
                    </div>
                </div>

                {/* Watch Button for Live */}
                {isLive && event.streamUrl && (
                    <button
                        onClick={() => event.streamUrl && window.open(event.streamUrl, '_blank', 'noopener,noreferrer')}
                        className="w-full mt-2.5 sm:mt-3 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 sm:py-2.5 rounded-lg text-sm font-semibold transition"
                    >
                        <Play className="w-4 h-4" />
                        Watch Live
                    </button>
                )}
            </div>
        </div>
    );
}

export default SportCard;
