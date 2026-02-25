'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    createChart,
    ColorType,
    AreaSeries,
    CandlestickSeries,
    LineSeries,
    BarSeries,
    type IChartApi,
    type ISeriesApi,
    CrosshairMode
} from 'lightweight-charts';
import { Search, X, Maximize2, RefreshCw } from 'lucide-react';
import { getStockHistory, type PriceHistoryPoint } from '@/services/marketService';
import { getLiveQuote, type LiveQuote } from '@/services/liveChartService';
import { useCurrency } from '@/contexts/CurrencyContext';

interface MiniChartPanelProps {
    symbol: string;
    onSymbolChange: (symbol: string) => void;
    onMaximize?: () => void;
    chartType?: 'area' | 'candle' | 'line' | 'bar';
    period?: string;
    isLive?: boolean;
}

export default function MiniChartPanel({
    symbol,
    onSymbolChange,
    onMaximize,
    chartType = 'area',
    period = '1D',
    isLive = true
}: MiniChartPanelProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick' | 'Area' | 'Line'> | null>(null);

    const [data, setData] = useState<PriceHistoryPoint[]>([]);
    const [quote, setQuote] = useState<LiveQuote | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [searchValue, setSearchValue] = useState(symbol);
    const { formatPrice } = useCurrency();

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const periodMap: Record<string, { period: string; interval: string }> = {
                '1D': { period: '1d', interval: '5m' },
                '5D': { period: '5d', interval: '15m' },
                '1M': { period: '1mo', interval: '90m' },
                '3M': { period: '3mo', interval: '1d' },
            };
            const { period: p, interval: i } = periodMap[period] || periodMap['1D'];
            const response = await getStockHistory(symbol, p, i);
            setData(response.data || []);

            // Also fetch quote
            const q = await getLiveQuote(symbol);
            setQuote(q);
        } catch (e) {
            console.error('MiniChart fetch failed:', e);
        } finally {
            setLoading(false);
        }
    }, [symbol, period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Live updates
    useEffect(() => {
        if (!isLive) return;

        const updateQuote = async () => {
            try {
                const q = await getLiveQuote(symbol);
                setQuote(q);

                // Update chart with new price
                if (q.price && seriesRef.current) {
                    const now = Math.floor(Date.now() / 1000);
                    if (chartType === 'candle') {
                        seriesRef.current.update({
                            time: now as any,
                            open: q.open ?? q.price,
                            high: q.dayHigh ?? q.price,
                            low: q.dayLow ?? q.price,
                            close: q.price
                        } as any);
                    } else {
                        seriesRef.current.update({
                            time: now as any,
                            value: q.price
                        } as any);
                    }
                }
            } catch (e) {
                // Silent fail for live updates
            }
        };

        const interval = setInterval(updateQuote, 5000);
        return () => clearInterval(interval);
    }, [symbol, isLive, chartType]);

    // Chart initialization
    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return;

        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const container = chartContainerRef.current;
        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
                attributionLogo: false
            },
            localization: {
                priceFormatter: (price: number) => formatPrice(price),
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { color: 'rgba(255, 255, 255, 0.10)' }
            },
            crosshair: { mode: CrosshairMode.Magnet },
            rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.1, bottom: 0.1 } },
            timeScale: { borderVisible: false, visible: false },
            handleScale: false,
            handleScroll: false,
            width: container.clientWidth,
            height: container.clientHeight
        });

        chartRef.current = chart;

        const isIntraday = period === '1D' || period === '5D';
        const sortedData = [...data]
            .filter(d => d.date && d.close != null)
            .sort((a, b) => a.date.localeCompare(b.date));

        const getTimeKey = (date: string): string | number => {
            if (isIntraday) return Math.floor(new Date(date).getTime() / 1000);
            return date.split('T')[0];
        };

        // Deduplicate: keep last entry per time key
        const dedup = <T extends { time: string | number }>(arr: T[]): T[] => {
            const map = new Map<string | number, T>();
            for (const item of arr) map.set(item.time, item);
            return Array.from(map.values());
        };

        const change = sortedData.length > 0
            ? (sortedData[sortedData.length - 1].close ?? 0) - (sortedData[0].close ?? 0)
            : 0;

        if (chartType === 'candle') {
            const series = chart.addSeries(CandlestickSeries, {
                upColor: '#10b981',
                downColor: '#ef4444',
                borderUpColor: '#10b981',
                borderDownColor: '#ef4444',
                wickUpColor: '#10b981',
                wickDownColor: '#ef4444'
            });
            const candleData = dedup(sortedData
                .filter(d => d.open && d.high && d.low && d.close)
                .map(d => ({
                    time: getTimeKey(d.date),
                    open: d.open!,
                    high: d.high!,
                    low: d.low!,
                    close: d.close!
                })));
            series.setData(candleData as any);
            seriesRef.current = series as any;
        } else if (chartType === 'area') {
            const series = chart.addSeries(AreaSeries, {
                topColor: change >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                bottomColor: change >= 0 ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)',
                lineColor: change >= 0 ? '#10b981' : '#ef4444',
                lineWidth: 2
            });
            const areaData = dedup(sortedData.map(d => ({
                time: getTimeKey(d.date),
                value: d.close!
            })));
            series.setData(areaData as any);
            seriesRef.current = series as any;
        } else if (chartType === 'bar') {
            const series = chart.addSeries(BarSeries, {
                upColor: '#10b981',
                downColor: '#ef4444',
                thinBars: true
            });
            const barData = dedup(sortedData
                .filter(d => d.open && d.high && d.low && d.close)
                .map(d => ({
                    time: getTimeKey(d.date),
                    open: d.open!,
                    high: d.high!,
                    low: d.low!,
                    close: d.close!
                })));
            series.setData(barData as any);
            seriesRef.current = series as any;
        } else {
            const series = chart.addSeries(LineSeries, {
                color: change >= 0 ? '#10b981' : '#ef4444',
                lineWidth: 2
            });
            const lineData = dedup(sortedData.map(d => ({
                time: getTimeKey(d.date),
                value: d.close!
            })));
            series.setData(lineData as any);
            seriesRef.current = series as any;
        }

        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [data, chartType, period, formatPrice]);

    const handleSearch = () => {
        if (searchValue.trim() && searchValue.toUpperCase() !== symbol) {
            onSymbolChange(searchValue.toUpperCase().trim());
        }
        setIsEditing(false);
    };

    const change = quote?.change ?? 0;
    const changePercent = quote?.changePercent ?? 0;

    return (
        <div className="flex flex-col h-full bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-800/30">
                {isEditing ? (
                    <div className="flex items-center gap-1 flex-1">
                        <input
                            type="text"
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            onBlur={handleSearch}
                            autoFocus
                            className="w-20 px-2 py-0.5 bg-slate-700 border border-slate-600 rounded text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Symbol"
                        />
                        <button onClick={handleSearch} className="p-1 hover:bg-slate-700 rounded">
                            <Search size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 hover:text-blue-400 transition"
                    >
                        <span className="font-semibold text-sm">{symbol}</span>
                        <Search size={12} className="opacity-50" />
                    </button>
                )}

                <div className="flex items-center gap-1">
                    {quote && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium">{formatPrice(quote.price ?? 0)}</span>
                            <span className={`${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                            </span>
                        </div>
                    )}

                    <button
                        onClick={fetchData}
                        className="p-1 hover:bg-slate-700 rounded transition opacity-50 hover:opacity-100"
                        title="Refresh"
                    >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    </button>

                    {onMaximize && (
                        <button
                            onClick={onMaximize}
                            className="p-1 hover:bg-slate-700 rounded transition opacity-50 hover:opacity-100"
                            title="Maximize"
                        >
                            <Maximize2 size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div ref={chartContainerRef} className="flex-1 min-h-0" />

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
