'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    createChart,
    ColorType,
    CandlestickSeries,
    AreaSeries,
    LineSeries,
    HistogramSeries,
    type IChartApi,
    type ISeriesApi,
    CrosshairMode
} from 'lightweight-charts';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
    ArrowLeft,
    Maximize2,
    Minimize2,
    Settings,
    TrendingUp,
    Activity,
    BarChart2,
    Mountain,
    Star,
    StarOff,
    ExternalLink,
    ChevronDown,
    Plus,
    Search,
    Bell,
    Menu
} from 'lucide-react';
import { getStockHistory, getStockProfile, getCryptoHistory, getForexHistory, type PriceHistoryPoint, type MarketStock } from '@/services/marketService';
import ChartToolbar from './toolbar/ChartToolbar';
import { useChartDrawings, type Drawing, type DrawingPoint } from '@/hooks/useChartDrawings';
import { detectPatterns, type ChartMarker } from '@/utils/technicalAnalysis';
import ChartSidebar from './sidebar/ChartSidebar';
import IndicatorPanel, { type IndicatorConfig } from './indicators/IndicatorPanel';
import {
    calculateSMA,
    calculateEMA,
    calculateBollingerBands,
    type OHLCData
} from '@/utils/indicators';
import ComparisonMode, { type ComparisonSymbol } from './ComparisonMode';
import MultiTimeframeView from './MultiTimeframeView';
import { ChartGridLayout, ChartLayoutSelector, type ChartLayout } from './layout';
import RiskAnalysisPanel from './RiskAnalysisPanel';

interface AdvancedChartPageProps {
    symbol: string;
    assetType?: 'stock' | 'crypto' | 'forex' | 'commodity';
}

// ... (code omitted for brevity if not strictly needed, but I should probably just replace the block)

// Actually, I can use the tool to replace smaller chunks?
// The tool requires context.
// Let's replace the Interface and the fetchData block.

// Interface replacement not shown here as I need to be careful with line numbers.
// I will just replace the specific blocks.


type ChartType = 'candle' | 'area' | 'line' | 'bar';
type Period = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'All';
type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo';

const PERIODS: { id: Period; label: string }[] = [
    { id: '1D', label: '1D' },
    { id: '5D', label: '5D' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: '6M', label: '6M' },
    { id: 'YTD', label: 'YTD' },
    { id: '1Y', label: '1Y' },
    { id: '5Y', label: '5Y' },
    { id: 'All', label: 'All' }
];

const INTERVALS: { id: Interval; label: string }[] = [
    { id: '1m', label: '1 min' },
    { id: '5m', label: '5 min' },
    { id: '15m', label: '15 min' },
    { id: '30m', label: '30 min' },
    { id: '1h', label: '1 hour' },
    { id: '1d', label: '1 day' },
    { id: '1wk', label: '1 week' },
    { id: '1mo', label: '1 month' }
];

const CHART_TYPES: { id: ChartType; icon: typeof BarChart2; label: string }[] = [
    { id: 'candle', icon: BarChart2, label: 'Candlestick' },
    { id: 'area', icon: Mountain, label: 'Mountain' },
    { id: 'line', icon: TrendingUp, label: 'Line' },
    { id: 'bar', icon: Activity, label: 'OHLC Bars' }
];

export default function AdvancedChartPage({ symbol, assetType = 'stock' }: AdvancedChartPageProps) {
    const router = useRouter();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const volumeContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const volumeChartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick' | 'Area' | 'Line'> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const indicatorSeriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
    const comparisonSeriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PriceHistoryPoint[]>([]);
    const [profile, setProfile] = useState<MarketStock | null>(null);
    const [period, setPeriod] = useState<Period>('1D');
    const [interval, setInterval] = useState<Interval>('1m');
    const [chartType, setChartType] = useState<ChartType>('area');
    const [layout, setLayout] = useState<ChartLayout>('1x1');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showIntervalDropdown, setShowIntervalDropdown] = useState(false);
    const [showChartTypeDropdown, setShowChartTypeDropdown] = useState(false);
    const [showPatterns, setShowPatterns] = useState(false);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showMultiTimeframe, setShowMultiTimeframe] = useState(false);
    const [showRiskPanel, setShowRiskPanel] = useState(false);
    const [crosshairData, setCrosshairData] = useState<{ time: string; price: number; change: number; volume: number } | null>(null);
    const { formatPrice } = useCurrency();

    // Drawing tools
    const { drawings, activeTool, startDrawingTool, clearAll } = useChartDrawings(symbol);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingStart, setDrawingStart] = useState<DrawingPoint | null>(null);
    const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);

    // Technical indicators
    const [activeIndicators, setActiveIndicators] = useState<IndicatorConfig[]>([]);

    // Comparison symbols
    const [comparisonSymbols, setComparisonSymbols] = useState<ComparisonSymbol[]>([]);

    // Indicator handlers
    const handleAddIndicator = (indicator: IndicatorConfig) => {
        setActiveIndicators(prev => [...prev, indicator]);
    };

    const handleRemoveIndicator = (indicatorId: string) => {
        setActiveIndicators(prev => prev.filter(i => i.id !== indicatorId));
    };

    const handleUpdateIndicator = (indicatorId: string, params: Record<string, number>) => {
        setActiveIndicators(prev => prev.map(i =>
            i.id === indicatorId ? { ...i, params } : i
        ));
    };

    // Period to API params mapping
    const getPeriodParams = useCallback((p: Period) => {
        const map: Record<Period, { period: string; interval: string }> = {
            '1D': { period: '1d', interval: '1m' },
            '5D': { period: '5d', interval: '5m' },
            '1M': { period: '1mo', interval: '1h' },
            '3M': { period: '3mo', interval: '1d' },
            '6M': { period: '6mo', interval: '1d' },
            'YTD': { period: 'ytd', interval: '1d' },
            '1Y': { period: '1y', interval: '1d' },
            '5Y': { period: '5y', interval: '1wk' },
            'All': { period: 'max', interval: '1wk' }
        };
        return map[p] || { period: '1mo', interval: '1d' };
    }, []);

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { period: apiPeriod, interval: apiInterval } = getPeriodParams(period);
            let historyData: PriceHistoryPoint[] = [];

            if (assetType === 'crypto') {
                const response = await getCryptoHistory(symbol, apiPeriod, apiInterval);
                historyData = response.data;
            } else if (assetType === 'forex') {
                historyData = await getForexHistory(symbol, apiPeriod, apiInterval);
            } else if (assetType === 'commodity') {
                const response = await getStockHistory(symbol, apiPeriod, apiInterval);
                historyData = response.data;
            } else {
                const response = await getStockHistory(symbol, apiPeriod, apiInterval);
                historyData = response.data;
                // Also fetch profile
                try {
                    const p = await getStockProfile(symbol);
                    setProfile(p);
                } catch { }
            }

            setData(historyData || []);
        } catch (e) {
            console.error('Failed to fetch chart data:', e);
        } finally {
            setLoading(false);
        }
    }, [symbol, period, assetType, getPeriodParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate current stats
    const stats = useMemo(() => {
        if (data.length === 0) return null;
        const latest = data[data.length - 1];
        const first = data[0];
        const change = (latest.close ?? 0) - (first.close ?? 0);
        const changePercent = first.close ? (change / first.close) * 100 : 0;
        return {
            price: latest.close ?? 0,
            change,
            changePercent,
            high: Math.max(...data.map(d => d.high ?? 0)),
            low: Math.min(...data.filter(d => d.low).map(d => d.low ?? Infinity)),
            volume: data.reduce((sum, d) => sum + (d.volume ?? 0), 0)
        };
    }, [data]);

    // Initialize/update chart
    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return;

        // Cleanup old chart
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }
        if (volumeChartRef.current) {
            volumeChartRef.current.remove();
            volumeChartRef.current = null;
        }

        const container = chartContainerRef.current;

        // Main chart
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
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { color: '#475569', width: 1, style: 2, labelBackgroundColor: '#1e293b' },
                horzLine: { color: '#475569', width: 1, style: 2, labelBackgroundColor: '#1e293b' }
            },
            rightPriceScale: {
                borderColor: '#334155',
                scaleMargins: { top: 0.1, bottom: 0.2 }
            },
            timeScale: {
                borderColor: '#334155',
                timeVisible: true,
                secondsVisible: period === '1D'
            },
            width: container.clientWidth,
            height: container.clientHeight
        });

        chartRef.current = chart;

        // Prepare data - deduplicate by time key
        // For intraday periods (1D, 5D), use full timestamp; for daily+, use date only
        const dataMap = new Map<string, typeof data[0]>();
        const isIntraday = period === '1D' || period === '5D';

        [...data]
            .filter(d => d.date && d.close != null)
            .sort((a, b) => a.date.localeCompare(b.date))
            .forEach(d => {
                // Use full timestamp for intraday, date-only for daily+
                const timeKey = isIntraday ? d.date : d.date.split('T')[0];
                dataMap.set(timeKey, d); // Last value for each time wins
            });
        const sortedData = Array.from(dataMap.values());

        // Create series based on chart type
        let mainSeries: ISeriesApi<'Candlestick' | 'Area' | 'Line'>;

        // Helper to get time key for chart data
        // For intraday: use Unix timestamp (seconds). For daily+: use YYYY-MM-DD string.
        const getTimeKey = (date: string): string | number => {
            if (isIntraday) {
                return Math.floor(new Date(date).getTime() / 1000); // Unix timestamp in seconds
            }
            return date.split('T')[0]; // YYYY-MM-DD
        };

        if (chartType === 'candle' || chartType === 'bar') {
            mainSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#10b981',
                downColor: '#ef4444',
                borderUpColor: '#10b981',
                borderDownColor: '#ef4444',
                wickUpColor: '#10b981',
                wickDownColor: '#ef4444'
            });

            const candleData = sortedData
                .filter(d => d.open && d.high && d.low && d.close)
                .map(d => ({
                    time: getTimeKey(d.date),
                    open: d.open!,
                    high: d.high!,
                    low: d.low!,
                    close: d.close!
                }));
            mainSeries.setData(candleData as any);
        } else if (chartType === 'area') {
            mainSeries = chart.addSeries(AreaSeries, {
                topColor: stats && stats.change >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                bottomColor: stats && stats.change >= 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                lineColor: stats && stats.change >= 0 ? '#10b981' : '#ef4444',
                lineWidth: 2
            });

            const areaData = sortedData.map(d => ({
                time: getTimeKey(d.date),
                value: d.close!
            }));
            mainSeries.setData(areaData as any);
        } else {
            mainSeries = chart.addSeries(LineSeries, {
                color: stats && stats.change >= 0 ? '#10b981' : '#ef4444',
                lineWidth: 2
            });

            const lineData = sortedData.map(d => ({
                time: getTimeKey(d.date),
                value: d.close!
            }));
            mainSeries.setData(lineData as any);
        }

        seriesRef.current = mainSeries;

        // Volume chart
        if (volumeContainerRef.current) {
            const volumeChart = createChart(volumeContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: '#0f172a' },
                    textColor: '#94a3b8',
                    attributionLogo: false
                },
                grid: {
                    vertLines: { visible: false },
                    horzLines: { color: '#1e293b' }
                },
                rightPriceScale: { borderColor: '#334155' },
                timeScale: { visible: false, borderColor: '#334155' },
                width: volumeContainerRef.current.clientWidth,
                height: 80
            });

            volumeChartRef.current = volumeChart;

            const volumeSeries = volumeChart.addSeries(HistogramSeries, {
                color: '#3b82f6',
                priceFormat: { type: 'volume' }
            });

            const volumeData = sortedData.map((d, i) => ({
                time: getTimeKey(d.date),
                value: d.volume ?? 0,
                color: i > 0 && (d.close ?? 0) >= (sortedData[i - 1].close ?? 0) ? '#10b98180' : '#ef444480'
            }));
            volumeSeries.setData(volumeData as any);
            volumeSeriesRef.current = volumeSeries;

            // Sync time scales
            chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
                if (range) volumeChart.timeScale().setVisibleLogicalRange(range);
            });
        }

        chart.timeScale().fitContent();

        // Crosshair subscriber
        chart.subscribeCrosshairMove(param => {
            if (param.time && param.point) {
                const dataPoint = sortedData.find(d => getTimeKey(d.date) === param.time);
                if (dataPoint) {
                    const first = sortedData[0];
                    const change = (dataPoint.close ?? 0) - (first.close ?? 0);
                    setCrosshairData({
                        time: dataPoint.date,
                        price: dataPoint.close ?? 0,
                        change,
                        volume: dataPoint.volume ?? 0
                    });
                }
            } else {
                setCrosshairData(null);
            }
        });

        // Resize handler
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
            if (volumeContainerRef.current && volumeChartRef.current) {
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
    }, [data, chartType, stats, period]);

    // Render indicators when activeIndicators change
    useEffect(() => {
        if (!chartRef.current || data.length === 0) return;

        const chart = chartRef.current;

        // Convert data to OHLC format
        const ohlcData: OHLCData[] = data
            .filter(d => d.date && d.close != null)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(d => ({
                time: d.date.split('T')[0],
                open: d.open ?? d.close!,
                high: d.high ?? d.close!,
                low: d.low ?? d.close!,
                close: d.close!,
                volume: d.volume ?? 0
            }));

        // Remove old indicator series that are no longer active
        const currentIds = new Set(activeIndicators.map(i => i.id));
        indicatorSeriesRef.current.forEach((series, id) => {
            if (!currentIds.has(id)) {
                try {
                    chart.removeSeries(series);
                } catch (e) {
                    // Series may already be removed
                }
                indicatorSeriesRef.current.delete(id);
            }
        });

        // Add or update indicator series
        activeIndicators.forEach(indicator => {
            if (!indicator.isActive) return;

            // Skip if already rendered with same params
            if (indicatorSeriesRef.current.has(indicator.id)) {
                return;
            }

            let indicatorData: { time: string | number; value: number }[] = [];

            switch (indicator.type) {
                case 'sma':
                    indicatorData = calculateSMA(ohlcData, indicator.params.period || 20);
                    break;
                case 'ema':
                    indicatorData = calculateEMA(ohlcData, indicator.params.period || 20);
                    break;
                case 'bollinger': {
                    const bb = calculateBollingerBands(ohlcData, indicator.params.period || 20, indicator.params.stdDev || 2);
                    // For Bollinger, we add middle band as main line
                    indicatorData = bb.map(b => ({ time: b.time, value: b.middle }));
                    break;
                }
                default:
                    // For other indicators, skip for now (can add later)
                    return;
            }

            if (indicatorData.length > 0) {
                const series = chart.addSeries(LineSeries, {
                    color: indicator.color,
                    lineWidth: 2,
                    priceLineVisible: false,
                    lastValueVisible: false
                });
                series.setData(indicatorData as any);
                indicatorSeriesRef.current.set(indicator.id, series);
            }
        });
    }, [activeIndicators, data]);

    // Render comparison symbols on chart
    useEffect(() => {
        if (!chartRef.current) return;
        const chart = chartRef.current;

        // Remove old comparison series that are no longer active
        const currentSymbols = new Set(comparisonSymbols.filter(c => c.visible).map(c => c.symbol));
        comparisonSeriesRef.current.forEach((series, symbol) => {
            if (!currentSymbols.has(symbol)) {
                try {
                    chart.removeSeries(series);
                } catch (e) {
                    // Series may already be removed
                }
                comparisonSeriesRef.current.delete(symbol);
            }
        });

        // Add or update comparison series
        comparisonSymbols.forEach(comparison => {
            if (!comparison.visible || comparison.data.length === 0) return;

            // Skip if already rendered
            if (comparisonSeriesRef.current.has(comparison.symbol)) return;

            // Create new line series for this comparison
            const series = chart.addSeries(LineSeries, {
                color: comparison.color,
                lineWidth: 2,
                priceScaleId: 'comparison', // Separate scale for normalized percentages
                lastValueVisible: true,
                priceLineVisible: false,
                title: comparison.symbol
            });

            // Deduplicate by time
            const dataMap = new Map<string, number>();
            comparison.data.forEach(d => dataMap.set(d.time, d.value));
            const uniqueData = Array.from(dataMap.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([time, value]) => ({ time, value }));

            series.setData(uniqueData as any);
            comparisonSeriesRef.current.set(comparison.symbol, series);
        });

        // Configure comparison price scale if we have comparisons
        if (comparisonSymbols.filter(c => c.visible).length > 0) {
            chart.priceScale('comparison').applyOptions({
                scaleMargins: { top: 0.1, bottom: 0.1 },
                visible: true,
                borderColor: '#334155'
            });
        }
    }, [comparisonSymbols]);

    // Fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    const formatNumber = (num: number) => {
        if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toFixed(2);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Top Header Bar */}
            <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
                {/* Left: Back + Symbol */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-800 rounded-lg transition"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold">{symbol}</span>
                        {profile && (
                            <span className="text-sm text-slate-400 hidden sm:inline">{profile.name}</span>
                        )}

                        {stats && (
                            <div className="flex items-center gap-2 ml-4">
                                <span className="text-2xl font-semibold">
                                    {formatPrice(crosshairData?.price ?? stats.price)}
                                </span>
                                <span className={`text-sm font-medium px-2 py-0.5 rounded ${(crosshairData?.change ?? stats.change) >= 0
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {(crosshairData?.change ?? stats.change) >= 0 ? '+' : ''}
                                    {((crosshairData?.change ?? stats.change)).toFixed(2)}
                                    ({stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%)
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsInWatchlist(!isInWatchlist)}
                        className={`p-2 rounded-lg transition ${isInWatchlist ? 'text-yellow-400 bg-yellow-400/10' : 'hover:bg-slate-800'}`}
                    >
                        {isInWatchlist ? <Star size={20} fill="currentColor" /> : <StarOff size={20} />}
                    </button>

                    <Link
                        href={`/stocks/${symbol}`}
                        className="p-2 hover:bg-slate-800 rounded-lg transition"
                        title="View Stock Details"
                    >
                        <ExternalLink size={20} />
                    </Link>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-slate-800 rounded-lg transition"
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>

                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={`p-2 rounded-lg transition ${showSidebar ? 'bg-slate-700' : 'hover:bg-slate-800'}`}
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            {/* Chart Controls Bar */}
            <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50">
                {/* Period Selector */}
                <div className="flex items-center gap-1">
                    {PERIODS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`px-3 py-1.5 text-sm font-medium rounded transition ${period === p.id
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Center: Interval + Chart Type */}
                <div className="flex items-center gap-3">
                    {/* Interval Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowIntervalDropdown(!showIntervalDropdown); setShowChartTypeDropdown(false); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm"
                        >
                            {INTERVALS.find(i => i.id === interval)?.label || interval}
                            <ChevronDown size={14} />
                        </button>
                        {showIntervalDropdown && (
                            <div className="absolute top-full mt-1 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1 min-w-32">
                                {INTERVALS.map(i => (
                                    <button
                                        key={i.id}
                                        onClick={() => { setInterval(i.id); setShowIntervalDropdown(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 ${interval === i.id ? 'text-blue-400' : ''}`}
                                    >
                                        {i.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chart Type Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowChartTypeDropdown(!showChartTypeDropdown); setShowIntervalDropdown(false); }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm"
                        >
                            {(() => {
                                const ct = CHART_TYPES.find(c => c.id === chartType);
                                return ct ? <ct.icon size={16} /> : null;
                            })()}
                            {CHART_TYPES.find(c => c.id === chartType)?.label}
                            <ChevronDown size={14} />
                        </button>
                        {showChartTypeDropdown && (
                            <div className="absolute top-full mt-1 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1 min-w-40">
                                {CHART_TYPES.map(ct => (
                                    <button
                                        key={ct.id}
                                        onClick={() => { setChartType(ct.id); setShowChartTypeDropdown(false); }}
                                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 ${chartType === ct.id ? 'text-blue-400' : ''}`}
                                    >
                                        <ct.icon size={16} />
                                        {ct.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pattern Toggle */}
                    <button
                        onClick={() => setShowPatterns(!showPatterns)}
                        className={`px-3 py-1.5 text-sm rounded transition ${showPatterns ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                        Patterns
                    </button>

                    {/* Risk Analysis Toggle */}
                    <button
                        onClick={() => setShowRiskPanel(!showRiskPanel)}
                        className={`px-3 py-1.5 text-sm rounded transition flex items-center gap-1 ${showRiskPanel ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                        Risk
                    </button>

                    {/* Indicators Panel */}
                    <IndicatorPanel
                        activeIndicators={activeIndicators}
                        onAddIndicator={handleAddIndicator}
                        onRemoveIndicator={handleRemoveIndicator}
                        onUpdateIndicator={handleUpdateIndicator}
                    />

                    {/* Comparison Mode */}
                    <ComparisonMode
                        primarySymbol={symbol}
                        primaryData={data}
                        onComparisonDataChange={setComparisonSymbols}
                    />

                    {/* Multi-Timeframe Toggle */}
                    <button
                        onClick={() => setShowMultiTimeframe(true)}
                        className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded transition"
                    >
                        Multi-TF
                    </button>

                    {/* Layout Selector */}
                    <div className="flex items-center gap-2 border-l border-slate-700/50 pl-3 ml-1">
                        <ChartLayoutSelector
                            layout={layout}
                            onLayoutChange={setLayout}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Drawing Tools */}
                <div className="w-12 border-r border-slate-800 bg-slate-900/50 flex flex-col items-center py-2 gap-1">
                    <ChartToolbar
                        activeTool={activeTool}
                        onToolSelect={startDrawingTool}
                        onClearDrawings={clearAll}
                        variant="vertical-compact"
                    />
                </div>

                {/* Center: Chart */}
                <div className="flex-1 flex flex-col relative min-h-0 bg-slate-950">
                    {layout === '1x1' ? (
                        <>
                            {/* Loading overlay */}
                            {loading && (
                                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-10 transition-opacity duration-300">
                                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            {/* Main chart */}
                            <div ref={chartContainerRef} className="flex-1 w-full" />

                            {/* Volume chart */}
                            <div ref={volumeContainerRef} className="h-20 border-t border-slate-800 w-full" />

                            {/* SVG Drawing Layer */}
                            <svg
                                ref={svgRef}
                                className="absolute inset-0 pointer-events-none"
                                style={{ top: 0, left: 0, width: '100%', height: 'calc(100% - 80px)' }}
                            >
                                {/* Existing drawings would render here */}
                            </svg>
                        </>
                    ) : (
                        <ChartGridLayout
                            primarySymbol={symbol}
                            chartType={chartType}
                            period={period}
                            isLive={false}
                            onMaximizePanel={(s) => {
                                router.push(`/stock/${s}`);
                            }}
                        />
                    )}
                </div>

                {/* Right: Sidebar */}
                {showSidebar && (
                    <ChartSidebar symbol={symbol} />
                )}
            </div>

            {/* Bottom Status Bar */}
            <footer className="h-8 border-t border-slate-800 flex items-center justify-between px-4 text-xs text-slate-500 bg-slate-900/50">
                <div className="flex items-center gap-4">
                    <span>O: {data.length > 0 && crosshairData?.time ? formatPrice(data.find(d => d.date.split('T')[0] === crosshairData.time || Math.floor(new Date(d.date).getTime() / 1000) === (crosshairData.time as any))?.open ?? 0) : '-'}</span>
                    <span>H: {data.length > 0 && crosshairData?.time ? formatPrice(data.find(d => d.date.split('T')[0] === crosshairData.time || Math.floor(new Date(d.date).getTime() / 1000) === (crosshairData.time as any))?.high ?? 0) : '-'}</span>
                    <span>L: {data.length > 0 && crosshairData?.time ? formatPrice(data.find(d => d.date.split('T')[0] === crosshairData.time || Math.floor(new Date(d.date).getTime() / 1000) === (crosshairData.time as any))?.low ?? 0) : '-'}</span>
                    <span>C: {crosshairData ? formatPrice(crosshairData.price) : '-'}</span>
                    <span>Vol: {crosshairData ? formatNumber(crosshairData.volume) : '-'}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Data by Yahoo Finance</span>
                    <span>© 2026 Pearto Finance</span>
                </div>
            </footer>

            {/* Risk Analysis Panel */}
            <RiskAnalysisPanel
                symbol={symbol}
                isOpen={showRiskPanel}
                onClose={() => setShowRiskPanel(false)}
            />

            {/* Multi-Timeframe View Modal */}
            <MultiTimeframeView
                symbol={symbol}
                chartType={chartType}
                isOpen={showMultiTimeframe}
                onClose={() => setShowMultiTimeframe(false)}
            />
        </div>
    );
}
