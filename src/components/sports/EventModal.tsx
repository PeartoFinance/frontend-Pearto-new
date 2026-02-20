'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
    X, MapPin, Calendar, Trophy, RefreshCw, Pin, PinOff,
    Users, BarChart3, ListOrdered, Swords, TrendingUp, Clock,
    ChevronRight, Target, AlertTriangle,
} from 'lucide-react';
import { SportsEvent } from '@/types/sports';
import type { MatchDetail, MatchEvent, TeamStatistics, TeamLineup, TeamPlayerStats, MatchPrediction } from '@/types/sports';
import { getSportEmoji } from '@/data/sportsConfig';
import {
    getSportsEventById, addFavoriteSport, removeFavoriteSport, getFavoriteIds,
    getMatchDetail, getMatchPrediction,
} from '@/services/sportsService';
import VideoPlayer from '@/components/common/VideoPlayer';
import { useAuth } from '@/context/AuthContext';

interface EventModalProps {
    event: SportsEvent | null;
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'overview' | 'stats' | 'events' | 'lineups' | 'players' | 'prediction';

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

    // Enriched data
    const [detail, setDetail] = useState<MatchDetail | null>(null);
    const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    // Determine sport key from externalId
    const sportKey = useMemo(() => {
        const ext = event?.externalId || '';
        return ext.split('-')[0] || '';
    }, [event?.externalId]);

    const isFootball = sportKey === 'football';

    // Sync with prop when modal opens or event changes
    useEffect(() => {
        setEvent(initialEvent);
        setActiveTab('overview');
        setDetail(null);
        setPrediction(null);
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

    // Fetch enriched detail when modal opens
    useEffect(() => {
        if (!isOpen || !event?.id) return;
        setDetailLoading(true);
        Promise.all([
            getMatchDetail(event.id),
            isFootball ? getMatchPrediction(event.id) : Promise.resolve(null),
        ]).then(([d, p]) => {
            setDetail(d);
            setPrediction(p);
        }).finally(() => setDetailLoading(false));
    }, [isOpen, event?.id, isFootball]);

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
            const [fresh, d] = await Promise.all([
                getSportsEventById(event.id),
                getMatchDetail(event.id),
            ]);
            if (fresh) {
                setEvent(fresh);
                setLastRefreshed(new Date());
            }
            if (d) setDetail(d);
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

    // Determine which tabs to show
    const tabs: { key: Tab; label: string; icon: React.ReactNode; show: boolean }[] = [
        { key: 'overview', label: 'Overview', icon: <Trophy className="h-4 w-4" />, show: true },
        { key: 'stats', label: 'Stats', icon: <BarChart3 className="h-4 w-4" />, show: (detail?.statistics?.length ?? 0) > 0 },
        { key: 'events', label: 'Events', icon: <ListOrdered className="h-4 w-4" />, show: (detail?.events?.length ?? 0) > 0 },
        { key: 'lineups', label: 'Lineups', icon: <Users className="h-4 w-4" />, show: (detail?.lineups?.length ?? 0) > 0 },
        { key: 'players', label: 'Players', icon: <Swords className="h-4 w-4" />, show: (detail?.players?.length ?? 0) > 0 },
        { key: 'prediction', label: 'Prediction', icon: <TrendingUp className="h-4 w-4" />, show: prediction != null },
    ];
    const visibleTabs = tabs.filter(t => t.show);

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
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl">{emoji}</span>
                        <div className="min-w-0">
                            <h2 className="font-bold text-lg truncate">{event.name}</h2>
                            <p className="text-emerald-100 text-sm truncate">{event.sportType} • {event.league}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
                    <div className="aspect-video bg-slate-900 relative shrink-0">
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
                    </div>
                ) : (
                    /* No stream - show compact status bar instead */
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-xs shrink-0">
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

                {/* ── Scoreboard ── */}
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 shrink-0">
                    <div className="flex items-center justify-center gap-6">
                        <div className="text-center flex-1">
                            <div className="font-bold text-slate-900 dark:text-white text-lg">{event.teamHome}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-emerald-500">{event.scoreHome ?? '-'}</span>
                            <span className="text-slate-400 font-bold text-xl">:</span>
                            <span className="text-3xl font-black text-emerald-500">{event.scoreAway ?? '-'}</span>
                        </div>
                        <div className="text-center flex-1">
                            <div className="font-bold text-slate-900 dark:text-white text-lg">{event.teamAway}</div>
                        </div>
                    </div>
                    <div className="text-center mt-1 text-xs text-slate-400">
                        {event.status === 'live' && <span className="text-red-500 font-semibold">LIVE</span>}
                        {event.status === 'completed' && <span className="font-semibold">Full Time</span>}
                        {event.status === 'scheduled' && <span>{formatDate(event.eventDate)}</span>}
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="border-b border-slate-200 dark:border-slate-700 shrink-0 overflow-x-auto">
                    <div className="flex">
                        {visibleTabs.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    activeTab === t.key
                                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab Content (scrollable) ── */}
                <div className="overflow-y-auto flex-1 p-5">
                    {detailLoading && activeTab !== 'overview' && (
                        <div className="flex items-center justify-center py-12 text-slate-400">
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading details…
                        </div>
                    )}

                    {/* API error banner */}
                    {detail?.error && (
                        <div className="mb-4 flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {detail.error}
                        </div>
                    )}

                    {activeTab === 'overview' && <OverviewTab event={event} isPinned={isPinned} lastRefreshed={lastRefreshed} formatDate={formatDate} />}
                    {activeTab === 'stats' && detail && <StatsTab statistics={detail.statistics} />}
                    {activeTab === 'events' && detail && <EventsTab events={detail.events} homeTeam={event.teamHome} />}
                    {activeTab === 'lineups' && detail && <LineupsTab lineups={detail.lineups} />}
                    {activeTab === 'players' && detail && <PlayersTab playerStats={detail.players} />}
                    {activeTab === 'prediction' && prediction && <PredictionTab prediction={prediction} />}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════
   Tab Components
   ═══════════════════════════════════════ */

function OverviewTab({ event, isPinned, lastRefreshed, formatDate }: {
    event: SportsEvent; isPinned: boolean; lastRefreshed: Date | null; formatDate: (d: string | null) => string;
}) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Event Details</h3>
                {event.league && (
                    <div className="flex items-start gap-3">
                        <Trophy className="h-4 w-4 text-emerald-500 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300">{event.league}</span>
                    </div>
                )}
                {event.venue && event.venue !== 'N/A' && (
                    <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-emerald-500 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300">{event.venue}</span>
                    </div>
                )}
                {event.eventDate && (
                    <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-emerald-500 mt-0.5" />
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

            {/* Quick info column */}
            <div className="space-y-3 text-sm">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Match Info</h3>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Sport</span>
                        <span className="text-slate-900 dark:text-white font-medium">{event.sportType}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Status</span>
                        <span className={`font-medium capitalize ${event.isLive ? 'text-red-500' : event.status === 'completed' ? 'text-slate-600 dark:text-slate-400' : 'text-emerald-500'}`}>
                            {event.status}
                        </span>
                    </div>
                    {event.countryCode && (
                        <div className="flex justify-between">
                            <span className="text-slate-500">Country</span>
                            <span className="text-slate-900 dark:text-white font-medium">{event.countryCode}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Stats Tab ── */

function StatsTab({ statistics }: { statistics: TeamStatistics[] }) {
    if (statistics.length < 2) {
        return (
            <div className="space-y-3">
                {statistics.map((ts, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            {ts.logo && <img src={ts.logo} alt="" className="h-5 w-5" />}
                            {ts.team}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(ts.stats).map(([k, v]) => (
                                <div key={k} className="flex justify-between px-2 py-1.5 rounded bg-white dark:bg-slate-700/50">
                                    <span className="text-slate-500 text-xs">{k}</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-xs">{v ?? '-'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Head-to-head comparison layout
    const home = statistics[0];
    const away = statistics[1];
    const allKeys = Array.from(new Set([...Object.keys(home.stats), ...Object.keys(away.stats)]));

    return (
        <div className="space-y-4">
            {/* Team headers */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {home.logo && <img src={home.logo} alt="" className="h-6 w-6" />}
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{home.team}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{away.team}</span>
                    {away.logo && <img src={away.logo} alt="" className="h-6 w-6" />}
                </div>
            </div>

            {/* Comparison bars */}
            <div className="space-y-3">
                {allKeys.map(key => {
                    const hVal = home.stats[key];
                    const aVal = away.stats[key];
                    const hNum = parseFloat(String(hVal ?? 0).replace('%', ''));
                    const aNum = parseFloat(String(aVal ?? 0).replace('%', ''));
                    const total = hNum + aNum || 1;
                    const hPct = (hNum / total) * 100;
                    const aPct = (aNum / total) * 100;

                    return (
                        <div key={key}>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-medium text-slate-900 dark:text-white w-16 text-right">{hVal ?? '-'}</span>
                                <span className="text-slate-500 text-center flex-1 px-2 truncate">{key}</span>
                                <span className="font-medium text-slate-900 dark:text-white w-16">{aVal ?? '-'}</span>
                            </div>
                            <div className="flex h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                                <div className="bg-emerald-500 transition-all" style={{ width: `${hPct}%` }} />
                                <div className="bg-blue-500 transition-all" style={{ width: `${aPct}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Events Timeline Tab (Football) ── */

function EventsTab({ events, homeTeam }: { events: MatchEvent[]; homeTeam: string }) {
    const getIcon = (type: string, detail: string) => {
        if (type === 'Goal') return <Target className="h-4 w-4 text-emerald-500" />;
        if (type === 'Card' && detail?.includes('Yellow')) return <div className="w-3 h-4 bg-yellow-400 rounded-sm" />;
        if (type === 'Card' && detail?.includes('Red')) return <div className="w-3 h-4 bg-red-500 rounded-sm" />;
        if (type === 'subst') return <ChevronRight className="h-4 w-4 text-blue-400" />;
        if (type === 'Var') return <AlertTriangle className="h-4 w-4 text-purple-400" />;
        return <Clock className="h-4 w-4 text-slate-400" />;
    };

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="space-y-3">
                {events.map((ev, idx) => {
                    const isHome = ev.team === homeTeam;
                    return (
                        <div key={idx} className={`flex items-center gap-3 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`flex-1 ${isHome ? 'text-right' : 'text-left'}`}>
                                <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm">
                                    {getIcon(ev.type, ev.detail)}
                                    <div>
                                        <span className="font-medium text-slate-900 dark:text-white">{ev.player || ev.type}</span>
                                        {ev.assist && (
                                            <span className="text-slate-400 text-xs ml-1">(assist: {ev.assist})</span>
                                        )}
                                        <span className="text-slate-400 text-xs block">{ev.detail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Time bubble */}
                            <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center z-10">
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    {ev.time != null ? `${ev.time}'` : '-'}
                                    {ev.extra ? `+${ev.extra}` : ''}
                                </span>
                            </div>

                            <div className="flex-1" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Lineups Tab ── */

function LineupsTab({ lineups }: { lineups: TeamLineup[] }) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {lineups.map((lu, idx) => (
                <div key={idx} className="space-y-3">
                    <div className="flex items-center gap-2">
                        {lu.logo && <img src={lu.logo} alt="" className="h-6 w-6" />}
                        <h4 className="font-semibold text-slate-900 dark:text-white">{lu.team}</h4>
                        {lu.formation && (
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                                {lu.formation}
                            </span>
                        )}
                    </div>
                    {lu.coach && (
                        <p className="text-xs text-slate-400">Coach: {lu.coach}</p>
                    )}

                    {/* Starting XI */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                        <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">Starting XI</h5>
                        <div className="space-y-1">
                            {lu.startXI.map((p, pi) => (
                                <div key={pi} className="flex items-center gap-2 text-sm py-1">
                                    <span className="w-6 text-center font-bold text-emerald-500 text-xs">{p.number ?? '-'}</span>
                                    <span className="text-slate-900 dark:text-white">{p.name}</span>
                                    {p.pos && <span className="text-xs text-slate-400 ml-auto">{p.pos}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Substitutes */}
                    {lu.substitutes.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">Substitutes</h5>
                            <div className="space-y-1">
                                {lu.substitutes.map((p, pi) => (
                                    <div key={pi} className="flex items-center gap-2 text-sm py-1 opacity-75">
                                        <span className="w-6 text-center font-bold text-slate-400 text-xs">{p.number ?? '-'}</span>
                                        <span className="text-slate-700 dark:text-slate-300">{p.name}</span>
                                        {p.pos && <span className="text-xs text-slate-400 ml-auto">{p.pos}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ── Players Stats Tab ── */

function PlayersTab({ playerStats }: { playerStats: TeamPlayerStats[] }) {
    const [expandedTeam, setExpandedTeam] = useState<number>(0);

    return (
        <div className="space-y-4">
            {playerStats.map((ts, idx) => {
                const isExpanded = expandedTeam === idx;
                const statKeys = ts.players.length > 0
                    ? Object.keys(ts.players[0].stats).filter(k => ts.players[0].stats[k] != null).slice(0, 8)
                    : [];

                return (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setExpandedTeam(isExpanded ? -1 : idx)}
                            className="w-full flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition"
                        >
                            <span className="font-semibold text-slate-900 dark:text-white">{ts.team}</span>
                            <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>

                        {isExpanded && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-t border-slate-200 dark:border-slate-700">
                                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 sticky left-0 bg-slate-50 dark:bg-slate-800">Player</th>
                                            {statKeys.map(k => (
                                                <th key={k} className="text-center px-2 py-2 text-xs font-medium text-slate-500 whitespace-nowrap uppercase">{k}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ts.players.map((p, pi) => (
                                            <tr key={pi} className="border-t border-slate-100 dark:border-slate-700/50">
                                                <td className="px-3 py-1.5 whitespace-nowrap font-medium text-slate-900 dark:text-white sticky left-0 bg-slate-50 dark:bg-slate-800">{p.name}</td>
                                                {statKeys.map(k => (
                                                    <td key={k} className="text-center px-2 py-1.5 text-slate-600 dark:text-slate-300">{p.stats[k] ?? '-'}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ── Prediction Tab (Football only) ── */

function PredictionTab({ prediction }: { prediction: MatchPrediction }) {
    return (
        <div className="space-y-6">
            {/* AI Advice */}
            {prediction.advice && (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4" /> Prediction Advice
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300">{prediction.advice}</p>
                </div>
            )}

            {/* Winner + Percentages */}
            <div className="grid sm:grid-cols-3 gap-3">
                {['home', 'draw', 'away'].map(key => {
                    const pct = prediction.percent?.[key];
                    const isWinner = (key === 'home' && prediction.winner?.name === prediction.teams?.home?.name)
                        || (key === 'away' && prediction.winner?.name === prediction.teams?.away?.name);
                    return (
                        <div key={key} className={`text-center rounded-xl p-4 border-2 transition ${
                            isWinner
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                        }`}>
                            <div className="text-xs text-slate-500 uppercase mb-1">
                                {key === 'home' ? prediction.teams?.home?.name : key === 'away' ? prediction.teams?.away?.name : 'Draw'}
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{pct || '-'}</div>
                            {isWinner && (
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                    ★ Predicted Winner
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Under/Over + Goals */}
            <div className="grid sm:grid-cols-2 gap-3">
                {prediction.underOver && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                        <span className="text-xs text-slate-500">Under/Over</span>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{prediction.underOver}</div>
                    </div>
                )}
                {prediction.goals && Object.keys(prediction.goals).length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                        <span className="text-xs text-slate-500">Expected Goals</span>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                            {prediction.goals.home ?? '-'} – {prediction.goals.away ?? '-'}
                        </div>
                    </div>
                )}
            </div>

            {/* Comparison */}
            {prediction.comparison && Object.keys(prediction.comparison).length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Comparison</h4>
                    {Object.entries(prediction.comparison).map(([key, vals]) => {
                        const homeVal = vals?.home || '0%';
                        const awayVal = vals?.away || '0%';
                        const hPct = parseFloat(homeVal.replace('%', ''));
                        const aPct = parseFloat(awayVal.replace('%', ''));

                        return (
                            <div key={key}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="font-medium text-slate-900 dark:text-white">{homeVal}</span>
                                    <span className="text-slate-500 capitalize">{key.replace('_', ' ')}</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{awayVal}</span>
                                </div>
                                <div className="flex h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                                    <div className="bg-emerald-500" style={{ width: `${hPct}%` }} />
                                    <div className="bg-blue-500" style={{ width: `${aPct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Winner comment */}
            {prediction.winner?.comment && (
                <p className="text-sm text-slate-500 italic">&quot;{prediction.winner.comment}&quot;</p>
            )}
        </div>
    );
}
