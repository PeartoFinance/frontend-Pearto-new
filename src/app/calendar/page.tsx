'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { getEconomicCalendar, EconomicEvent } from '@/services/marketService';
import { Loader2, Calendar as CalendarIcon, ArrowLeft, Filter, Globe } from 'lucide-react';
import { toast } from 'sonner';
import Footer from '@/components/layout/Footer';

export default function EconomicCalendarPage() {
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        try {
            // Default to fetching upcoming events (backend handles default date range)
            const data = await getEconomicCalendar();
            setEvents(data);
        } catch (err) {
            console.error('Failed to load economic calendar:', err);
            setError('Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    };

    const getImportanceColor = (importance: string) => {
        switch (importance.toLowerCase()) {
            case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
            case 'medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
            default: return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] p-4 lg:p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <Link
                                    href="/markets"
                                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-2 transition-colors"
                                >
                                    <ArrowLeft size={16} /> Back to Markets
                                </Link>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <CalendarIcon className="w-8 h-8 text-blue-600" />
                                    Economic Calendar
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Upcoming global economic events, earnings, and key indicators.
                                </p>
                            </div>
                        </div>

                        {/* Events Table */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <h2 className="font-semibold text-slate-900 dark:text-white">Upcoming Events</h2>
                                <button
                                    onClick={() => toast.info('Calendar filters coming soon!')}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                                >
                                    <Filter size={16} /> Filter
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="p-10 text-center text-red-500">
                                    {error}
                                </div>
                            ) : events.length === 0 ? (
                                <div className="p-10 text-center text-slate-500">
                                    No upcoming events found.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                            <tr>
                                                <th className="px-6 py-3">Time</th>
                                                <th className="px-6 py-3">Country</th>
                                                <th className="px-6 py-3">Event</th>
                                                <th className="px-6 py-3 text-center">Imp.</th>
                                                <th className="px-6 py-3 text-right">Actual</th>
                                                <th className="px-6 py-3 text-right">Forecast</th>
                                                <th className="px-6 py-3 text-right">Previous</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {events.map((event) => (
                                                <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                        {event.eventDate ? new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                                                        <div className="text-xs text-slate-400">
                                                            {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : ''}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                                                            <Globe size={14} className="text-slate-400" />
                                                            {event.country}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                        {event.title}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${getImportanceColor(event.importance)}`}>
                                                            {event.importance}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">
                                                        {event.actual || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">
                                                        {event.forecast || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">
                                                        {event.previous || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              <Footer />
      </main>
        </div>
    );
}
