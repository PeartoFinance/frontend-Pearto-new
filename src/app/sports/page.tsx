'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import EventGrid from '@/components/sports/EventGrid';
import EventModal from '@/components/sports/EventModal';
import { SportsEvent } from '@/types/sports';
import { getSportsEvents, getFavoriteIds, addFavoriteSport, removeFavoriteSport } from '@/services/sportsService';
import { Trophy, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SportsPage() {
    const { isAuthenticated } = useAuth();
    const [events, setEvents] = useState<SportsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pinnedIds, setPinnedIds] = useState<number[]>([]);

    // Filter States
    const [filter, setFilter] = useState('All'); // Category
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [leagueFilter, setLeagueFilter] = useState('All');

    const [categories, setCategories] = useState<string[]>(['All']);

    // Fetch events and categories
    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch active categories
            const { getSportsCategories } = await import('@/services/sportsService');
            const cats = await getSportsCategories();
            const catNames = ['All', ...cats.map(c => c.name)];
            setCategories(catNames);

            // Fetch events for selected date
            const data = await getSportsEvents(date);
            setEvents(data);

            // Reset league filter when date changes as leagues might change
            setLeagueFilter('All');
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
    }, [date]); // Re-fetch when date changes

    // Fetch favorite IDs
    useEffect(() => {
        if (isAuthenticated) {
            getFavoriteIds().then(ids => setPinnedIds(ids));
        }
    }, [isAuthenticated]);

    const handleTogglePin = async (eventId: number) => {
        if (!isAuthenticated) return;
        if (pinnedIds.includes(eventId)) {
            await removeFavoriteSport(eventId);
            setPinnedIds(prev => prev.filter(id => id !== eventId));
        } else {
            await addFavoriteSport(eventId);
            setPinnedIds(prev => [...prev, eventId]);
        }
    };

    // Get unique leagues from current events (filtered by category if selected)
    const leagues = useMemo(() => {
        let relevantEvents = events;
        if (filter !== 'All') {
            relevantEvents = events.filter(e => e.sportType === filter);
        }
        return ['All', ...new Set(relevantEvents.map(e => e.league).filter(Boolean))].sort();
    }, [events, filter]);

    // Filter events
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            // Category Filter
            if (filter !== 'All' && e.sportType !== filter) return false;

            // Status Filter
            if (statusFilter !== 'All') {
                if (statusFilter === 'Live' && !e.isLive) return false;
                if (statusFilter === 'Upcoming' && e.status !== 'scheduled') return false;
                if (statusFilter === 'Finished' && e.status !== 'completed') return false;
            }

            // League Filter
            if (leagueFilter !== 'All' && e.league !== leagueFilter) return false;

            return true;
        });
    }, [events, filter, statusFilter, leagueFilter]);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <TickerTape />
                <Header />

                <main className="flex-1 px-4 lg:px-6 py-6 overflow-auto">
                    {/* Header Section */}
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                                    <Trophy className="h-8 w-8 text-emerald-600" />
                                    Live Sports
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Real-time scores and updates across multiple sports.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <button
                                    onClick={fetchEvents}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="flex flex-col gap-4">

                            {/* Horizontal Category Scroll */}
                            <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                                <div className="flex gap-2 min-w-max">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilter(cat)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition whitespace-nowrap ${filter === cat
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Secondary Filters (Status & League) */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Status Toggle */}
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
                                    {['All', 'Live', 'Upcoming', 'Finished'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${statusFilter === status
                                                ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>

                                {/* League Dropdown */}
                                <select
                                    value={leagueFilter}
                                    onChange={(e) => setLeagueFilter(e.target.value)}
                                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-xs"
                                >
                                    <option value="All">All Leagues</option>
                                    {leagues.filter(l => l !== 'All').map(league => (
                                        <option key={league} value={league}>{league}</option>
                                    ))}
                                </select>
                            </div>
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
                        pinnedIds={pinnedIds}
                        onTogglePin={handleTogglePin}
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
