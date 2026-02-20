'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createChart, ColorType, CandlestickSeries, AreaSeries, LineSeries, HistogramSeries, type IChartApi, type ISeriesApi, CrosshairMode, createSeriesMarkers } from 'lightweight-charts';
import { Loader2, Plus, Minus, Maximize2, Settings, Download, ExternalLink, Activity } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useChartDrawings, type Drawing, type DrawingPoint } from '@/hooks/useChartDrawings';
import { ChartToolbar } from './toolbar/ChartToolbar';
import { calculateSMA, calculateRSI, detectPatterns, type ChartMarker } from '@/utils/technicalAnalysis';
import { toast } from 'sonner';
import { StockChartDataPoint } from './StockChartWidget'; // Reuse interface
import { useChartResize } from '@/hooks/useChartResize';

interface AdvancedStockChartProps {
    data: StockChartDataPoint[];
    symbol: string;
    loading?: boolean;
    height?: number;
    period?: string;
    onPeriodChange?: (period: string) => void;
}

export default function AdvancedStockChart({
    data,
    symbol,
    loading = false,
    height = 500,
    period = '1M',
    onPeriodChange
}: AdvancedStockChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const patternMarkersRef = useRef<any>(null);

    // State
    const [isDark, setIsDark] = useState(false);
    const {
        drawings,
        activeTool,
        isDrawing,
        currentDrawing,
        startDrawingTool,
        cancelDrawing,
        addPoint,
        updatePreview,
        deleteDrawing, // create delete functionality
        clearAll
    } = useChartDrawings(symbol);

    const [markers, setMarkers] = useState<ChartMarker[]>([]);
    const [showPatterns, setShowPatterns] = useState(false);

    // Detect Dark Mode
    useEffect(() => {
        const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // 1. Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDark ? '#94a3b8' : '#64748b',
            },
            grid: {
                vertLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
                horzLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
            },
            width: chartContainerRef.current.clientWidth,
            height: height,
            crosshair: { mode: CrosshairMode.Normal },
            timeScale: {
                timeVisible: true,
                borderColor: isDark ? '#334155' : '#e2e8f0',
            },
            rightPriceScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
            }
        });

        chartRef.current = chart;

        // Main Series (Candlestick)
        const mainSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981',
            downColor: '#ef4444',
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
            borderVisible: false
        });
        seriesRef.current = mainSeries;

        return () => {
            chart.remove();
        };
    }, [isDark, height]);

    // Apply ResizeObserver hook for robust responsive sizing
    useChartResize(chartRef.current, chartContainerRef);

    // 2. Update Data & Patterns
    useEffect(() => {
        if (!seriesRef.current || data.length === 0) return;

        const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

        // Helper for time format: Unix timestamp for intraday, YYYY-MM-DD for daily+
        const isIntraday = ['1D', '1W', '5D'].includes(period);
        const getTimeKey = (date: string): string | number => {
            if (isIntraday && date.includes('T')) {
                return Math.floor(new Date(date).getTime() / 1000);
            }
            return date.split('T')[0];
        };

        // Map to Candle format
        const candleData = sortedData.filter(d => d.open && d.high && d.low && d.close).map(d => ({
            time: getTimeKey(d.date),
            open: d.open!,
            high: d.high!,
            low: d.low!,
            close: d.close!
        }));

        seriesRef.current.setData(candleData as any);
        chartRef.current?.timeScale().fitContent();

        // Detect Patterns
        if (!patternMarkersRef.current || (seriesRef.current && patternMarkersRef.current.getSeries() !== seriesRef.current)) {
            if (seriesRef.current) {
                patternMarkersRef.current = createSeriesMarkers(seriesRef.current);
            }
        }

        if (showPatterns) {
            const detected = detectPatterns(candleData as any);
            setMarkers(detected);
            if (patternMarkersRef.current) {
                patternMarkersRef.current.setMarkers(detected);
            }
        } else {
            setMarkers([]);
            if (patternMarkersRef.current) {
                patternMarkersRef.current.setMarkers([]);
            }
        }

    }, [data, showPatterns]);

    // 3. Drawing Coordinate Conversion Logic
    // We need to re-render SVG when chart scrolls/zooms
    const [svgDrawings, setSvgDrawings] = useState<React.ReactNode[]>([]);
    const [previewPath, setPreviewPath] = useState<string | null>(null);

    const updateSvg = useCallback(() => {
        if (!chartRef.current || !seriesRef.current) return;
        const chart = chartRef.current;
        const series = seriesRef.current;
        const timeScale = chart.timeScale();

        const renderDrawing = (d: Drawing) => {
            // Check if valid
            if (d.points.length < 2) return null;

            const p1 = d.points[0];
            const p2 = d.points[1];

            const x1 = timeScale.timeToCoordinate(p1.time as any);
            const y1 = series.priceToCoordinate(p1.price);
            const x2 = timeScale.timeToCoordinate(p2.time as any);
            const y2 = series.priceToCoordinate(p2.price);

            // If any point is null (off screen far away), we might skip or clip.
            // For simple implementation, checking if null
            if (x1 === null || y1 === null || x2 === null || y2 === null) return null;

            if (d.type === 'trend' || d.type === 'ray') {
                return (
                    <line key={d.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={d.color} strokeWidth={d.lineWidth} />
                );
            }
            if (d.type === 'rectangle') {
                const x = Math.min(x1, x2);
                const y = Math.min(y1, y2);
                const w = Math.abs(x2 - x1);
                const h = Math.abs(y2 - y1);
                return (
                    <rect key={d.id} x={x} y={y} width={w} height={h} stroke={d.color} strokeWidth={d.lineWidth} fill={d.color} fillOpacity={0.2} />
                );
            }
            if (d.type === 'horizontal') {
                // Horizontal line spans full width
                return (
                    <line key={d.id} x1={0} y1={y1} x2="100%" y2={y1} stroke={d.color} strokeWidth={d.lineWidth} strokeDasharray="5,5" />
                );
            }
            return null;
        };

        const elements = drawings.map(renderDrawing).filter(Boolean);
        setSvgDrawings(elements as any);

        // Preview
        if (currentDrawing && currentDrawing.points.length >= 1) {
            // ... logic same as above for preview
            // Just render it into the array or separately
        }

    }, [drawings, currentDrawing]);

    // Use loop to update SVG (animation frame) for smoothness during scroll
    useEffect(() => {
        let frameId: number;
        const animate = () => {
            updateSvg();
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [updateSvg]);


    // 4. Mouse Event Handlers for Drawing
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isDrawing || !chartRef.current || !seriesRef.current) return;

        const rect = chartContainerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const series = seriesRef.current;
        const chart = chartRef.current;

        const price = series.coordinateToPrice(y);
        const time = chart.timeScale().coordinateToTime(x);

        if (price !== null && time !== null) {
            addPoint({ time: time as string, price });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !currentDrawing || !chartRef.current || !seriesRef.current) return;

        const rect = chartContainerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const series = seriesRef.current;
        const chart = chartRef.current;

        const price = series.coordinateToPrice(y);
        const time = chart.timeScale().coordinateToTime(x);

        if (price !== null && time !== null) {
            updatePreview({ time: time as string, price });
        }
    };

    return (
        <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden h-[500px]">
            {/* Toolbar */}
            <ChartToolbar activeTool={activeTool} onToolSelect={startDrawingTool} onClearDrawings={clearAll} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative">
                {/* Top Bar */}
                <div className="h-12 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-4 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto scrollbar-hide">
                    <span className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{symbol}</span>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 flex-shrink-0" />

                    {/* Period Selector */}
                    <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-0.5 flex-shrink-0">
                        {['1D', '1W', '1M', '3M', 'YTD', '1Y', 'All'].map(p => (
                            <button
                                key={p}
                                onClick={() => onPeriodChange?.(p)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition ${period === p
                                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 flex-shrink-0" />

                    {/* Pattern Toggle */}
                    <button
                        onClick={() => setShowPatterns(!showPatterns)}
                        className={`text-xs px-3 py-1.5 rounded-md font-medium border flex items-center gap-1.5 transition flex-shrink-0 ${showPatterns
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                            : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                            }`}
                    >
                        <span>Patterns</span>
                        <span className={`w-2 h-2 rounded-full ${showPatterns ? 'bg-blue-500' : 'bg-slate-300'}`} />
                    </button>

                    {/* Advanced Chart Link */}
                    <Link
                        href={`/chart/${symbol}?type=stock`}
                        target="_blank"
                        className="text-xs px-2 py-1 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 ml-auto flex-shrink-0 flex items-center gap-1"
                        title="Open Advanced Chart"
                    >
                        <Maximize2 size={14} />
                        <span className="hidden sm:inline">Expand</span>
                    </Link>

                    {/* Live Chart Link */}
                    <Link
                        href={`/live?symbol=${symbol}&type=stock`}
                        target="_blank"
                        className="text-xs px-2 py-1 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 ml-1 flex-shrink-0 flex items-center gap-1"
                        title="Open Live Chart"
                    >
                        <Activity size={14} />
                        <span className="hidden sm:inline">Live</span>
                    </Link>

                    {/* Indicators Placeholder */}
                    <button
                        onClick={() => toast.info('Chart indicators coming soon!')}
                        className="text-xs px-2 py-1 rounded text-slate-500 hover:bg-slate-200 flex-shrink-0"
                    >
                        <Settings size={16} />
                    </button>
                </div>

                {/* Chart Area */}
                <div className="flex-1 relative group cursor-crosshair">
                    {/* Chart Container */}
                    <div ref={chartContainerRef} className="w-full h-full" />

                    {/* SVG Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
                        {svgDrawings}

                        {/* Current Drawing Preview */}
                        {currentDrawing && currentDrawing.points.length >= 1 && (() => {
                            // Quick inline render for preview (duplicate logic, optimize later)
                            if (!chartRef.current || !seriesRef.current) return null;
                            const p1 = currentDrawing.points[0];
                            // Use last mouse position or 2nd point if exists? In mouse move we update points[1]
                            const p2 = currentDrawing.points[1];
                            if (!p2) return null; // Need logic to return null if p2 not set

                            const x1 = chartRef.current.timeScale().timeToCoordinate(p1.time as any);
                            const y1 = seriesRef.current.priceToCoordinate(p1.price);
                            const x2 = chartRef.current.timeScale().timeToCoordinate(p2.time as any);
                            const y2 = seriesRef.current.priceToCoordinate(p2.price);

                            if (x1 === null || y1 === null || x2 === null || y2 === null) return null;

                            return (
                                <>
                                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={currentDrawing.color} strokeWidth={currentDrawing.lineWidth} strokeDasharray="4,4" />
                                    <circle cx={x2} cy={y2} r={3} fill="blue" />
                                </>
                            );
                        })()}
                    </svg>

                    {/* Interaction Layer (Overlay div to capture mouse events when drawing) */}
                    {isDrawing && (
                        <div
                            className="absolute inset-0 z-20 cursor-crosshair"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onClick={(e) => {
                                // Prevent double firing if needed, usually Click handles both
                                // For now relying on MouseDown + MouseUp logic or just addPoint logic
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
