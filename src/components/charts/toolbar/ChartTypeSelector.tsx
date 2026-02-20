'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, BarChart2, Mountain, TrendingUp, Activity } from 'lucide-react';

export type ChartType = 'candle' | 'area' | 'line' | 'bar';

const CHART_TYPES: { id: ChartType; icon: React.ElementType; label: string }[] = [
    { id: 'candle', icon: BarChart2, label: 'Candlestick' },
    { id: 'area', icon: Mountain, label: 'Mountain' },
    { id: 'line', icon: TrendingUp, label: 'Line' },
    { id: 'bar', icon: Activity, label: 'OHLC Bars' }
];

interface ChartTypeSelectorProps {
    chartType: ChartType;
    onChartTypeChange: (type: ChartType) => void;
}

export default function ChartTypeSelector({ chartType, onChartTypeChange }: ChartTypeSelectorProps) {
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

    const activeChartType = CHART_TYPES.find(c => c.id === chartType) || CHART_TYPES[0];
    const ActiveIcon = activeChartType.icon;

    return (
        <div className="relative shrink-0" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 rounded-lg text-xs font-medium transition-all duration-200"
            >
                <ActiveIcon size={13} className="text-slate-400" />
                <span className="hidden sm:inline">{activeChartType.label}</span>
                <ChevronDown size={12} className="text-slate-500" />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1.5 left-0 bg-[#141a2e] border border-slate-700/50 rounded-xl shadow-2xl shadow-black/40 z-[100] py-1.5 min-w-44 backdrop-blur-xl">
                    {CHART_TYPES.map(ct => (
                        <button
                            key={ct.id}
                            onClick={() => {
                                onChartTypeChange(ct.id);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium hover:bg-white/5 transition-colors ${chartType === ct.id ? 'text-blue-400 bg-blue-400/5' : 'text-slate-300'}`}
                        >
                            <ct.icon size={14} />
                            {ct.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
