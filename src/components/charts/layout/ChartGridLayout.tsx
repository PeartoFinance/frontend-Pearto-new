'use client';

import { useState, useCallback } from 'react';
import ChartLayoutSelector, { type ChartLayout, LAYOUT_OPTIONS } from './ChartLayoutSelector';
import MiniChartPanel from './MiniChartPanel';

interface ChartGridLayoutProps {
    primarySymbol: string;
    chartType?: 'area' | 'candle' | 'line' | 'bar';
    period?: string;
    isLive?: boolean;
    onMaximizePanel?: (symbol: string) => void;
}

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META'];

export default function ChartGridLayout({
    primarySymbol,
    chartType = 'area',
    period = '1D',
    isLive = true,
    onMaximizePanel
}: ChartGridLayoutProps) {
    const [layout, setLayout] = useState<ChartLayout>('1x1');
    const [symbols, setSymbols] = useState<string[]>(() => {
        const initial = [primarySymbol, ...DEFAULT_SYMBOLS.filter(s => s !== primarySymbol)];
        return initial.slice(0, 6);
    });

    const layoutConfig = LAYOUT_OPTIONS.find(l => l.id === layout) || LAYOUT_OPTIONS[0];

    const handleSymbolChange = useCallback((index: number, newSymbol: string) => {
        setSymbols(prev => {
            const updated = [...prev];
            updated[index] = newSymbol;
            return updated;
        });
    }, []);

    const handleMaximize = useCallback((symbol: string) => {
        if (onMaximizePanel) {
            onMaximizePanel(symbol);
        }
    }, [onMaximizePanel]);

    // Grid CSS based on layout
    const getGridStyle = () => {
        switch (layout) {
            case '1x1':
                return 'grid-cols-1 grid-rows-1';
            case '1x2':
                return 'grid-cols-2 grid-rows-1';
            case '2x1':
                return 'grid-cols-1 grid-rows-2';
            case '2x2':
                return 'grid-cols-2 grid-rows-2';
            case '2x3':
                return 'grid-cols-3 grid-rows-2';
            case '3x2':
                return 'grid-cols-2 grid-rows-3';
            default:
                return 'grid-cols-1 grid-rows-1';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Layout Selector Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/30">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Layout</span>
                    <ChartLayoutSelector
                        layout={layout}
                        onLayoutChange={setLayout}
                    />
                </div>
                <div className="text-xs text-slate-500">
                    {layoutConfig.totalCharts} chart{layoutConfig.totalCharts > 1 ? 's' : ''}
                </div>
            </div>

            {/* Chart Grid */}
            <div className={`flex-1 grid gap-2 p-2 min-h-0 ${getGridStyle()}`}>
                {Array.from({ length: layoutConfig.totalCharts }).map((_, index) => (
                    <MiniChartPanel
                        key={`${symbols[index]}-${index}`}
                        symbol={symbols[index] || DEFAULT_SYMBOLS[index % DEFAULT_SYMBOLS.length]}
                        onSymbolChange={(newSymbol) => handleSymbolChange(index, newSymbol)}
                        onMaximize={() => handleMaximize(symbols[index])}
                        chartType={chartType}
                        period={period}
                        isLive={isLive}
                    />
                ))}
            </div>
        </div>
    );
}

export { ChartLayoutSelector, type ChartLayout };
