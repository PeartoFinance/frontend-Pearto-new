'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import EventGrid from '@/components/sports/EventGrid';
import EventModal from '@/components/sports/EventModal';
import { SportsEvent } from '@/types/sports';
import { get } from '@/services/api';
import { Trophy, RefreshCw } from 'lucide-react';

export default function SportsPage() {
    const [events, setEvents] = useState<SportsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
    const [filter, setFilter] = useState('All');
    const [error, setError] = useState<string | null>(null);

    // Fetch events
    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await get<SportsEvent[]>('/media/sports-events');
            setEvents(data);
        } catch (err) {
            console.error('Failed to fetch sports events:', err);
            setError('Failed to load sports events. Please try again.');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Get unique categories
    const categories = useMemo(() => {
        return ['All', ...new Set(events.map(e => e.category).filter(Boolean))];
    }, [events]);

    // Filter events
    const filteredEvents = useMemo(() => {
        if (filter === 'All') return events;
        return events.filter(e => e.category === filter);
    }, [events, filter]);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Header />

                <main className="flex-1 px-4 lg:px-6 py-6 overflow-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                                    <Trophy className="h-8 w-8 text-emerald-600" />
                                    Live Sports
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
                                    Watch live cricket, football, and other sports events. Real-time updates and match statistics.
                                </p>
                            </div>

                            <button
                                onClick={fetchEvents}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${filter === cat
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-white/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Events Grid */}
                    <EventGrid
                        events={filteredEvents}
                        loading={loading}
                        onSelectEvent={setSelectedEvent}
                    />
                </main>

                {/* Event Modal */}
                <EventModal
                    event={selectedEvent}
                    isOpen={!!selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            </div>
        </div>
    );
}
