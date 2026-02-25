'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, AreaSeries, LineSeries, HistogramSeries, type IChartApi } from 'lightweight-charts';
import { type PriceHistoryPoint } from '@/services/marketService';
import { Loader2, CandlestickChart, LineChart, AreaChart, Maximize2, Activity } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';

interface StockChartProps {
    data: PriceHistoryPoint[];
    loading?: boolean;
    symbol: string;
}

type ChartType = 'area' | 'candle' | 'line';

export default function StockChart({ data, loading = false, symbol }: StockChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);
    const [chartType, setChartType] = useState<ChartType>('area');

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

    // Initialize and update chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const container = chartContainerRef.current;

        // Remove existing chart if any
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        // Create chart
        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDark ? '#94a3b8' : '#475569',
                attributionLogo: false,
            },
            localization: {
                priceFormatter: (price: number) => formatOnly(price),
            },
            grid: {
                vertLines: { color: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)', style: 1 },
                horzLines: { color: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)', style: 1 },
            },
            width: container.clientWidth,
            height: 420,
            crosshair: {
                mode: 1,
                vertLine: {
                    color: isDark ? '#475569' : '#94a3b8',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                },
                horzLine: {
                    color: isDark ? '#0aff8d' : '#10b981', // Will be overridden per series
                    width: 1,
                    style: 2,
                    labelBackgroundColor: isDark ? '#0aff8d' : '#10b981',
                },
            },
            rightPriceScale: {
                borderColor: isDark ? '#334155' : '#cbd5e1',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2,
                },
            },
            timeScale: {
                borderColor: isDark ? '#334155' : '#cbd5e1',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        chartRef.current = chart;

        const isIntraday = data.length > 0 && data[0].date.includes('T');

        // Set data if available
        if (data.length > 0) {
            // Sort and deduplicate data by date (keep last occurrence for each date)
            const dataMap = new Map<string, typeof data[0]>();
            data.forEach(d => dataMap.set(d.date, d));
            const sortedData = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

            // Helper for time format: Unix timestamp for intraday, YYYY-MM-DD for daily+
            const getTimeKey = (date: string): string | number => {
                if (isIntraday && date.includes('T')) {
                    return Math.floor(new Date(date).getTime() / 1000);
                }
                return date.split('T')[0];
            };

            // Calculate if positive or negative
            const isPositive = sortedData.length >= 2
                ? (sortedData[sortedData.length - 1].close ?? 0) >= (sortedData[0].close ?? 0)
                : true;

            const chartColor = isDark ? (isPositive ? '#0aff8d' : '#e02d75') : (isPositive ? '#10b981' : '#ef4444');
            const topGradient = isDark ? (isPositive ? 'rgba(10, 255, 141, 0.4)' : 'rgba(224, 45, 117, 0.4)') : (isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)');
            const bottomGradient = isDark ? (isPositive ? 'rgba(10, 255, 141, 0.05)' : 'rgba(224, 45, 117, 0.05)') : (isPositive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)');

            if (chartType === 'area') {
                // Area chart
                const areaSeries = chart.addSeries(AreaSeries, {
                    lineColor: chartColor,
                    topColor: topGradient,
                    bottomColor: bottomGradient,
                    lineWidth: 2,
                    crosshairMarkerVisible: true,
                    crosshairMarkerRadius: 5,
                    crosshairMarkerBorderColor: '#ffffff',
                    crosshairMarkerBackgroundColor: chartColor,
                });

                const areaData = sortedData
                    .filter(d => d.close != null)
                    .map(d => ({
                        time: getTimeKey(d.date),
                        value: convertPrice(d.close!),
                    }));

                areaSeries.setData(areaData as any);

            } else if (chartType === 'candle') {
                // Candlestick chart
                const candleSeries = chart.addSeries(CandlestickSeries, {
                    upColor: isDark ? '#0aff8d' : '#2563eb',
                    downColor: isDark ? '#e02d75' : '#1d4ed8',
                    borderUpColor: isDark ? '#0aff8d' : '#2563eb',
                    borderDownColor: isDark ? '#e02d75' : '#1d4ed8',
                    wickUpColor: isDark ? '#0aff8d' : '#2563eb',
                    wickDownColor: isDark ? '#e02d75' : '#1d4ed8',
                });

                const candleData = sortedData
                    .filter(d => d.open != null && d.high != null && d.low != null && d.close != null)
                    .map(d => ({
                        time: getTimeKey(d.date),
                        open: convertPrice(d.open!),
                        high: convertPrice(d.high!),
                        low: convertPrice(d.low!),
                        close: convertPrice(d.close!),
                    }));

                candleSeries.setData(candleData as any);

                // Add volume for candlestick
                const volumeSeries = chart.addSeries(HistogramSeries, {
                    color: '#26a69a',
                    priceFormat: { type: 'volume' },
                    priceScaleId: 'volume',
                });

                chart.priceScale('volume').applyOptions({
                    scaleMargins: { top: 0.85, bottom: 0 },
                });

                // Deduping not needed here since we already sortedData deduplicated
                const volumeData = sortedData
                    .filter(d => d.volume != null && d.close != null && d.open != null)
                    .map(d => ({
                        time: getTimeKey(d.date),
                        value: d.volume!,
                        color: (d.close ?? 0) >= (d.open ?? 0)
                            ? (isDark ? 'rgba(10, 255, 141, 0.4)' : 'rgba(16, 185, 129, 0.4)')
                            : (isDark ? 'rgba(224, 45, 117, 0.4)' : 'rgba(239, 68, 68, 0.4)'),
                    }));

                volumeSeries.setData(volumeData as any);

            } else {
                // Line chart
                const lineSeries = chart.addSeries(LineSeries, {
                    color: chartColor,
                    lineWidth: 2,
                    crosshairMarkerVisible: true,
                    crosshairMarkerRadius: 5,
                });

                const lineData = sortedData
                    .filter(d => d.close != null)
                    .map(d => ({
                        time: getTimeKey(d.date),
                        value: convertPrice(d.close!),
                    }));

                lineSeries.setData(lineData as any);
            }

            // Fit content
            chart.timeScale().fitContent();
        }

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [isDark, data, chartType]);

    const chartTypes = [
        { id: 'area' as ChartType, label: 'Area', icon: AreaChart },
        { id: 'candle' as ChartType, label: 'Candle', icon: CandlestickChart },
        { id: 'line' as ChartType, label: 'Line', icon: LineChart },
    ];

    if (loading) {
        return (
            <div className="h-[420px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-500 dark:text-slate-400">
                <Activity className="h-8 w-8 animate-spin mr-3 text-blue-500 dark:text-blue-400" />
                <span className="text-sm">Loading chart data...</span>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="h-[420px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-center">
                    <LineChart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No chart data available for {symbol}</p>
                </div>
            </div>
        );
    }

    // Calculate price range for display
    const { formatPrice, convertPrice, formatOnly } = useCurrency();
    const prices = data.filter(d => d.close != null).map(d => d.close!);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const currentPrice = prices[prices.length - 1];
    const startPrice = prices[0];
    const priceChange = currentPrice - startPrice;
    const priceChangePercent = ((priceChange / startPrice) * 100);
    const isPositive = priceChange >= 0;

    return (
        <div className="space-y-4">
            {/* Chart Header */}
            <div className="flex items-center justify-between">
                {/* Price Summary */}
                <div className="flex items-center gap-4">
                    <div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Range:</span>
                        <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                        </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${isPositive
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                        {isPositive ? '+' : ''}{formatPrice(Math.abs(priceChange))} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                    </div>
                </div>

                {/* Chart Type Selector */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {chartTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setChartType(type.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition ${chartType === type.id
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                    title={type.label}
                                >
                                    <Icon size={16} />
                                    <span className="hidden sm:inline">{type.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <Link
                        href={`/chart/${symbol}?type=stock`}
                        target="_blank"
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
                    >
                        <Maximize2 size={12} />
                        Advanced Chart
                    </Link>
                    <Link
                        href={`/live?symbol=${symbol}&type=stock`}
                        target="_blank"
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition"
                    >
                        <Activity size={12} />
                        Live Chart
                    </Link>
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div
                    ref={chartContainerRef}
                    className="w-full h-[420px]"
                />
            </div>
        </div>
    );
}
