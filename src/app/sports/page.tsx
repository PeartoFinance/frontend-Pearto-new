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

            <div className="flex-1 flex flex-col min-w-0">
                <TickerTape />
                <Header />

                <main className="flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 overflow-auto">
                    {/* Header Section */}
                    <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                                    <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 flex-shrink-0" />
                                    Live Sports
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Real-time scores and updates across multiple sports.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="px-2 sm:px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-0"
                                />
                                <button
                                    onClick={fetchEvents}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-50 flex-shrink-0"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="flex flex-col gap-3">

                            {/* Horizontal Category Scroll */}
                            <div className="w-full overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                                <div className="flex gap-2 min-w-max">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilter(cat)}
                                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition whitespace-nowrap ${filter === cat
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
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                {/* Status Toggle */}
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-fit overflow-x-auto scrollbar-hide">
                                    {['All', 'Live', 'Upcoming', 'Finished'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${statusFilter === status
                                                ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            {status === 'Live' && '🔴 '}{status}
                                        </button>
                                    ))}
                                </div>

                                {/* League Dropdown */}
                                <select
                                    value={leagueFilter}
                                    onChange={(e) => setLeagueFilter(e.target.value)}
                                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:max-w-xs"
                                >
                                    <option value="All">All Leagues</option>
                                    {leagues.filter(l => l !== 'All').map(league => (
                                        <option key={league} value={league}>{league}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Counts */}
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                            {statusFilter !== 'All' && ` (${statusFilter.toLowerCase()})`}
                            {filter !== 'All' && ` in ${filter}`}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
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
                        statusFilter={statusFilter}
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
