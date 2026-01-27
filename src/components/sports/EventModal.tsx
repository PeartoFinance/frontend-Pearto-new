'use client';

import { X, Play, ExternalLink, MapPin, Calendar, Trophy } from 'lucide-react';
import { SportsEvent } from '@/types/sports';
import { getSportEmoji } from '@/data/sportsConfig';
import VideoPlayer from '@/components/common/VideoPlayer';

interface EventModalProps {
    event: SportsEvent | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
    if (!isOpen || !event) return null;

    const isLive = event.isLive || event.status === 'live';
    const emoji = getSportEmoji(event.sportType);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{emoji}</span>
                        <div>
                            <h2 className="font-bold text-lg">{event.name}</h2>
                            <p className="text-emerald-100 text-sm">{event.sportType} • {event.league}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Video Player */}
                <div className="aspect-video bg-slate-900 relative">
                    <VideoPlayer
                        url={event.streamUrl || undefined}
                        thumbnail={event.thumbnailUrl || undefined}
                        title={event.name}
                        autoplay={isLive}
                    />

                    {/* Live Badge */}
                    {isLive && (
                        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full" />
                            LIVE
                        </div>
                    )}
                </div>

                {/* Event Details */}
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Event Details</h3>

                        <div className="space-y-3 text-sm">
                            {event.league && (
                                <div className="flex items-start gap-3">
                                    <Trophy className="h-4 w-4 text-emerald-500 mt-1" />
                                    <span className="text-slate-600 dark:text-slate-300">{event.league}</span>
                                </div>
                            )}

                            {event.venue && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-emerald-500 mt-1" />
                                    <span className="text-slate-600 dark:text-slate-300">{event.venue}</span>
                                </div>
                            )}

                            {event.eventDate && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-4 w-4 text-emerald-500 mt-1" />
                                    <span className="text-slate-600 dark:text-slate-300">{formatDate(event.eventDate)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Teams */}
                    {event.teamHome && event.teamAway && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Match</h3>

                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-center flex-1">
                                        <div className="font-semibold text-slate-900 dark:text-white">{event.teamHome}</div>
                                        {event.scoreHome && (
                                            <div className="text-2xl font-bold text-emerald-500 mt-2">{event.scoreHome}</div>
                                        )}
                                    </div>

                                    <div className="px-4 text-slate-400 font-bold">VS</div>

                                    <div className="text-center flex-1">
                                        <div className="font-semibold text-slate-900 dark:text-white">{event.teamAway}</div>
                                        {event.scoreAway && (
                                            <div className="text-2xl font-bold text-emerald-500 mt-2">{event.scoreAway}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
