'use client';

import { SportsEvent } from '@/types/sports';
import { SportCard } from './SportCard';
import { Trophy, Radio, Clock, CheckCircle } from 'lucide-react';
import { SportsEvent as ServiceSportsEvent } from '@/services/sportsService';

interface EventGridProps {
    events: SportsEvent[];
    loading: boolean;
    onSelectEvent: (event: SportsEvent) => void;
    pinnedIds?: number[];
    onTogglePin?: (eventId: number) => void;
    statusFilter?: string;
}

export default function EventGrid({ events, loading, onSelectEvent, pinnedIds = [], onTogglePin, statusFilter = 'All' }: EventGridProps) {
    if (loading) {
        return (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden animate-pulse">
                        <div className="bg-emerald-600/30 h-28" />
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between">
                                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                            </div>
                            <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (events.length === 0) {
        // Contextual empty state based on active filter
        const emptyConfig = {
            Live: {
                icon: <Radio className="h-14 w-14 text-red-300 dark:text-red-500/50 mx-auto mb-3" />,
                title: 'No live events right now',
                desc: 'Check back later or browse scheduled & completed events.',
            },
            Upcoming: {
                icon: <Clock className="h-14 w-14 text-blue-300 dark:text-blue-500/50 mx-auto mb-3" />,
                title: 'No upcoming events',
                desc: 'All events for this date have started or finished.',
            },
            Finished: {
                icon: <CheckCircle className="h-14 w-14 text-slate-300 dark:text-slate-600 mx-auto mb-3" />,
                title: 'No finished events yet',
                desc: 'Events will appear here once they are completed.',
            },
            All: {
                icon: <Trophy className="h-14 w-14 text-slate-300 dark:text-slate-600 mx-auto mb-3" />,
                title: 'No sports events found',
                desc: 'Try changing the date or category filter.',
            },
        };
        const cfg = emptyConfig[statusFilter as keyof typeof emptyConfig] || emptyConfig.All;

        return (
            <div className="text-center py-14">
                {cfg.icon}
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{cfg.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{cfg.desc}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
                <SportCard
                    key={event.id}
                    event={event as ServiceSportsEvent}
                    onClick={() => onSelectEvent(event)}
                    isPinned={pinnedIds.includes(event.id)}
                    onTogglePin={onTogglePin}
                />
            ))}
        </div>
    );
}
