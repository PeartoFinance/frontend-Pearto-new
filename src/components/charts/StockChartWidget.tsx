'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, CandlestickSeries, AreaSeries, LineSeries, HistogramSeries, type IChartApi } from 'lightweight-charts';
import { Loader2, CandlestickChart, LineChart, AreaChart, Maximize2, Minus, Plus, Activity } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';

export interface StockChartDataPoint {
    date: string;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    close?: number | null;
    volume?: number | null;
}

export interface StockChartWidgetProps {
    /** Chart data */
    data: StockChartDataPoint[];
    /** Stock symbol */
    symbol?: string;
    /** Loading state */
    loading?: boolean;
    /** Chart height */
    height?: number;
    /** Show volume bars */
    showVolume?: boolean;
    /** Show price info bar with hover data */
    showPriceInfoBar?: boolean;
    /** Show header with symbol and full screen */
    showHeader?: boolean;
    /** Show chart type selector */
    showChartTypeSelector?: boolean;
    /** Show period selector */
    showPeriodSelector?: boolean;
    /** Available periods */
    periods?: string[];
    /** Current period */
    period?: string;
    /** Period change callback */
    onPeriodChange?: (period: string) => void;
    /** Initial chart type */
    initialChartType?: 'area' | 'candle' | 'line';
    /** Current price (for header display) */
    currentPrice?: number;
    /** Price change */
    change?: number;
    /** Change percent */
    changePercent?: number;
    /** Custom class */
    className?: string;
}

type ChartType = 'area' | 'candle' | 'line';

const DEFAULT_PERIODS = ['1D', '2D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', 'All'];

export function StockChartWidget({
    data,
    symbol = '',
    loading = false,
    height = 350,
    showVolume = true,
    showPriceInfoBar = true,
    showHeader = true,
    showChartTypeSelector = true,
    showPeriodSelector = true,
    periods = DEFAULT_PERIODS,
    period = '1M',
    onPeriodChange,
    initialChartType = 'area',
    currentPrice,
    change = 0,
    changePercent = 0,
    className = '',
}: StockChartWidgetProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const volumeContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const volumeChartRef = useRef<IChartApi | null>(null);
    const { formatPrice } = useCurrency();

    const [isDark, setIsDark] = useState(false);
    const [chartType, setChartType] = useState<ChartType>(initialChartType);
    const [hoveredData, setHoveredData] = useState<StockChartDataPoint | null>(null);

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Create charts
    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0 || loading) return;

        // Cleanup
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }
        if (volumeChartRef.current) {
            volumeChartRef.current.remove();
            volumeChartRef.current = null;
        }

        const container = chartContainerRef.current;
        const volumeContainer = volumeContainerRef.current;

        // Sort data
        const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

        // Helper for time format: Unix timestamp for intraday, YYYY-MM-DD for daily+
        const isIntraday = ['1D', '2D', '5D'].includes(period);
        const getTimeKey = (date: string): string | number => {
            if (isIntraday && date.includes('T')) {
                return Math.floor(new Date(date).getTime() / 1000);
            }
            return date.split('T')[0];
        };

        // Deduplicate: keep last entry per time key
        const dedup = <T extends { time: string | number }>(arr: T[]): T[] => {
            const map = new Map<string | number, T>();
            for (const item of arr) map.set(item.time, item);
            return Array.from(map.values());
        };

        // Main price chart
        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDark ? '#94a3b8' : '#64748b',
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)' },
                horzLines: { color: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)' },
            },
            width: container.clientWidth,
            height: height,
            crosshair: {
                mode: 1,
                vertLine: { color: '#3b82f6', width: 1, style: 2, labelBackgroundColor: '#3b82f6' },
                horzLine: { color: '#3b82f6', width: 1, style: 2, labelBackgroundColor: '#3b82f6' },
            },
            rightPriceScale: {
                borderColor: isDark ? '#334155' : '#cbd5e1',
                scaleMargins: { top: 0.05, bottom: 0.05 },
            },
            timeScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        chartRef.current = chart;

        // Add main series based on chart type
        if (chartType === 'area') {
            const areaSeries = chart.addSeries(AreaSeries, {
                lineColor: '#3b82f6',
                topColor: 'rgba(59, 130, 246, 0.4)',
                bottomColor: 'rgba(59, 130, 246, 0.02)',
                lineWidth: 2,
            });
            areaSeries.setData(dedup(sortedData.filter(d => d.close != null).map(d => ({
                time: getTimeKey(d.date),
                value: d.close!,
            }))) as any);
        } else if (chartType === 'candle') {
            const candleSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#10b981',
                downColor: '#ef4444',
                borderVisible: false,
                wickUpColor: '#10b981',
                wickDownColor: '#ef4444',
            });
            candleSeries.setData(dedup(sortedData.filter(d => d.open && d.high && d.low && d.close).map(d => ({
                time: getTimeKey(d.date),
                open: d.open!,
                high: d.high!,
                low: d.low!,
                close: d.close!,
            }))) as any);
        } else {
            const lineSeries = chart.addSeries(LineSeries, {
                color: '#8b5cf6',
                lineWidth: 2,
            });
            lineSeries.setData(dedup(sortedData.filter(d => d.close != null).map(d => ({
                time: getTimeKey(d.date),
                value: d.close!,
            }))) as any);
        }

        chart.timeScale().fitContent();

        // Volume chart (if enabled)
        let volumeSeries: any = null;
        if (showVolume && volumeContainer) {
            const volumeChart = createChart(volumeContainer, {
                layout: {
                    background: { type: ColorType.Solid, color: 'transparent' },
                    textColor: isDark ? '#94a3b8' : '#64748b',
                    attributionLogo: false,
                },
                grid: {
                    vertLines: { visible: false },
                    horzLines: { color: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)' },
                },
                width: volumeContainer.clientWidth,
                height: 80,
                rightPriceScale: {
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    scaleMargins: { top: 0.1, bottom: 0 },
                },
                timeScale: { visible: false },
            });

            volumeChartRef.current = volumeChart;

            volumeSeries = volumeChart.addSeries(HistogramSeries, {
                priceFormat: { type: 'volume' },
            });

            volumeSeries.setData(dedup(sortedData.filter(d => d.volume != null).map(d => ({
                time: getTimeKey(d.date),
                value: d.volume!,
                color: (d.close ?? 0) >= (d.open ?? 0)
                    ? 'rgba(16, 185, 129, 0.6)'
                    : 'rgba(239, 68, 68, 0.6)',
            }))) as any);

            volumeChart.timeScale().fitContent();

            // Sync crosshairs
            chart.subscribeCrosshairMove((param) => {
                const time = param.time;
                if (time) {
                    volumeChart.setCrosshairPosition(0, time, volumeSeries);
                    const dataPoint = sortedData.find(d => getTimeKey(d.date) === time || getTimeKey(d.date).toString() === time.toString());
                    if (dataPoint) setHoveredData(dataPoint);
                } else {
                    setHoveredData(null);
                }
            });

            volumeChart.subscribeCrosshairMove((param) => {
                const time = param.time;
                if (time) {
                    const dataPoint = sortedData.find(d => getTimeKey(d.date) === time || getTimeKey(d.date).toString() === time.toString());
                    if (dataPoint) setHoveredData(dataPoint);
                } else {
                    setHoveredData(null);
                }
            });
        } else {
            // Just crosshair tracking without volume
            chart.subscribeCrosshairMove((param) => {
                const time = param.time;
                if (time) {
                    const dataPoint = sortedData.find(d => getTimeKey(d.date) === time || getTimeKey(d.date).toString() === time.toString());
                    if (dataPoint) setHoveredData(dataPoint);
                } else {
                    setHoveredData(null);
                }
            });
        }

        // Resize handler
        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
            if (volumeChartRef.current && volumeContainerRef.current) {
                volumeChartRef.current.applyOptions({ width: volumeContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
            if (volumeChartRef.current) {
                volumeChartRef.current.remove();
                volumeChartRef.current = null;
            }
        };
    }, [isDark, data, chartType, height, showVolume, loading]);

    // Format helpers
    const formatCurrencyValue = (num: number | undefined | null): string => {
        if (num == null) return '-';
        return formatPrice(num);
    };

    const formatNumber = (num: number | undefined | null, decimals = 2): string => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatLargeNumber = (num: number | undefined | null): string => {
        if (num == null) return '-';
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toLocaleString();
    };

    const isPositive = change >= 0;
    const latestData = data.length > 0 ? data[data.length - 1] : null;
    const displayData = hoveredData || latestData;

    // Calculate change for hovered point
    const firstData = data.length > 0 ? data[0] : null;
    const displayChange = displayData?.close && firstData?.close
        ? displayData.close - firstData.close
        : change;
    const displayChangePercent = displayData?.close && firstData?.close
        ? ((displayData.close - firstData.close) / firstData.close) * 100
        : changePercent;

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
            {/* Header Bar */}
            {showHeader && (
                <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white text-sm">
                    <span className="font-semibold">{symbol} Chart</span>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/live?symbol=${symbol}&type=stock`}
                            target="_blank"
                            className="flex items-center gap-1 hover:bg-blue-700 px-2 py-1 rounded transition"
                        >
                            <Activity size={14} />
                            Live Chart
                        </Link>
                        <Link
                            href={`/chart/${symbol}?type=stock`}
                            target="_blank"
                            className="flex items-center gap-1 hover:bg-blue-700 px-2 py-1 rounded transition"
                        >
                            <Maximize2 size={14} />
                            Advanced Chart
                        </Link>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            {showChartTypeSelector && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-1">
                        {[
                            { id: 'area' as ChartType, icon: AreaChart, label: 'Area' },
                            { id: 'candle' as ChartType, icon: CandlestickChart, label: 'Candle' },
                            { id: 'line' as ChartType, icon: LineChart, label: 'Line' },
                        ].map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setChartType(type.id)}
                                    className={`p-2 rounded transition ${chartType === type.id
                                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    title={type.label}
                                >
                                    <Icon size={16} />
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                if (chartRef.current) {
                                    const timeScale = chartRef.current.timeScale();
                                    const range = timeScale.getVisibleLogicalRange();
                                    if (range) {
                                        const width = range.to - range.from;
                                        const center = (range.from + range.to) / 2;
                                        timeScale.setVisibleLogicalRange({ from: center - width * 0.75, to: center + width * 0.75 });
                                    }
                                }
                            }}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition" title="Zoom Out"
                        >
                            <Minus size={14} />
                        </button>
                        <button
                            onClick={() => {
                                if (chartRef.current) {
                                    const timeScale = chartRef.current.timeScale();
                                    const range = timeScale.getVisibleLogicalRange();
                                    if (range) {
                                        const width = range.to - range.from;
                                        const center = (range.from + range.to) / 2;
                                        timeScale.setVisibleLogicalRange({ from: center - width * 0.25, to: center + width * 0.25 });
                                    }
                                }
                            }}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition" title="Zoom In"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Price Info Bar */}
            {showPriceInfoBar && (
                <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{symbol}</span>
                        <span className={`text-lg font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                            {formatCurrencyValue(displayData?.close || currentPrice)}
                        </span>
                        <span className={`text-sm ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                            {displayChange >= 0 ? '+' : ''}{formatCurrencyValue(displayChange)} ({displayChangePercent >= 0 ? '+' : ''}{formatNumber(displayChangePercent)}%)
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs ml-auto">
                        {[
                            { label: 'PRICE', value: formatCurrencyValue(displayData?.close) },
                            { label: 'VOL', value: formatLargeNumber(displayData?.volume) },
                            { label: 'OPEN', value: formatCurrencyValue(displayData?.open) },
                            { label: 'HIGH', value: formatCurrencyValue(displayData?.high) },
                            { label: 'CLOSE', value: formatCurrencyValue(displayData?.close) },
                            { label: 'LOW', value: formatCurrencyValue(displayData?.low) },
                            { label: 'CHANGE', value: formatCurrencyValue(displayChange) },
                            { label: 'CHG %', value: `${formatNumber(displayChangePercent)}%` },
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col">
                                <span className="text-slate-400 dark:text-slate-500">{item.label}:</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chart Area */}
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-10">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                )}
                <div ref={chartContainerRef} className="w-full" />

                {showVolume && (
                    <>
                        <div className="px-4 py-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span className="text-blue-500">▶</span> Plots
                        </div>
                        <div ref={volumeContainerRef} className="w-full" />
                    </>
                )}
            </div>

            {/* Period Selector */}
            {showPeriodSelector && (
                <div className="flex items-center gap-1 px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {periods.map((p) => (
                        <button
                            key={p}
                            onClick={() => onPeriodChange?.(p)}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition ${period === p
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StockChartWidget;
