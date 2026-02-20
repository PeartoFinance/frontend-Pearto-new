'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

export type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo';

const INTERVALS: { id: Interval; label: string }[] = [
    { id: '1m', label: '1 min' },
    { id: '5m', label: '5 min' },
    { id: '15m', label: '15 min' },
    { id: '30m', label: '30 min' },
    { id: '1h', label: '1 hour' },
    { id: '1d', label: '1 day' },
    { id: '1wk', label: '1 week' },
    { id: '1mo', label: '1 month' }
];

interface IntervalSelectorProps {
    interval: Interval;
    onIntervalChange: (interval: Interval) => void;
}

export default function IntervalSelector({ interval, onIntervalChange }: IntervalSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative shrink-0" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 rounded-lg text-xs font-medium transition-all duration-200"
            >
                <Clock size={13} className="text-slate-400" />
                {INTERVALS.find(i => i.id === interval)?.label || interval}
                <ChevronDown size={12} className="text-slate-500" />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1.5 left-0 bg-[#141a2e] border border-slate-700/50 rounded-xl shadow-2xl shadow-black/40 z-[100] py-1.5 min-w-36 backdrop-blur-xl">
                    {INTERVALS.map(i => (
                        <button
                            key={i.id}
                            onClick={() => {
                                onIntervalChange(i.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-white/5 transition-colors ${interval === i.id ? 'text-blue-400 bg-blue-400/5' : 'text-slate-300'}`}
                        >
                            {i.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
