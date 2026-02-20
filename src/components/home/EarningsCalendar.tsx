'use client';

import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Clock, Sun, Moon } from 'lucide-react';
import api from '@/services/api';
import PriceDisplay from '@/components/common/PriceDisplay';
import Link from 'next/link';

interface EarningsEvent {
    symbol: string;
    companyName: string;
    earningsDate: string;
    epsEstimate: number | null;
    epsActual: number | null;
    surprisePercent: number | null;
    revenueEstimate: number | null;
    revenueActual: number | null;
    marketCap: number | null;
    timing: string | null;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDayOfWeek(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function isToday(dateStr: string): boolean {
    const d = new Date(dateStr);
    const today = new Date();
    return d.toDateString() === today.toDateString();
}

function isTomorrow(dateStr: string): boolean {
    const d = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.toDateString() === tomorrow.toDateString();
}

function isPast(dateStr: string): boolean {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
}

export default function EarningsCalendar() {
    const [events, setEvents] = useState<EarningsEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/live/earnings-calendar?limit=15');
                const data = Array.isArray(res) ? res : (res as any)?.data || [];
                setEvents(data);
            } catch (err) {
                console.error('Failed to load earnings calendar:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Group events by date
    const grouped: Record<string, EarningsEvent[]> = {};
    events.forEach(e => {
        if (!e.earningsDate) return;
        if (!grouped[e.earningsDate]) grouped[e.earningsDate] = [];
        grouped[e.earningsDate].push(e);
    });

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-teal-500" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Earnings Calendar</h3>
                </div>
                <Link
                    href="/calendar"
                    className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                >
                    Full Calendar →
                </Link>
            </div>

            {loading ? (
                <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                                <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="p-8 text-center">
                    <Calendar size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm text-slate-400">No upcoming earnings reports</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(grouped).map(([dateStr, dateEvents]) => (
                        <div key={dateStr}>
                            {/* Date header */}
                            <div className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 ${isToday(dateStr) ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400' : isPast(dateStr) ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500'}`}>
                                <Clock size={12} />
                                {isToday(dateStr) ? '📅 Today' : isTomorrow(dateStr) ? '📅 Tomorrow' : `${formatDayOfWeek(dateStr)}, ${formatDate(dateStr)}`}
                                <span className="ml-auto text-[10px] opacity-60">{dateEvents.length} report{dateEvents.length > 1 ? 's' : ''}</span>
                            </div>

                            {/* Events */}
                            {dateEvents.map((event) => {
                                const hasResults = event.epsActual != null;
                                const beat = (event.surprisePercent ?? 0) > 0;

                                return (
                                    <Link
                                        key={`${event.symbol}-${dateStr}`}
                                        href={`/stocks/${event.symbol}`}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        {/* Symbol badge */}
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                                            {event.symbol.slice(0, 4)}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-slate-900 dark:text-white">{event.symbol}</span>
                                                {event.timing && (
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                                        {event.timing.toLowerCase().includes('before') ? <Sun size={10} /> : <Moon size={10} />}
                                                        {event.timing.toLowerCase().includes('before') ? 'BMO' : 'AMC'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 truncate">{event.companyName}</p>
                                        </div>

                                        {/* EPS */}
                                        <div className="text-right">
                                            {hasResults ? (
                                                <>
                                                    <div className="flex items-center gap-1 justify-end">
                                                        {beat ? (
                                                            <TrendingUp size={12} className="text-emerald-500" />
                                                        ) : (
                                                            <TrendingDown size={12} className="text-red-500" />
                                                        )}
                                                        <span className={`text-sm font-bold ${beat ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            ${event.epsActual?.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">
                                                        Est: ${event.epsEstimate?.toFixed(2)}
                                                        {event.surprisePercent != null && (
                                                            <span className={beat ? 'text-emerald-500' : 'text-red-400'}>
                                                                {' '}({event.surprisePercent > 0 ? '+' : ''}{event.surprisePercent.toFixed(1)}%)
                                                            </span>
                                                        )}
                                                    </span>
                                                </>
                                            ) : event.epsEstimate != null ? (
                                                <>
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                        Est: ${event.epsEstimate.toFixed(2)}
                                                    </span>
                                                    <p className="text-[10px] text-slate-400">Pending</p>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
