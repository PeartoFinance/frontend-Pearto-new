'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries } from 'lightweight-charts';
import { ArrowUp, ArrowDown, Loader2, Maximize2, Activity } from 'lucide-react';
import Link from 'next/link';
import { getForexHistory } from '@/services/marketService';
import StockSymbolInput from '@/components/common/StockSymbolInput';
import { useChartResize } from '@/hooks/useChartResize';

const defaultPairs = [
    { symbol: 'EURUSD', name: 'EUR/USD' },
    { symbol: 'GBPUSD', name: 'GBP/USD' },
    { symbol: 'USDJPY', name: 'USD/JPY' },
    { symbol: 'USDCHF', name: 'USD/CHF' },
    { symbol: 'AUDUSD', name: 'AUD/USD' },
    { symbol: 'USDCAD', name: 'USD/CAD' },
    { symbol: 'USDNPR', name: 'USD/NPR' },
    { symbol: 'USDINR', name: 'USD/INR' },
    { symbol: 'USDCNY', name: 'USD/CNY' },
    { symbol: 'GBPEUR', name: 'GBP/EUR' },
];

interface ForexChartProps {
    pair?: string;
    onPairChange?: (pair: string) => void;
}

export default function ForexChart({ pair, onPairChange }: ForexChartProps = {}) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);

    // Internal state for when uncontrolled, or to mirror prop
    const [internalPair, setInternalPair] = useState('EURUSD');

    // Use prop if available, otherwise internal state
    const selectedPair = pair || internalPair;

    // Build pairs list — include param pair if not in defaults
    const pairs = (() => {
        const list = [...defaultPairs];
        if (selectedPair && !list.some(p => p.symbol === selectedPair)) {
            const sym = selectedPair.toUpperCase();
            const base = sym.slice(0, 3);
            const quote = sym.slice(3);
            list.push({ symbol: sym, name: `${base}/${quote}` });
        }
        return list;
    })();

    const [timeframe, setTimeframe] = useState('1mo');
    const [loading, setLoading] = useState(false);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [change24h, setChange24h] = useState<number | null>(null);

    // Sync internal state if prop changes (optional, but good for hybrid usage)
    useEffect(() => {
        if (pair) {
            setInternalPair(pair);
        }
    }, [pair]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(148, 163, 184, 0.2)' },
                horzLines: { color: 'rgba(148, 163, 184, 0.2)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        seriesRef.current = candlestickSeries;
        chartRef.current = chart;

        return () => {
            chart.remove();
        };
    }, []);

    // Apply ResizeObserver hook for robust responsive sizing
    useChartResize(chartRef.current, chartContainerRef);

    // Load Data Effect
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Map UI timeframe to API period
                // 1H -> 1d (int 5m), 1D -> 1mo (int 1h/1d), 1W -> 3mo, 1M -> 1y
                // Simplified mapping for now, using standard periods
                const periodMap: Record<string, string> = {
                    '1H': '5d', // interval 15m or 60m
                    '1D': '1mo',
                    '1W': '3mo',
                    '1M': '1y',
                    '1Y': '5y'
                };

                const intervalMap: Record<string, string> = {
                    '1H': '60m',
                    '1D': '1d',
                    '1W': '1d',
                    '1M': '1d',
                    '1Y': '1wk'
                };

                const period = periodMap[timeframe] || '1mo';
                const interval = intervalMap[timeframe] || '1d';

                const data = await getForexHistory(selectedPair, period, interval);

                if (seriesRef.current && data.length > 0) {
                    // Use Unix timestamp for intraday (1H), date string for daily+
                    const isIntraday = timeframe === '1H';
                    const getTimeKey = (date: string): string | number => {
                        if (isIntraday && date.includes('T')) {
                            return Math.floor(new Date(date).getTime() / 1000);
                        }
                        return date.split('T')[0];
                    };

                    const chartData = data.map(item => ({
                        time: getTimeKey(item.date),
                        open: item.open,
                        high: item.high,
                        low: item.low,
                        close: item.close
                    })).filter(d => d.open !== null);

                    seriesRef.current.setData(chartData);
                    chartRef.current?.timeScale().fitContent();

                    // Update header display
                    const last = chartData[chartData.length - 1];
                    const prev = chartData[chartData.length - 2] || last;

                    if (last && last.close) {
                        setCurrentPrice(last.close);
                        if (prev && prev.close) {
                            setChange24h(((last.close - prev.close) / prev.close) * 100);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load forex data", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedPair, timeframe]);

    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleUpdatePair = (newPair: string) => {
        setInternalPair(newPair);
        if (onPairChange) {
            onPairChange(newPair);
        }
    };

    const handlePairChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'CUSTOM') {
            setShowCustomInput(true);
            // Don't clear selectedPair visually here to avoid jumping, just show input
        } else {
            setShowCustomInput(false);
            handleUpdatePair(val);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-6 shadow-sm overflow-hidden max-w-full">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-6">

                {/* Left Side: Pair Selector & Price */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 w-full xl:w-auto">
                    {!showCustomInput ? (
                        <select
                            value={selectedPair}
                            onChange={handlePairChange}
                            className="bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 cursor-pointer text-slate-900 dark:text-white max-w-[140px] truncate"
                        >
                            {pairs.map(pair => (
                                <option key={pair.symbol} value={pair.symbol}>{pair.name}</option>
                            ))}
                            <option value="CUSTOM">Manual...</option>
                        </select>
                    ) : (
                        <div className="flex items-center gap-2">
                            <StockSymbolInput
                                value={internalPair}
                                onChange={(val) => {
                                    handleUpdatePair(val);
                                    setShowCustomInput(false);
                                }}
                                assetType="forex"
                                placeholder="Search pair..."
                                className="w-40"
                            />
                            <button
                                onClick={() => setShowCustomInput(false)}
                                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 whitespace-nowrap"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    <div className="flex items-end gap-2">
                        {loading ? (
                            <Loader2 className="animate-spin text-slate-400" size={24} />
                        ) : (
                            <>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                    {currentPrice ? currentPrice.toFixed(selectedPair.includes('JPY') ? 2 : 5) : '-'}
                                </span>
                                <span className={`flex items-center text-sm font-medium ${(change24h || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                                    } mb-1 whitespace-nowrap`}>
                                    {(change24h || 0) >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                    {Math.abs(change24h || 0).toFixed(2)}%
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Side: Timeframes & Actions */}
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 overflow-x-auto max-w-full no-scrollbar">
                        {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${timeframe === tf
                                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 ml-auto xl:ml-0">
                        <Link
                            href={`/chart/${selectedPair}?type=forex`}
                            target="_blank"
                            className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-1 whitespace-nowrap"
                        >
                            <Maximize2 size={14} />
                            <span className="hidden sm:inline">Advanced</span>
                        </Link>
                        <Link
                            href={`/live?symbol=${selectedPair}&type=forex`}
                            target="_blank"
                            className="px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition flex items-center gap-1 whitespace-nowrap"
                        >
                            <Activity size={14} />
                            <span className="hidden sm:inline">Live Chart</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Chart Container with specific fix for resizing */}
            <div className="relative w-full h-[300px] sm:h-[400px] min-w-0">
                <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
            </div>
        </div>
    );
}
