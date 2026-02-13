'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trophy, Pin, PinOff, Bell, BellOff, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { getSportEmoji } from '@/data/sportsConfig';
import {
    getFavoriteSports,
    removeFavoriteSport,
    updateFavoriteNotifications,
    FavoriteSport,
} from '@/services/sportsService';
import type { SportsEvent } from '@/types/sports';

export default function ProfileSportsFavorites() {
    const [favorites, setFavorites] = useState<FavoriteSport[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchFavorites = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getFavoriteSports();
            setFavorites(data);
        } catch (err) {
            console.error('Failed to load favorites:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const handleRemove = async (eventId: number) => {
        setActionLoading(eventId);
        const success = await removeFavoriteSport(eventId);
        if (success) {
            setFavorites(prev => prev.filter(f => f.eventId !== eventId));
        }
        setActionLoading(null);
    };

    const handleToggleNotif = async (eventId: number, field: 'notifyEmail' | 'notifyPush') => {
        const fav = favorites.find(f => f.eventId === eventId);
        if (!fav) return;
        const newVal = field === 'notifyEmail' ? !fav.notifyEmail : !fav.notifyPush;
        const prefs = field === 'notifyEmail' ? { notifyEmail: newVal } : { notifyPush: newVal };
        await updateFavoriteNotifications(eventId, prefs);
        setFavorites(prev =>
            prev.map(f =>
                f.eventId === eventId ? { ...f, [field]: newVal } : f
            )
        );
    };

    const getStatusBadge = (event: SportsEvent) => {
        const isLive = event.isLive || event.status === 'live';
        if (isLive) {
            return (
                <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    LIVE
                </span>
            );
        }
        if (event.status === 'scheduled') {
            return <span className="text-[10px] font-medium text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">Upcoming</span>;
        }
        if (event.status === 'completed') {
            return <span className="text-[10px] font-medium text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded-full">Finished</span>;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-emerald-500 mr-2" size={20} />
                <span className="text-slate-500">Loading your sports favorites...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Trophy className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sports Favorites</h2>
                        <p className="text-sm text-slate-500">Pinned events appear in your sports ticker</p>
                    </div>
                </div>
                <button
                    onClick={fetchFavorites}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Favorites List */}
            {favorites.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                    <Trophy className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No favorites yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Go to the Live Sports page and click the pin icon on any event to add it to your favorites. Pinned events will appear in your sports ticker.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {favorites.map((fav) => {
                        const event = fav.event;
                        if (!event) return null;
                        const emoji = getSportEmoji(event.sportType);
                        const score = event.scoreHome && event.scoreAway
                            ? `${event.scoreHome} - ${event.scoreAway}`
                            : null;

                        return (
                            <div
                                key={fav.id}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-emerald-500/30 transition"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Emoji & Status */}
                                    <div className="flex flex-col items-center gap-2 pt-1">
                                        <span className="text-2xl">{emoji}</span>
                                        {getStatusBadge(event)}
                                    </div>

                                    {/* Event info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{event.name}</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-2">
                                            {event.sportType} • {event.league}
                                        </p>

                                        {/* Teams & Score */}
                                        {event.teamHome && event.teamAway && (
                                            <div className="flex items-center gap-3 text-sm mb-2">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{event.teamHome}</span>
                                                {score ? (
                                                    <span className="font-bold text-emerald-500">{score}</span>
                                                ) : (
                                                    <span className="text-slate-400">vs</span>
                                                )}
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{event.teamAway}</span>
                                            </div>
                                        )}

                                        {/* Date */}
                                        {event.eventDate && (
                                            <p className="text-xs text-slate-400">
                                                {new Date(event.eventDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        {/* Notification toggles */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleToggleNotif(fav.eventId, 'notifyEmail')}
                                                className={`p-1.5 rounded-lg transition ${fav.notifyEmail ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
                                                title={`Email notifications ${fav.notifyEmail ? 'on' : 'off'}`}
                                            >
                                                {fav.notifyEmail ? <Bell size={14} /> : <BellOff size={14} />}
                                            </button>
                                            <button
                                                onClick={() => handleToggleNotif(fav.eventId, 'notifyPush')}
                                                className={`p-1.5 rounded-lg transition ${fav.notifyPush ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
                                                title={`Push notifications ${fav.notifyPush ? 'on' : 'off'}`}
                                            >
                                                {fav.notifyPush ? <Bell size={14} /> : <BellOff size={14} />}
                                            </button>
                                        </div>

                                        {/* Remove button */}
                                        <button
                                            onClick={() => handleRemove(fav.eventId)}
                                            disabled={actionLoading === fav.eventId}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        >
                                            {actionLoading === fav.eventId ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={12} />
                                            )}
                                            Unpin
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary */}
            {favorites.length > 0 && (
                <div className="text-xs text-slate-400 text-center">
                    {favorites.length} pinned event{favorites.length !== 1 ? 's' : ''} • Pinned events appear in your sports ticker at the top of every page
                </div>
            )}
        </div>
    );
}
