'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { MapPin, Clock, Plus, Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface Activity {
    id: string;
    name: string;
    time: string;
    location: string;
    notes: string;
}

interface Day {
    id: string;
    label: string;
    activities: Activity[];
    expanded: boolean;
}

let nextId = 1;
const uid = () => String(nextId++);

export default function TravelItinerary() {
    const [tripName, setTripName] = useState('My Trip');
    const [days, setDays] = useState<Day[]>([
        {
            id: uid(),
            label: 'Day 1',
            expanded: true,
            activities: [
                { id: uid(), name: 'Arrive & Check-in', time: '14:00', location: 'Hotel', notes: '' },
            ],
        },
    ]);

    const addDay = () => {
        setDays(prev => [
            ...prev,
            { id: uid(), label: `Day ${prev.length + 1}`, expanded: true, activities: [] },
        ]);
    };

    const removeDay = (dayId: string) => {
        setDays(prev => prev.filter(d => d.id !== dayId).map((d, i) => ({ ...d, label: `Day ${i + 1}` })));
    };

    const toggleDay = (dayId: string) => {
        setDays(prev => prev.map(d => d.id === dayId ? { ...d, expanded: !d.expanded } : d));
    };

    const addActivity = (dayId: string) => {
        setDays(prev =>
            prev.map(d =>
                d.id === dayId
                    ? { ...d, activities: [...d.activities, { id: uid(), name: '', time: '09:00', location: '', notes: '' }] }
                    : d
            )
        );
    };

    const updateActivity = (dayId: string, actId: string, field: keyof Activity, value: string) => {
        setDays(prev =>
            prev.map(d =>
                d.id === dayId
                    ? { ...d, activities: d.activities.map(a => a.id === actId ? { ...a, [field]: value } : a) }
                    : d
            )
        );
    };

    const removeActivity = (dayId: string, actId: string) => {
        setDays(prev =>
            prev.map(d =>
                d.id === dayId
                    ? { ...d, activities: d.activities.filter(a => a.id !== actId) }
                    : d
            )
        );
    };

    const totalActivities = useMemo(() => days.reduce((s, d) => s + d.activities.length, 0), [days]);

    return (
        <CalculatorLayout
            title="Travel Itinerary"
            description="Plan your trip day-by-day with activities, times, and locations"
            category="Travel"
            insights={[
                { label: 'Trip', value: tripName },
                { label: 'Days', value: `${days.length}`, color: 'text-blue-600' },
                { label: 'Activities', value: `${totalActivities}`, color: 'text-emerald-600' },
                { label: 'Avg/Day', value: days.length ? (totalActivities / days.length).toFixed(1) : '0', color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-4">
                    <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Your Itinerary</p>
                        <p className="text-2xl font-bold text-blue-600">{tripName}</p>
                        <p className="text-sm text-slate-500 mt-1">{days.length} day{days.length !== 1 ? 's' : ''} &middot; {totalActivities} activities</p>
                    </div>

                    {days.map((day) => (
                        <div key={day.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-sm font-bold text-slate-700 dark:text-white">{day.label}</span>
                                <span className="text-xs text-slate-400">{day.activities.length} activities</span>
                            </div>
                            {day.activities.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-400">No activities yet</div>
                            ) : (
                                <div className="relative pl-8 pr-4 py-3 space-y-0">
                                    {/* Timeline line */}
                                    <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-blue-200 dark:bg-blue-800" />
                                    {day.activities
                                        .slice()
                                        .sort((a, b) => a.time.localeCompare(b.time))
                                        .map((act) => (
                                            <div key={act.id} className="relative flex items-start gap-3 py-2">
                                                <div className="absolute -left-3 top-3 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800 z-10" />
                                                <div className="flex-1 ml-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                                                            {act.time}
                                                        </span>
                                                        <span className="text-sm font-semibold text-slate-800 dark:text-white">
                                                            {act.name || 'Untitled'}
                                                        </span>
                                                    </div>
                                                    {act.location && (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <MapPin size={10} className="text-slate-400" />
                                                            <span className="text-xs text-slate-500">{act.location}</span>
                                                        </div>
                                                    )}
                                                    {act.notes && (
                                                        <p className="text-xs text-slate-400 mt-0.5">{act.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Trip Name</label>
                    <input
                        type="text"
                        value={tripName}
                        onChange={e => setTripName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                </div>

                {days.map((day) => (
                    <div key={day.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 cursor-pointer" onClick={() => toggleDay(day.id)}>
                            <div className="flex items-center gap-2">
                                {day.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{day.label}</span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full">{day.activities.length}</span>
                            </div>
                            {days.length > 1 && (
                                <button onClick={(e) => { e.stopPropagation(); removeDay(day.id); }} className="text-red-400 hover:text-red-600 transition">
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                        {day.expanded && (
                            <div className="p-3 space-y-3">
                                {day.activities.map((act) => (
                                    <div key={act.id} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                                        <div className="flex gap-2">
                                            <input type="time" value={act.time} onChange={e => updateActivity(day.id, act.id, 'time', e.target.value)}
                                                className="w-24 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                                            <input type="text" value={act.name} onChange={e => updateActivity(day.id, act.id, 'name', e.target.value)}
                                                placeholder="Activity name" className="flex-1 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                                            <button onClick={() => removeActivity(day.id, act.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="text" value={act.location} onChange={e => updateActivity(day.id, act.id, 'location', e.target.value)}
                                                placeholder="Location" className="flex-1 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                                            <input type="text" value={act.notes} onChange={e => updateActivity(day.id, act.id, 'notes', e.target.value)}
                                                placeholder="Notes" className="flex-1 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addActivity(day.id)}
                                    className="w-full py-2 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-dashed border-blue-300 dark:border-blue-700 transition flex items-center justify-center gap-1">
                                    <Plus size={12} /> Add Activity
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                <button onClick={addDay}
                    className="w-full py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700 transition flex items-center justify-center gap-1">
                    <Plus size={14} /> Add Day
                </button>
            </div>
        </CalculatorLayout>
    );
}
