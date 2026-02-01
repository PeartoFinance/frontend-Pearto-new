'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries } from 'lightweight-charts';
import { ArrowUp, ArrowDown, Loader2, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { getForexHistory } from '@/services/marketService';

const pairs = [
    { symbol: 'EURUSD', name: 'EUR/USD' },
    { symbol: 'GBPUSD', name: 'GBP/USD' },
    { symbol: 'USDJPY', name: 'USD/JPY' },
    { symbol: 'USDCHF', name: 'USD/CHF' },
    { symbol: 'AUDUSD', name: 'AUD/USD' },
    { symbol: 'USDCAD', name: 'USD/CAD' },
];

export default function ForexChart() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);
    const [selectedPair, setSelectedPair] = useState('EURUSD');
    const [timeframe, setTimeframe] = useState('1mo');
    const [loading, setLoading] = useState(false);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [change24h, setChange24h] = useState<number | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(148, 163, 184, 0.1)' },
                horzLines: { color: 'rgba(148, 163, 184, 0.1)' },
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

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

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
                    const chartData = data.map(item => ({
                        time: item.date.split('T')[0], // Lightweight charts prefers YYYY-MM-DD for daily
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

    const handlePairChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'CUSTOM') {
            setShowCustomInput(true);
            setSelectedPair(''); // clear for typing
        } else {
            setShowCustomInput(false);
            setSelectedPair(val);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    {!showCustomInput ? (
                        <select
                            value={selectedPair}
                            onChange={handlePairChange}
                            className="bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 cursor-pointer text-slate-900 dark:text-white"
                        >
                            {pairs.map(pair => (
                                <option key={pair.symbol} value={pair.symbol}>{pair.name}</option>
                            ))}
                            <option value="CUSTOM">Manual Selection...</option>
                        </select>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="e.g. BTCUSD"
                                className="bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white w-32 uppercase"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value.toUpperCase();
                                        if (val) setSelectedPair(val);
                                    }
                                }}
                                autoFocus
                                onBlur={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    if (val) setSelectedPair(val);
                                }}
                            />
                            <button
                                onClick={() => setShowCustomInput(false)}
                                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {currentPrice ? currentPrice.toFixed(selectedPair.includes('JPY') ? 2 : 5) : '-'}
                                </span>
                                <span className={`flex items-center text-sm font-medium ${(change24h || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                                    } mb-1`}>
                                    {(change24h || 0) >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                    {Math.abs(change24h || 0).toFixed(2)}%
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeframe === tf
                                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>

                <Link
                    href={`/chart/${selectedPair}`}
                    target="_blank"
                    className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                >
                    <Maximize2 size={14} />
                    Advanced Chart
                </Link>
            </div>

            <div ref={chartContainerRef} className="w-full h-[300px] sm:h-[400px]" />
        </div>
    );
}
