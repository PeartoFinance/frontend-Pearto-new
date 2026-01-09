'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, RefreshCw, Filter, Loader2 } from 'lucide-react';
import { SportsEvent, getSportsEvents } from '@/services/sportsService';
import { allSportTypes, getSportEmoji } from '@/data/sportsConfig';
import SportCard from './SportCard';

interface SportsEventListProps {
    /** Initial filter */
    initialFilter?: string;
    /** Show filter tabs */
    showFilters?: boolean;
    /** Max events to show */
    limit?: number;
    /** Title */
    title?: string;
}

export function SportsEventList({
    initialFilter = 'all',
    showFilters = true,
    limit,
    title = 'Live Sports'
}: SportsEventListProps) {
    const [events, setEvents] = useState<SportsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState(initialFilter);
    const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'scheduled' | 'completed'>('all');

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getSportsEvents();
            setEvents(data);
        } catch (err) {
            console.error('Failed to fetch sports events:', err);
            setError('Failed to load sports events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Get unique sport types from events
    const availableSportTypes = useMemo(() => {
        const types = new Set(events.map(e => e.sportType?.toLowerCase()).filter(Boolean));
        return ['all', ...Array.from(types)];
    }, [events]);

    // Filter events
    const filteredEvents = useMemo(() => {
        let filtered = events;

        // Filter by sport type
        if (activeFilter !== 'all') {
            filtered = filtered.filter(e => e.sportType?.toLowerCase() === activeFilter);
        }

        // Filter by status
        if (statusFilter !== 'all') {
            if (statusFilter === 'live') {
                filtered = filtered.filter(e => e.isLive || e.status === 'live');
            } else {
                filtered = filtered.filter(e => e.status === statusFilter);
            }
        }

        // Apply limit
        if (limit) {
            filtered = filtered.slice(0, limit);
        }

        return filtered;
    }, [events, activeFilter, statusFilter, limit]);

    // Count by status
    const statusCounts = useMemo(() => ({
        all: events.length,
        live: events.filter(e => e.isLive || e.status === 'live').length,
        scheduled: events.filter(e => e.status === 'scheduled').length,
        completed: events.filter(e => e.status === 'completed').length,
    }), [events]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={fetchEvents}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <span className="text-sm text-slate-500">({filteredEvents.length})</span>
                </div>

                <button
                    onClick={fetchEvents}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Status Tabs */}
            {showFilters && (
                <div className="flex flex-wrap gap-2">
                    {(['all', 'live', 'scheduled', 'completed'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 ${statusFilter === status
                                    ? status === 'live'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-emerald-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {status === 'live' && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                            <span className="capitalize">{status}</span>
                            <span className="text-xs opacity-70">({statusCounts[status]})</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Sport Type Filter */}
            {showFilters && (
                <div className="flex flex-wrap gap-2">
                    {availableSportTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveFilter(type)}
                            className={`px-3 py-1.5 text-sm rounded-full transition flex items-center gap-1.5 ${activeFilter === type
                                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            {type !== 'all' && <span>{getSportEmoji(type)}</span>}
                            <span className="capitalize">{type}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Events Found</h3>
                    <p className="text-slate-400">No sports events match your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEvents.map(event => (
                        <SportCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SportsEventList;
