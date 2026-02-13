'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Play, ExternalLink, MapPin, Calendar, Trophy, RefreshCw, Pin, PinOff, Bell, BellOff } from 'lucide-react';
import { SportsEvent } from '@/types/sports';
import { getSportEmoji } from '@/data/sportsConfig';
import { getSportsEventById, addFavoriteSport, removeFavoriteSport, getFavoriteIds } from '@/services/sportsService';
import VideoPlayer from '@/components/common/VideoPlayer';
import { useAuth } from '@/context/AuthContext';

interface EventModalProps {
    event: SportsEvent | null;
    isOpen: boolean;
    onClose: () => void;
}

const LIVE_REFRESH_INTERVAL = 15_000; // 15 seconds for live events
const DEFAULT_REFRESH_INTERVAL = 30_000; // 30 seconds for other events

export default function EventModal({ event: initialEvent, isOpen, onClose }: EventModalProps) {
    const { isAuthenticated } = useAuth();
    const [event, setEvent] = useState<SportsEvent | null>(initialEvent);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [isPinned, setIsPinned] = useState(false);
    const [pinLoading, setPinLoading] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Sync with prop when modal opens or event changes
    useEffect(() => {
        setEvent(initialEvent);
    }, [initialEvent]);

    // Check if event is pinned
    useEffect(() => {
        if (!isAuthenticated || !initialEvent?.id || !isOpen) {
            setIsPinned(false);
            return;
        }
        getFavoriteIds().then(ids => {
            setIsPinned(ids.includes(initialEvent.id));
        });
    }, [isAuthenticated, initialEvent?.id, isOpen]);

    const handleTogglePin = useCallback(async () => {
        if (!event?.id || !isAuthenticated) return;
        setPinLoading(true);
        try {
            if (isPinned) {
                await removeFavoriteSport(event.id);
                setIsPinned(false);
            } else {
                await addFavoriteSport(event.id);
                setIsPinned(true);
            }
        } catch (err) {
            console.error('Failed to toggle pin:', err);
        } finally {
            setPinLoading(false);
        }
    }, [event?.id, isPinned, isAuthenticated]);

    const refreshEvent = useCallback(async () => {
        if (!event?.id) return;
        setRefreshing(true);
        try {
            const fresh = await getSportsEventById(event.id);
            if (fresh) {
                setEvent(fresh);
                setLastRefreshed(new Date());
            }
        } catch (err) {
            console.error('Failed to refresh event:', err);
        } finally {
            setRefreshing(false);
        }
    }, [event?.id]);

    // Auto-refresh for ALL open events (faster for live)
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (isOpen && event?.id) {
            const isLiveEvent = event?.isLive || event?.status === 'live';
            const interval = isLiveEvent ? LIVE_REFRESH_INTERVAL : DEFAULT_REFRESH_INTERVAL;
            intervalRef.current = setInterval(refreshEvent, interval);
            // Also do an initial fetch when modal opens
            refreshEvent();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isOpen, event?.isLive, event?.status, event?.id, refreshEvent]);

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
                    <div className="flex items-center gap-2">
                        {/* Pin/Favorite Button */}
                        {isAuthenticated && (
                            <button
                                onClick={handleTogglePin}
                                disabled={pinLoading}
                                className={`p-2 rounded-full transition ${isPinned ? 'bg-yellow-400/30 hover:bg-yellow-400/40' : 'hover:bg-white/20'}`}
                                title={isPinned ? 'Unpin from ticker' : 'Pin to ticker'}
                            >
                                {isPinned ? (
                                    <Pin className={`h-4 w-4 text-yellow-300 ${pinLoading ? 'animate-pulse' : ''}`} />
                                ) : (
                                    <PinOff className={`h-4 w-4 ${pinLoading ? 'animate-pulse' : ''}`} />
                                )}
                            </button>
                        )}
                        <button
                            onClick={refreshEvent}
                            disabled={refreshing}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                            title="Refresh scores"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Video Player - only show if stream URL exists */}
                {event.streamUrl ? (
                    <div className="aspect-video bg-slate-900 relative">
                        <VideoPlayer
                            url={event.streamUrl}
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

                        {/* Auto-refresh indicator */}
                        <div className="absolute top-4 right-4 text-white/60 text-xs bg-black/40 px-2 py-1 rounded flex items-center gap-1.5">
                            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                            {isLive ? 'Live · refreshing every 15s' : 'Auto-refreshing every 30s'}
                        </div>
                    </div>
                ) : (
                    /* No stream - show compact status bar instead */
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                            {isLive && (
                                <span className="flex items-center gap-1.5 bg-red-500 text-white font-bold px-2.5 py-1 rounded-full animate-pulse">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                    LIVE
                                </span>
                            )}
                        </div>
                        <div className="text-white/60 flex items-center gap-1.5">
                            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                            {isLive ? 'Live · refreshing every 15s' : 'Auto-refreshing every 30s'}
                        </div>
                    </div>
                )}

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

                            <div className="text-xs text-slate-400 mt-2">
                                {isPinned && (
                                    <span className="inline-flex items-center gap-1 text-yellow-500 mr-3">
                                        <Pin className="h-3 w-3" /> Pinned to ticker
                                    </span>
                                )}
                                {lastRefreshed
                                    ? `Last refreshed: ${lastRefreshed.toLocaleTimeString()}`
                                    : event.updatedAt
                                        ? `Last updated: ${new Date(event.updatedAt).toLocaleTimeString()}`
                                        : ''}
                            </div>
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
