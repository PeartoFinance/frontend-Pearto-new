'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
    createChart,
    ColorType,
    AreaSeries,
    CandlestickSeries,
    LineSeries,
    BarSeries,
    BaselineSeries,
    HistogramSeries,
    type IChartApi,
    type ISeriesApi,
} from 'lightweight-charts';
import { BarChart2, TrendingUp, Activity, Loader2, Mountain, BarChart3, GitBranch, BarChartHorizontal } from 'lucide-react';
import PriceDisplay from '@/components/common/PriceDisplay';

export interface ChartDataPoint {
    date: string;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    close?: number | null;
    value?: number | null;
    volume?: number | null;
}

export interface MultiChartProps {
    /** Chart data */
    data: ChartDataPoint[];
    /** Current period */
    period?: string;
    /** On period change callback */
    onPeriodChange?: (period: string) => void;
    /** Chart height */
    height?: number;
    /** Show period selector */
    showPeriodSelector?: boolean;
    /** Show chart type selector */
    showChartTypeSelector?: boolean;
    /** Initial chart type */
    initialChartType?: 'area' | 'candle' | 'line';
    /** Loading state */
    loading?: boolean;
    /** Price range display */
    priceRange?: { low: number; high: number };
    /** Change info */
    change?: { value: number; percent: number };
    /** Custom class */
    className?: string;
    /** Positive color */
    positiveColor?: string;
    /** Negative color */
    negativeColor?: string;
    /** Skip internal price conversion (if data is already converted) */
    skipPriceConversion?: boolean;
}

const PERIODS = [
    { id: '1m', label: '1 Min' },
    { id: '1d', label: '1 Day' },
    { id: '5d', label: '5 Days' },
    { id: '1mo', label: '1 Month' },
    { id: 'ytd', label: 'YTD' },
    { id: '1y', label: '1 Year' },
    { id: '5y', label: '5 Years' },
];

type ChartType = 'area' | 'candle' | 'line' | 'mountain' | 'bars' | 'baseline' | 'histogram';

export function MultiChart({
    data,
    period = '1mo',
    onPeriodChange,
    height = 350,
    showPeriodSelector = true,
    showChartTypeSelector = true,
    initialChartType = 'area',
    loading = false,
    priceRange,
    change,
    className = '',
    positiveColor = '#10b981',
    negativeColor = '#ef4444',
    skipPriceConversion = false,
}: MultiChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    // ... (unchanged code) ...
    // ... around line 384 for Change Badge ...
    // ... around line 412 for Price Range ...
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Area' | 'Candlestick' | 'Line'> | null>(null);

    const [chartType, setChartType] = useState<ChartType>(initialChartType);
    const [isDark, setIsDark] = useState(false);

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Prepare chart data
    const prepareData = useCallback(() => {
        if (!data || data.length === 0) return [];

        // Deduplicate by date
        const dataMap = new Map<string, ChartDataPoint>();
        data.forEach(d => dataMap.set(d.date, d));

        return Array.from(dataMap.values())
            .sort((a, b) => a.date.localeCompare(b.date))
            .filter(d => d.close != null || d.value != null);
    }, [data]);

    // Calculate if positive or negative based on actual data trend
    const preparedData = prepareData();
    const dataIsPositive = preparedData.length >= 2
        ? (preparedData[preparedData.length - 1].close ?? preparedData[preparedData.length - 1].value ?? 0) >=
        (preparedData[0].close ?? preparedData[0].value ?? 0)
        : (change?.percent ?? 0) >= 0;

    const isPositive = dataIsPositive;
    const chartColor = isPositive ? positiveColor : negativeColor;

    // Create/update chart
    useEffect(() => {
        if (!chartContainerRef.current || loading) return;

        const sortedData = prepareData();
        if (sortedData.length === 0) return;

        // Helper for time format: Unix timestamp for intraday, YYYY-MM-DD for daily+
        const isIntraday = ['1m', '1d', '5d'].includes(period);
        const getTimeKey = (date: string): string | number => {
            if (isIntraday) {
                return Math.floor(new Date(date).getTime() / 1000);
            }
            return date.split('T')[0];
        };

        // Remove existing chart
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
            seriesRef.current = null;
        }

        const container = chartContainerRef.current;

        // Create chart
        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDark ? '#94a3b8' : '#64748b',
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: isDark ? '#1e293b' : '#f1f5f9', style: 1 },
                horzLines: { color: isDark ? '#1e293b' : '#f1f5f9', style: 1 },
            },
            width: container.clientWidth,
            height: height,
            rightPriceScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
            timeScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: isDark ? '#475569' : '#94a3b8',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                },
                horzLine: {
                    color: chartColor,
                    width: 1,
                    style: 2,
                    labelBackgroundColor: chartColor,
                },
            },
        });

        chartRef.current = chart;

        // Add series based on chart type
        if (chartType === 'area') {
            const series = chart.addSeries(AreaSeries, {
                lineColor: chartColor,
                topColor: isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                bottomColor: isPositive ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)',
                lineWidth: 2,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 5,
                crosshairMarkerBackgroundColor: chartColor,
                crosshairMarkerBorderColor: '#ffffff',
            });

            const areaData = sortedData.map(d => ({
                time: getTimeKey(d.date),
                value: d.close ?? d.value ?? 0,
            }));

            series.setData(areaData as any);
            seriesRef.current = series as any;

        } else if (chartType === 'candle') {
            const series = chart.addSeries(CandlestickSeries, {
                upColor: positiveColor,
                downColor: negativeColor,
                borderUpColor: positiveColor,
                borderDownColor: negativeColor,
                wickUpColor: positiveColor,
                wickDownColor: negativeColor,
            });

            const candleData = sortedData
                .filter(d => d.open != null && d.high != null && d.low != null && d.close != null)
                .map(d => ({
                    time: getTimeKey(d.date),
                    open: d.open!,
                    high: d.high!,
                    low: d.low!,
                    close: d.close!,
                }));

            series.setData(candleData as any);
            seriesRef.current = series as any;

        } else if (chartType === 'line') {
            const series = chart.addSeries(LineSeries, {
                color: chartColor,
                lineWidth: 2,
            });

            const lineData = sortedData.map(d => ({
                time: getTimeKey(d.date),
                value: d.close ?? d.value ?? 0,
            }));

            series.setData(lineData as any);
            seriesRef.current = series as any;

        } else if (chartType === 'mountain') {
            // Mountain chart - steeper gradient area fill
            const series = chart.addSeries(AreaSeries, {
                lineColor: chartColor,
                topColor: isPositive ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)',
                bottomColor: 'transparent',
                lineWidth: 2,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 4,
            });

            const mountainData = sortedData.map(d => ({
                time: getTimeKey(d.date),
                value: d.close ?? d.value ?? 0,
            }));

            series.setData(mountainData as any);
            seriesRef.current = series as any;

        } else if (chartType === 'bars') {
            // OHLC Bars chart
            const series = chart.addSeries(BarSeries, {
                upColor: positiveColor,
                downColor: negativeColor,
                thinBars: false,
            });

            const barsData = sortedData
                .filter(d => d.open != null && d.high != null && d.low != null && d.close != null)
                .map(d => ({
                    time: getTimeKey(d.date),
                    open: d.open!,
                    high: d.high!,
                    low: d.low!,
                    close: d.close!,
                }));

            series.setData(barsData as any);
            seriesRef.current = series as any;

        } else if (chartType === 'baseline') {
            // Baseline chart - shows above/below a reference line
            const avgValue = sortedData.reduce((sum, d) => sum + (d.close ?? d.value ?? 0), 0) / sortedData.length;

            const series = chart.addSeries(BaselineSeries, {
                baseValue: { type: 'price', price: avgValue },
                topLineColor: positiveColor,
                topFillColor1: 'rgba(16, 185, 129, 0.3)',
                topFillColor2: 'rgba(16, 185, 129, 0.05)',
                bottomLineColor: negativeColor,
                bottomFillColor1: 'rgba(239, 68, 68, 0.05)',
                bottomFillColor2: 'rgba(239, 68, 68, 0.3)',
                lineWidth: 2,
            });

            const baselineData = sortedData.map(d => ({
                time: getTimeKey(d.date),
                value: d.close ?? d.value ?? 0,
            }));

            series.setData(baselineData as any);
            seriesRef.current = series as any;

        } else if (chartType === 'histogram') {
            // Volume-style histogram chart
            const series = chart.addSeries(HistogramSeries, {
                color: chartColor,
            });

            const histogramData = sortedData.map((d, i, arr) => {
                const prevClose = i > 0 ? (arr[i - 1].close ?? arr[i - 1].value ?? 0) : (d.close ?? d.value ?? 0);
                const currentClose = d.close ?? d.value ?? 0;
                return {
                    time: getTimeKey(d.date),
                    value: currentClose,
                    color: currentClose >= prevClose ? positiveColor : negativeColor,
                };
            });

            series.setData(histogramData as any);
            seriesRef.current = series as any;
        }

        chart.timeScale().fitContent();

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
                seriesRef.current = null;
            }
        };
    }, [data, chartType, isDark, loading, height, chartColor, positiveColor, negativeColor, prepareData, isPositive]);

    const chartTypes: { id: ChartType; label: string; icon: React.ReactNode }[] = [
        { id: 'area', label: 'Area', icon: <BarChart2 size={14} /> },
        { id: 'mountain', label: 'Mountain', icon: <Mountain size={14} /> },
        { id: 'candle', label: 'Candle', icon: <Activity size={14} /> },
        { id: 'bars', label: 'Bars', icon: <BarChart3 size={14} /> },
        { id: 'line', label: 'Line', icon: <TrendingUp size={14} /> },
        { id: 'baseline', label: 'Baseline', icon: <GitBranch size={14} /> },
        { id: 'histogram', label: 'Histogram', icon: <BarChartHorizontal size={14} /> },
    ];

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
            {/* Header Controls - Two Row Layout */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
                {/* Row 1: Period Selector + Change Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Period Selector */}
                    {showPeriodSelector && (
                        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1 overflow-x-auto">
                            {PERIODS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => onPeriodChange?.(p.id)}
                                    className={`px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition whitespace-nowrap ${period === p.id
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Change Badge */}
                    {change && (
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap self-start sm:self-auto ${isPositive
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                            }`}>
                            <PriceDisplay amount={Math.abs(change.value)} autoConvert={!skipPriceConversion} /> ({change.percent >= 0 ? '+' : ''}{change.percent.toFixed(2)}%)
                        </span>
                    )}
                </div>

                {/* Row 2: Chart Type Selector */}
                {showChartTypeSelector && (
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1 overflow-x-auto">
                        {chartTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setChartType(type.id)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition whitespace-nowrap ${chartType === type.id
                                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {type.icon}
                                <span className="hidden xs:inline">{type.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Price Range (optional) */}
                {priceRange && (
                    <div className="text-xs text-slate-500">
                        Range: <span className="font-medium text-slate-700 dark:text-slate-300">
                            <PriceDisplay amount={priceRange.low} autoConvert={!skipPriceConversion} /> - <PriceDisplay amount={priceRange.high} autoConvert={!skipPriceConversion} />
                        </span>
                    </div>
                )}
            </div>

            {/* Chart Container */}
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 z-10">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                )}
                <div
                    ref={chartContainerRef}
                    className="w-full"
                    style={{ height: `${height}px` }}
                />
                {!loading && (!data || data.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-slate-400">No chart data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MultiChart;
