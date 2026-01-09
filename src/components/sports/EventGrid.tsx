'use client';

import { SportsEvent } from '@/types/sports';
import EventCard from './EventCard';
import { Trophy } from 'lucide-react';

interface EventGridProps {
    events: SportsEvent[];
    loading: boolean;
    onSelectEvent: (event: SportsEvent) => void;
}

export default function EventGrid({ events, loading, onSelectEvent }: EventGridProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3 text-slate-500">
                    <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
                    Loading live sports events...
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-16">
                <Trophy className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No sports events found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    There are currently no live sports events available
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
                <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => onSelectEvent(event)}
                />
            ))}
        </div>
    );
}
