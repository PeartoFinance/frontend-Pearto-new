'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Pin, PinOff, Bell, BellOff, Trophy, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSportEmoji } from '@/data/sportsConfig';
import {
    getFavoriteSports,
    removeFavoriteSport,
    updateFavoriteNotifications,
    getLiveSportsEvents,
    getSportsEvents,
    batchRefreshEvents,
    FavoriteSport,
} from '@/services/sportsService';
import type { SportsEvent } from '@/types/sports';

// Match EventModal intervals
const LIVE_REFRESH_INTERVAL = 15_000;      // 15s for live events (same as EventModal)
const SCHEDULED_REFRESH_INTERVAL = 30_000; // 30s for scheduled events (same as EventModal)
const DISCOVERY_INTERVAL = 60_000;         // re-discover events every 60s

interface TickerEventItem {
    favoriteId: number;
    eventId: number;
    event: SportsEvent;
    notifyEmail: boolean;
    notifyPush: boolean;
    isFavorite: boolean;
}

export default function SportsTicker() {
    const { isAuthenticated } = useAuth();
    const [items, setItems] = useState<TickerEventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'favorites' | 'live'>('live');
    const [popover, setPopover] = useState<number | null>(null);
    const loadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const itemsRef = useRef<TickerEventItem[]>([]);

    // Initial load: discover which events to show
    const fetchData = useCallback(async () => {
        try {
            let mapped: TickerEventItem[] = [];

            // If authenticated, try favorites first
            if (isAuthenticated) {
                const favs = await getFavoriteSports();
                if (favs.length > 0) {
                    mapped = favs
                        .filter((f: FavoriteSport) => f.event)
                        .map((f: FavoriteSport) => ({
                            favoriteId: f.id,
                            eventId: f.eventId,
                            event: f.event as SportsEvent,
                            notifyEmail: f.notifyEmail,
                            notifyPush: f.notifyPush,
                            isFavorite: true,
                        }));
                    if (mapped.length > 0) {
                        setMode('favorites');
                        setItems(mapped);
                        itemsRef.current = mapped;
                        return;
                    }
                }
            }

            // Fallback: show live sports (or today's events if no live)
            let liveEvents = await getLiveSportsEvents();
            if (liveEvents.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                const todayEvents = await getSportsEvents(today);
                liveEvents = todayEvents.slice(0, 10);
            }

            if (liveEvents.length > 0) {
                mapped = liveEvents.slice(0, 15).map((e: SportsEvent) => ({
                    favoriteId: 0,
                    eventId: e.id,
                    event: e,
                    notifyEmail: false,
                    notifyPush: false,
                    isFavorite: false,
                }));
                setMode('live');
                setItems(mapped);
                itemsRef.current = mapped;
            } else {
                setItems([]);
                itemsRef.current = [];
            }
        } catch (err) {
            console.error('Failed to fetch sports ticker data:', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Score refresh: batch-refresh all non-completed events in one call
    // The backend groups by sport+date and makes ONE external API call per group
    // Completed events keep their final score and are never re-fetched
    const refreshScores = useCallback(async () => {
        const current = itemsRef.current;
        if (current.length === 0) return;

        // Only refresh events that are NOT completed — completed = final, no need to re-fetch
        const refreshable = current.filter(
            i => i.event.status !== 'completed' && i.event.status !== 'postponed'
        );
        if (refreshable.length === 0) return;

        try {
            // Single batch call — backend handles grouping & external API efficiency
            const refreshedEvents = await batchRefreshEvents(
                refreshable.map(i => i.eventId)
            );

            if (refreshedEvents.length > 0) {
                const freshMap = new Map<number, SportsEvent>();
                for (const ev of refreshedEvents) {
                    freshMap.set(ev.id, ev);
                }

                setItems(prev => {
                    const updated = prev.map(item => {
                        const fresh = freshMap.get(item.eventId);
                        if (!fresh) return item;
                        // Only create new object if data actually changed
                        if (
                            fresh.scoreHome !== item.event.scoreHome ||
                            fresh.scoreAway !== item.event.scoreAway ||
                            fresh.status !== item.event.status ||
                            fresh.isLive !== item.event.isLive
                        ) {
                            return { ...item, event: fresh };
                        }
                        return item;
                    });
                    itemsRef.current = updated;
                    return updated;
                });
            }
        } catch (err) {
            console.error('Failed to refresh ticker scores:', err);
        }
    }, []);

    // Initial load + periodic re-discovery
    useEffect(() => {
        fetchData();
        loadIntervalRef.current = setInterval(fetchData, DISCOVERY_INTERVAL);
        return () => {
            if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
        };
    }, [fetchData]);

    // Score refresh — use faster interval when live events exist, slower for scheduled-only
    // Completed events are never refreshed (handled inside refreshScores)
    const hasLive = useMemo(
        () => items.some(i => i.event.isLive || i.event.status === 'live'),
        [items]
    );
    const hasRefreshable = useMemo(
        () => items.some(i => i.event.status !== 'completed' && i.event.status !== 'postponed'),
        [items]
    );

    useEffect(() => {
        if (!hasRefreshable) return; // All events are finished — nothing to refresh
        const interval = hasLive ? LIVE_REFRESH_INTERVAL : SCHEDULED_REFRESH_INTERVAL;
        // Immediate first refresh, then periodic
        refreshScores();
        const id = setInterval(refreshScores, interval);
        refreshIntervalRef.current = id;
        return () => clearInterval(id);
    }, [hasRefreshable, hasLive, refreshScores]);

    // Close popover on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setPopover(null);
            }
        }
        if (popover !== null) {
            document.addEventListener('mousedown', handleClick);
        }
        return () => document.removeEventListener('mousedown', handleClick);
    }, [popover]);

    const handleUnpin = useCallback(async (eventId: number) => {
        await removeFavoriteSport(eventId);
        setItems(prev => {
            const updated = prev.filter(i => i.eventId !== eventId);
            itemsRef.current = updated;
            return updated;
        });
        setPopover(null);
    }, []);

    const handleToggleNotif = useCallback(async (eventId: number, field: 'notifyEmail' | 'notifyPush') => {
        const item = items.find(i => i.eventId === eventId);
        if (!item) return;
        const newVal = field === 'notifyEmail' ? !item.notifyEmail : !item.notifyPush;
        const prefs = field === 'notifyEmail' ? { notifyEmail: newVal } : { notifyPush: newVal };
        await updateFavoriteNotifications(eventId, prefs);
        setItems(prev =>
            prev.map(i =>
                i.eventId === eventId ? { ...i, [field]: newVal } : i
            )
        );
    }, [items]);

    // Render ticker items
    const tickerItems = useMemo(() => {
        return items.map(item => {
            const e = item.event;
            const isLive = e.isLive || e.status === 'live';
            const isCompleted = e.status === 'completed';
            const emoji = getSportEmoji(e.sportType);
            const score = e.scoreHome != null && e.scoreAway != null
                ? `${e.scoreHome} - ${e.scoreAway}`
                : e.status === 'scheduled'
                    ? 'Upcoming'
                    : '—';

            return {
                ...item,
                isLive,
                isCompleted,
                emoji,
                score,
                label: `${e.teamHome || ''} vs ${e.teamAway || ''}`.trim() || e.name,
            };
        });
    }, [items]);

    // Don't render if truly nothing
    if (!loading && items.length === 0) {
        return null;
    }

    if (loading) {
        return null;
    }

    const headerLabel = mode === 'favorites' ? 'My Sports' : 'Live Sports';

    const renderTickerItem = (item: typeof tickerItems[0], keyPrefix = '') => (
        <div
            key={`${keyPrefix}${item.eventId}`}
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer group relative"
            onClick={() => item.isFavorite ? setPopover(popover === item.eventId ? null : item.eventId) : null}
        >
            <span className="text-sm">{item.emoji}</span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">{item.event.sportType}</span>
            <span className="font-medium text-slate-800 dark:text-white/90">{item.label}</span>
            <span className={`font-bold ${item.isLive ? 'text-emerald-500 dark:text-emerald-400' : item.isCompleted ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-white/70'}`}>
                {item.score}
            </span>
            {item.isLive && (
                <span className="flex items-center gap-1 bg-red-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    LIVE
                </span>
            )}
            {item.isCompleted && (
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                    FT
                </span>
            )}
            {item.isFavorite && (
                <Pin className="h-3 w-3 text-yellow-500/60 group-hover:text-yellow-500 transition-colors" />
            )}

            {/* Popover for favorites only */}
            {item.isFavorite && popover === item.eventId && (
                <div
                    ref={popoverRef}
                    className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-3 text-left"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2 truncate">
                        {item.event.name}
                    </div>
                    <div className="space-y-2">
                        <button
                            onClick={() => handleToggleNotif(item.eventId, 'notifyEmail')}
                            className="flex items-center gap-2 w-full text-xs text-slate-600 dark:text-slate-300 hover:text-blue-500 transition"
                        >
                            {item.notifyEmail ? <Bell className="h-3.5 w-3.5 text-blue-500" /> : <BellOff className="h-3.5 w-3.5 text-slate-400" />}
                            Email Notifications {item.notifyEmail ? 'On' : 'Off'}
                        </button>
                        <button
                            onClick={() => handleToggleNotif(item.eventId, 'notifyPush')}
                            className="flex items-center gap-2 w-full text-xs text-slate-600 dark:text-slate-300 hover:text-blue-500 transition"
                        >
                            {item.notifyPush ? <Bell className="h-3.5 w-3.5 text-emerald-500" /> : <BellOff className="h-3.5 w-3.5 text-slate-400" />}
                            Push Notifications {item.notifyPush ? 'On' : 'Off'}
                        </button>
                        <hr className="border-slate-200 dark:border-slate-700" />
                        <button
                            onClick={() => handleUnpin(item.eventId)}
                            className="flex items-center gap-2 w-full text-xs text-red-500 hover:text-red-600 transition"
                        >
                            <PinOff className="h-3.5 w-3.5" />
                            Unpin Event
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1.5 text-xs font-medium overflow-hidden border-b border-slate-200 dark:border-slate-800 relative">
            {/* Fixed label */}
            <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 dark:to-transparent">
                <Trophy className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">{headerLabel}</span>
            </div>

            {/* Scrolling content */}
            <div className="flex items-center gap-6 animate-sports-marquee hover:pause-animation pl-28">
                {tickerItems.map((item) => renderTickerItem(item))}
                {/* Duplicate for seamless loop */}
                {tickerItems.map((item) => renderTickerItem(item, 'dup-'))}
            </div>

            {/* Marquee animation */}
            <style jsx>{`
                @keyframes sports-marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-sports-marquee {
                    animation: sports-marquee 40s linear infinite;
                }
                .animate-sports-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
