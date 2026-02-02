'use client';

import { useState, useRef, useEffect } from 'react';
import { LayoutGrid, ChevronDown, Grid2X2, Grid3X3, LayoutPanelLeft, LayoutPanelTop, Square } from 'lucide-react';

export type ChartLayout = '1x1' | '1x2' | '2x1' | '2x2' | '2x3' | '3x2';

interface LayoutOption {
    id: ChartLayout;
    label: string;
    icon: React.ReactNode;
    cols: number;
    rows: number;
    totalCharts: number;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
    {
        id: '1x1',
        label: 'Single',
        icon: <Square size={16} />,
        cols: 1,
        rows: 1,
        totalCharts: 1
    },
    {
        id: '1x2',
        label: 'Side by Side',
        icon: <LayoutPanelLeft size={16} />,
        cols: 2,
        rows: 1,
        totalCharts: 2
    },
    {
        id: '2x1',
        label: 'Stacked',
        icon: <LayoutPanelTop size={16} />,
        cols: 1,
        rows: 2,
        totalCharts: 2
    },
    {
        id: '2x2',
        label: '2×2 Grid',
        icon: <Grid2X2 size={16} />,
        cols: 2,
        rows: 2,
        totalCharts: 4
    },
    {
        id: '2x3',
        label: '2×3 Grid',
        icon: <Grid3X3 size={16} />,
        cols: 3,
        rows: 2,
        totalCharts: 6
    },
    {
        id: '3x2',
        label: '3×2 Grid',
        icon: <LayoutGrid size={16} />,
        cols: 2,
        rows: 3,
        totalCharts: 6
    },
];

interface ChartLayoutSelectorProps {
    layout: ChartLayout;
    onLayoutChange: (layout: ChartLayout) => void;
    className?: string;
}

export default function ChartLayoutSelector({ layout, onLayoutChange, className = '' }: ChartLayoutSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLayout = LAYOUT_OPTIONS.find(l => l.id === layout) || LAYOUT_OPTIONS[0];

    // Close dropdown on outside click
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
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm transition"
            >
                {currentLayout.icon}
                <span className="hidden sm:inline">{currentLayout.label}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-30 p-2 min-w-48">
                    <div className="text-xs text-slate-500 uppercase tracking-wider px-2 py-1 mb-1">
                        Chart Layout
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        {LAYOUT_OPTIONS.map(option => (
                            <button
                                key={option.id}
                                onClick={() => {
                                    onLayoutChange(option.id);
                                    setIsOpen(false);
                                }}
                                className={`flex flex-col items-center gap-1 p-3 rounded transition ${layout === option.id
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-slate-700 text-slate-300'
                                    }`}
                            >
                                {/* Visual grid representation */}
                                <div
                                    className="grid gap-0.5"
                                    style={{
                                        gridTemplateColumns: `repeat(${option.cols}, 1fr)`,
                                        gridTemplateRows: `repeat(${option.rows}, 1fr)`,
                                        width: '28px',
                                        height: '20px'
                                    }}
                                >
                                    {Array.from({ length: option.totalCharts }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`rounded-sm ${layout === option.id ? 'bg-white/30' : 'bg-slate-600'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export { LAYOUT_OPTIONS, type LayoutOption };
