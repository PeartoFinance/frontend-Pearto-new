'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createChart, ColorType, CrosshairMode, type IChartApi, LineSeries, AreaSeries, CandlestickSeries } from 'lightweight-charts';
import { Grid2X2, Grid3X3, X, Settings } from 'lucide-react';
import { getStockHistory, type PriceHistoryPoint } from '@/services/marketService';
import { useCurrency } from '@/contexts/CurrencyContext';

interface TimeframePane {
    id: string;
    timeframe: string;
    label: string;
    data: PriceHistoryPoint[];
    chart?: IChartApi;
}

interface MultiTimeframeViewProps {
    symbol: string;
    chartType?: 'candle' | 'bar' | 'line' | 'area';
    isOpen: boolean;
    onClose: () => void;
}

// Use valid period/interval combinations supported by Yahoo Finance
const TIMEFRAMES = [
    { id: '1D', label: '1 Day', period: '1d', interval: '5m' },
    { id: '5D', label: '5 Days', period: '5d', interval: '15m' },
    { id: '1M', label: '1 Month', period: '1mo', interval: '1d' },
    { id: '3M', label: '3 Month', period: '3mo', interval: '1d' },
    { id: '1Y', label: '1 Year', period: '1y', interval: '1d' },
    { id: '5Y', label: '5 Year', period: '5y', interval: '1wk' },
];

export default function MultiTimeframeView({
    symbol,
    chartType = 'candle',
    isOpen,
    onClose
}: MultiTimeframeViewProps) {
    const [layout, setLayout] = useState<'2x2' | '1x4'>('2x2');
    const [panes, setPanes] = useState<TimeframePane[]>([
        { id: '1', timeframe: '1D', label: '1 Day', data: [] },
        { id: '2', timeframe: '5D', label: '5 Days', data: [] },
        { id: '3', timeframe: '1M', label: '1 Month', data: [] },
        { id: '4', timeframe: '3M', label: '3 Month', data: [] },
    ]);
    const { formatPrice } = useCurrency();
    const [loading, setLoading] = useState(true);
    const [crosshairTime, setCrosshairTime] = useState<string | null>(null);

    const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const chartRefs = useRef<(IChartApi | null)[]>([]);

    // Load data for all panes
    useEffect(() => {
        if (!isOpen) return;

        async function loadAllData() {
            setLoading(true);
            const newPanes = await Promise.all(
                panes.map(async (pane) => {
                    const tf = TIMEFRAMES.find(t => t.id === pane.timeframe);
                    if (!tf) return pane;

                    try {
                        const response = await getStockHistory(symbol, tf.period, tf.interval);
                        return { ...pane, data: response.data };
                    } catch (error) {
                        console.error(`Failed to load ${pane.timeframe} data:`, error);
                        return pane;
                    }
                })
            );
            setPanes(newPanes);
            setLoading(false);
        }

        loadAllData();
    }, [isOpen, symbol]);

    // Create charts
    useEffect(() => {
        if (!isOpen || loading) return;

        // Cleanup old charts
        chartRefs.current.forEach(chart => {
            if (chart) {
                try {
                    chart.remove();
                } catch (e) {
                    // Ignore disposal errors
                }
            }
        });
        chartRefs.current = [];

        // Create new charts
        panes.forEach((pane, index) => {
            const container = containerRefs.current[index];
            if (!container || pane.data.length === 0) return;

            const chart = createChart(container, {
                layout: {
                    background: { type: ColorType.Solid, color: '#0f172a' },
                    textColor: '#94a3b8',
                    attributionLogo: false
                },
                localization: {
                    priceFormatter: (price: number) => formatPrice(price),
                },
                grid: {
                    vertLines: { color: '#1e293b' },
                    horzLines: { color: '#1e293b' }
                },
                crosshair: { mode: CrosshairMode.Normal },
                rightPriceScale: { borderColor: '#334155', scaleMargins: { top: 0.1, bottom: 0.1 } },
                timeScale: { borderColor: '#334155', timeVisible: true },
                width: container.clientWidth,
                height: container.clientHeight
            });

            // Prepare data - use Map for robust deduplication by date
            const dataMap = new Map<string, PriceHistoryPoint>();
            [...pane.data]
                .filter(d => d.date && d.close != null)
                .sort((a, b) => a.date.localeCompare(b.date))
                .forEach(d => {
                    const timeKey = d.date.split('T')[0];
                    // Keep the last entry for each date (most complete data)
                    dataMap.set(timeKey, d);
                });

            const uniqueData = Array.from(dataMap.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([time, d]) => ({ time, ...d }));

            if (uniqueData.length === 0) {
                chartRefs.current[index] = chart;
                return;
            }

            // Create series based on chart type
            if (chartType === 'candle') {
                const series = chart.addSeries(CandlestickSeries, {
                    upColor: '#10b981',
                    downColor: '#ef4444',
                    borderUpColor: '#10b981',
                    borderDownColor: '#ef4444',
                    wickUpColor: '#10b981',
                    wickDownColor: '#ef4444'
                });

                const candleData = uniqueData
                    .filter(d => d.open && d.high && d.low && d.close)
                    .map(d => ({
                        time: d.time,
                        open: d.open!,
                        high: d.high!,
                        low: d.low!,
                        close: d.close!
                    }));
                series.setData(candleData as any);
            } else if (chartType === 'area') {
                const series = chart.addSeries(AreaSeries, {
                    topColor: 'rgba(16, 185, 129, 0.4)',
                    bottomColor: 'rgba(16, 185, 129, 0.05)',
                    lineColor: '#10b981',
                    lineWidth: 2
                });
                const areaData = uniqueData.map(d => ({
                    time: d.time,
                    value: d.close!
                }));
                series.setData(areaData as any);
            } else {
                const series = chart.addSeries(LineSeries, {
                    color: '#10b981',
                    lineWidth: 2
                });
                const lineData = uniqueData.map(d => ({
                    time: d.time,
                    value: d.close!
                }));
                series.setData(lineData as any);
            }

            chart.timeScale().fitContent();

            // Sync crosshair
            chart.subscribeCrosshairMove(param => {
                if (param.time) {
                    setCrosshairTime(param.time as string);
                }
            });

            chartRefs.current[index] = chart;
        });

        // Handle resize
        const handleResize = () => {
            panes.forEach((_, index) => {
                const container = containerRefs.current[index];
                const chart = chartRefs.current[index];
                if (container && chart) {
                    chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
                }
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartRefs.current.forEach(chart => {
                if (chart) chart.remove();
            });
        };
    }, [isOpen, loading, panes, chartType]);

    // Change timeframe for a pane
    const changeTimeframe = async (paneId: string, newTimeframe: string) => {
        const tf = TIMEFRAMES.find(t => t.id === newTimeframe);
        if (!tf) return;

        try {
            const response = await getStockHistory(symbol, tf.period, tf.interval);
            setPanes(prev => prev.map(p =>
                p.id === paneId
                    ? { ...p, timeframe: newTimeframe, label: tf.label, data: response.data }
                    : p
            ));
        } catch (error) {
            console.error('Failed to load timeframe data:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
            {/* Header */}
            <div className="h-12 border-b border-slate-700 flex items-center justify-between px-4 bg-slate-900">
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-white text-lg">{symbol}</span>
                    <span className="text-slate-400 text-sm">Multi-Timeframe View</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Layout Toggle */}
                    <button
                        onClick={() => setLayout(layout === '2x2' ? '1x4' : '2x2')}
                        className={`p-2 rounded transition ${layout === '2x2' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        title="Toggle layout"
                    >
                        <Grid2X2 size={18} />
                    </button>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Chart Grid */}
            <div className={`flex-1 p-2 gap-2 ${layout === '2x2' ? 'grid grid-cols-2 grid-rows-2' : 'flex flex-row'}`}>
                {panes.map((pane, index) => (
                    <div
                        key={pane.id}
                        className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex flex-col"
                    >
                        {/* Pane Header */}
                        <div className="h-8 border-b border-slate-700 px-3 flex items-center justify-between bg-slate-800/50">
                            <select
                                value={pane.timeframe}
                                onChange={(e) => changeTimeframe(pane.id, e.target.value)}
                                className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
                            >
                                {TIMEFRAMES.map(tf => (
                                    <option key={tf.id} value={tf.id} className="bg-slate-800">
                                        {tf.label}
                                    </option>
                                ))}
                            </select>
                            {pane.data.length > 0 && (
                                <span className="text-xs text-slate-500">
                                    {pane.data.length} bars
                                </span>
                            )}
                        </div>

                        {/* Chart Container */}
                        <div
                            ref={el => { containerRefs.current[index] = el; }}
                            className="flex-1 relative"
                        >
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
