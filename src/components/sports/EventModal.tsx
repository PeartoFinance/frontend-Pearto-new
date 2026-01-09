'use client';

import { X, Play, ExternalLink, MapPin, Calendar, Trophy } from 'lucide-react';
import { SportsEvent } from '@/types/sports';

interface EventModalProps {
    event: SportsEvent | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
    if (!isOpen || !event) return null;

    const isLive = event.status?.toLowerCase().includes('live');

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
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                    <div className="flex items-center gap-3">
                        <Trophy className="h-6 w-6" />
                        <div>
                            <h2 className="font-bold text-lg">{event.name}</h2>
                            <p className="text-orange-100 text-sm">{event.category}</p>
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
                <div className="aspect-video bg-black relative">
                    {event.embed_url ? (
                        <iframe
                            src={event.embed_url}
                            className="absolute inset-0 w-full h-full"
                            allowFullScreen
                            allow="autoplay; encrypted-media; fullscreen"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                            <Play className="h-16 w-16 opacity-50 mb-4" />
                            <p className="text-lg font-medium">Stream not available</p>
                            <p className="text-sm text-slate-400">Check back later for live coverage</p>
                        </div>
                    )}

                    {/* Live Badge */}
                    {isLive && (
                        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
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
                            {event.description && (
                                <div className="flex items-start gap-3">
                                    <Trophy className="h-4 w-4 text-emerald-500 mt-1" />
                                    <span className="text-slate-600 dark:text-slate-300">{event.description}</span>
                                </div>
                            )}

                            {event.venue && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-emerald-500 mt-1" />
                                    <span className="text-slate-600 dark:text-slate-300">{event.venue}</span>
                                </div>
                            )}

                            {event.event_date && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-4 w-4 text-emerald-500 mt-1" />
                                    <span className="text-slate-600 dark:text-slate-300">{event.event_date}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Teams */}
                    {event.team_home && event.team_away && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Match</h3>

                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-center flex-1">
                                        <div className="font-semibold text-slate-900 dark:text-white">{event.team_home}</div>
                                        {event.score_home && (
                                            <div className="text-2xl font-bold text-emerald-500 mt-2">{event.score_home}</div>
                                        )}
                                    </div>

                                    <div className="px-4 text-slate-400 font-bold">VS</div>

                                    <div className="text-center flex-1">
                                        <div className="font-semibold text-slate-900 dark:text-white">{event.team_away}</div>
                                        {event.score_away && (
                                            <div className="text-2xl font-bold text-emerald-500 mt-2">{event.score_away}</div>
                                        )}
                                    </div>
                                </div>

                                {event.result && (
                                    <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg py-2">
                                        {event.result}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
