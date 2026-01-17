'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, AreaSeries, LineSeries, HistogramSeries, type IChartApi } from 'lightweight-charts';
import { type PriceHistoryPoint } from '@/services/marketService';
import { Loader2, CandlestickChart, LineChart, AreaChart } from 'lucide-react';

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
                textColor: isDark ? '#94a3b8' : '#64748b',
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: isDark ? '#1e293b' : '#f1f5f9', visible: true },
                horzLines: { color: isDark ? '#1e293b' : '#f1f5f9', visible: true },
            },
            width: container.clientWidth,
            height: 420,
            crosshair: {
                mode: 1,
                vertLine: {
                    color: isDark ? '#3b82f6' : '#3b82f6',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#3b82f6',
                },
                horzLine: {
                    color: isDark ? '#3b82f6' : '#3b82f6',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#3b82f6',
                },
            },
            rightPriceScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2,
                },
            },
            timeScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        chartRef.current = chart;

        // Set data if available
        if (data.length > 0) {
            // Sort data by date first
            const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

            if (chartType === 'area') {
                // Area chart
                const areaSeries = chart.addSeries(AreaSeries, {
                    lineColor: '#3b82f6',
                    topColor: 'rgba(59, 130, 246, 0.4)',
                    bottomColor: 'rgba(59, 130, 246, 0.02)',
                    lineWidth: 2,
                    crosshairMarkerVisible: true,
                    crosshairMarkerRadius: 6,
                    crosshairMarkerBorderColor: '#3b82f6',
                    crosshairMarkerBackgroundColor: '#ffffff',
                });

                const areaData = sortedData
                    .filter(d => d.close != null)
                    .map(d => ({
                        time: d.date,
                        value: d.close!,
                    }));

                areaSeries.setData(areaData as any);

            } else if (chartType === 'candle') {
                // Candlestick chart
                const candleSeries = chart.addSeries(CandlestickSeries, {
                    upColor: '#10b981',
                    downColor: '#ef4444',
                    borderVisible: false,
                    wickUpColor: '#10b981',
                    wickDownColor: '#ef4444',
                });

                const candleData = sortedData
                    .filter(d => d.open != null && d.high != null && d.low != null && d.close != null)
                    .map(d => ({
                        time: d.date,
                        open: d.open!,
                        high: d.high!,
                        low: d.low!,
                        close: d.close!,
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

                const volumeData = sortedData
                    .filter(d => d.volume != null && d.close != null && d.open != null)
                    .map(d => ({
                        time: d.date,
                        value: d.volume!,
                        color: (d.close ?? 0) >= (d.open ?? 0)
                            ? 'rgba(16, 185, 129, 0.4)'
                            : 'rgba(239, 68, 68, 0.4)',
                    }));

                volumeSeries.setData(volumeData as any);

            } else {
                // Line chart
                const lineSeries = chart.addSeries(LineSeries, {
                    color: '#8b5cf6',
                    lineWidth: 2,
                    crosshairMarkerVisible: true,
                    crosshairMarkerRadius: 5,
                });

                const lineData = sortedData
                    .filter(d => d.close != null)
                    .map(d => ({
                        time: d.date,
                        value: d.close!,
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
            <div className="h-[420px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-sm text-slate-500">Loading chart...</span>
                </div>
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
                            ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
                        </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${isPositive
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                        {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                    </div>
                </div>

                {/* Chart Type Selector */}
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
