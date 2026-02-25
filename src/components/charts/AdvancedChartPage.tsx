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
    TrendingDown,
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
    Menu,
    Clock,
    Layers,
    Shield,
    LineChart,
    ArrowUpRight,
    ArrowDownRight,
    LayoutGrid,
    SlidersHorizontal,
    GitCompareArrows,
    Eye
} from 'lucide-react';
import { getStockHistory, getStockProfile, getCryptoHistory, getForexHistory, type PriceHistoryPoint, type MarketStock } from '@/services/marketService';
import ChartToolbar from './toolbar/ChartToolbar';
import ChartTypeSelector from './toolbar/ChartTypeSelector';
import IntervalSelector from './toolbar/IntervalSelector';
import { useChartDrawings, type Drawing, type DrawingPoint } from '@/hooks/useChartDrawings';
import { detectPatterns, type ChartMarker, dedupeAndSortChartData } from '@/utils/technicalAnalysis';
import ChartSidebar from './sidebar/ChartSidebar';
import IndicatorPanel, { type IndicatorConfig } from './indicators/IndicatorPanel';
import {
    calculateSMA,
    calculateEMA,
    calculateBollingerBands,
    calculateRSI,
    calculateMACD,
    type OHLCData
} from '@/utils/indicators';
import { createSeriesMarkers } from 'lightweight-charts';
import ComparisonMode, { type ComparisonSymbol } from './ComparisonMode';
import { getAssetDetailPath } from '@/utils/assetRoutes';
import MultiTimeframeView from './MultiTimeframeView';
import { ChartGridLayout, ChartLayoutSelector, type ChartLayout } from './layout';
import RiskAnalysisPanel from './RiskAnalysisPanel';
import { useSubscription } from '@/context/SubscriptionContext';
import { FeatureLock } from '@/components/subscription/FeatureGating';

interface AdvancedChartPageProps {
    symbol: string;
    assetType?: 'stock' | 'crypto' | 'forex' | 'commodity' | 'index' | 'etf';
}


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

    const [showPatterns, setShowPatterns] = useState(false);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showMultiTimeframe, setShowMultiTimeframe] = useState(false);
    const [showRiskPanel, setShowRiskPanel] = useState(false);
    const [crosshairData, setCrosshairData] = useState<{ time: string; price: number; change: number; volume: number } | null>(null);
    const { formatPrice } = useCurrency();
    const { hasFeature } = useSubscription();

    // Drawing tools
    const { drawings, activeTool, startDrawingTool, clearAll } = useChartDrawings(symbol);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingStart, setDrawingStart] = useState<DrawingPoint | null>(null);
    const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);

    const patternMarkersRef = useRef<any>(null);

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

    // Period to API params mapping with backend validation rules:
    // - 1m interval: only valid with 1d/5d/7d periods
    // - 2m-90m intervals: max period is 1mo
    // - 1d+ intervals: any period works
    const getPeriodParams = useCallback((p: Period, selectedInterval: Interval) => {
        const defaults: Record<Period, { period: string; interval: string }> = {
            '1D': { period: '1d', interval: '1m' },
            '5D': { period: '5d', interval: '5m' },
            '1M': { period: '1mo', interval: '1h' },
            '3M': { period: '3mo', interval: '1d' },
            '6M': { period: '6mo', interval: '1d' },
            'YTD': { period: 'ytd', interval: '1d' },
            '1Y': { period: '1y', interval: '1d' },
            '5Y': { period: '5y', interval: '1wk' },
            'All': { period: 'max', interval: '1mo' }
        };
        const base = defaults[p] || { period: '1mo', interval: '1d' };
        if (!selectedInterval) return base;

        // Validate selected interval against period
        const intradaySmall: Interval[] = ['1m'];
        const intradayMed: Interval[] = ['5m', '15m', '30m', '1h'];
        const shortPeriods = ['1d', '5d'];
        const medPeriods = ['1d', '5d', '1mo'];

        if (intradaySmall.includes(selectedInterval)) {
            // 1m interval only valid with short periods
            if (!shortPeriods.includes(base.period)) return { ...base, interval: base.interval };
        } else if (intradayMed.includes(selectedInterval)) {
            // 5m-1h interval max period is 1mo
            const longPeriods = ['3mo', '6mo', 'ytd', '1y', '5y', 'max'];
            if (longPeriods.includes(base.period)) return { ...base, interval: base.interval };
        }

        return { ...base, interval: selectedInterval };
    }, []);

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { period: apiPeriod, interval: apiInterval } = getPeriodParams(period, interval);
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
    }, [symbol, period, interval, assetType, getPeriodParams]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setShowSidebar(false);
            } else {
                setShowSidebar(true);
            }
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            indicatorSeriesRef.current.clear();
            comparisonSeriesRef.current.clear();
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
                vertLines: { color: 'rgba(255, 255, 255, 0.10)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.10)' }
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
                    horzLines: { color: 'rgba(255, 255, 255, 0.10)' }
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

        // Resize observer for dynamic height/width
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === chartContainerRef.current && chartRef.current) {
                    chartRef.current.applyOptions({
                        width: entry.contentRect.width,
                        height: entry.contentRect.height
                    });
                }
                if (entry.target === volumeContainerRef.current && volumeChartRef.current) {
                    volumeChartRef.current.applyOptions({
                        width: entry.contentRect.width
                    });
                }
            }
        });

        if (chartContainerRef.current) resizeObserver.observe(chartContainerRef.current);
        if (volumeContainerRef.current) resizeObserver.observe(volumeContainerRef.current);

        return () => {
            resizeObserver.disconnect();
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
                case 'rsi':
                    indicatorData = calculateRSI(ohlcData, indicator.params.period || 14);
                    break;
                case 'macd': {
                    const macd = calculateMACD(ohlcData, indicator.params.fastPeriod || 12, indicator.params.slowPeriod || 26, indicator.params.signalPeriod || 9);
                    indicatorData = macd.map(m => ({ time: m.time, value: m.macd })); // Simplification
                    break;
                }
                default:
                    // For other indicators, skip for now (can add later)
                    return;
            }

            if (indicatorData.length > 0) {
                // Dedupe and sort data to prevent duplicate timestamp errors
                const cleanData = dedupeAndSortChartData(indicatorData);
                if (cleanData.length === 0) return;

                let series = indicatorSeriesRef.current.get(indicator.id);
                if (!series) {
                    const isOverlay = ['sma', 'ema', 'bollinger', 'vwap'].includes(indicator.type);
                    const priceScaleId = isOverlay ? undefined : indicator.id;

                    if (!isOverlay) {
                        chart.priceScale('right').applyOptions({
                            scaleMargins: { top: 0.1, bottom: 0.3 }
                        });

                        try {
                            chart.priceScale(indicator.id).applyOptions({
                                scaleMargins: { top: 0.75, bottom: 0 },
                                visible: true,
                                borderColor: '#334155'
                            });
                        } catch (e) {
                            // Ignored, created on series add
                        }
                    }

                    series = chart.addSeries(LineSeries, {
                        color: indicator.color,
                        lineWidth: 2,
                        priceLineVisible: false,
                        lastValueVisible: false,
                        priceScaleId,
                        title: `${indicator.name}`
                    });
                    indicatorSeriesRef.current.set(indicator.id, series);
                }
                series.setData(cleanData as any);
            }
        });
    }, [activeIndicators, data, chartType, stats, period]);

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

            // Helper to get time key for comparison data
            const isIntraday = period === '1D' || period === '5D';
            const getCompTimeKey = (date: string): string | number => {
                if (isIntraday) {
                    return Math.floor(new Date(date).getTime() / 1000);
                }
                return date.split('T')[0];
            };

            // Deduplicate by time
            const dataMap = new Map<string | number, number>();
            comparison.data.forEach(d => dataMap.set(getCompTimeKey(d.time), d.value));
            const uniqueData = Array.from(dataMap.entries())
                .sort(([a], [b]) => a.toString().localeCompare(b.toString()))
                .map(([time, value]) => ({ time, value }));

            series.setData(uniqueData as any);
            comparisonSeriesRef.current.set(comparison.symbol, series);
        });

        // Configure comparison price scale if we have comparison series
        if (comparisonSeriesRef.current.size > 0) {
            try {
                chart.priceScale('comparison').applyOptions({
                    scaleMargins: { top: 0.1, bottom: 0.1 },
                    visible: true,
                    borderColor: '#334155'
                });
            } catch (e) {
                // Ignore if priceScale isn't ready
            }
        }
    }, [comparisonSymbols, data, chartType, stats, period]);

    // Handle Pattern Detection
    useEffect(() => {
        if (!chartRef.current || !seriesRef.current || data.length === 0) return;

        if (!patternMarkersRef.current || patternMarkersRef.current.getSeries() !== seriesRef.current) {
            patternMarkersRef.current = createSeriesMarkers(seriesRef.current);
        }

        if (!showPatterns) {
            patternMarkersRef.current.setMarkers([]);
            return;
        }

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

        const markers = detectPatterns(ohlcData as any);
        const cleanMarkers = dedupeAndSortChartData(markers);
        patternMarkersRef.current.setMarkers(cleanMarkers);
    }, [showPatterns, data, chartType, period]);

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
        <FeatureLock featureKey="advanced_charts" title="Advanced Charts">
            <div className="h-screen overflow-hidden bg-[#0a0e17] text-white flex flex-col">
                {/* ═══════ TOP HEADER BAR ═══════ */}
                <header className="sticky top-0 z-50 border-b border-slate-800/60 shrink-0">
                    <div className="min-h-14 flex flex-wrap items-center justify-between px-3 sm:px-5 py-2 bg-gradient-to-r from-[#0d1220] via-[#0f1628] to-[#0d1220] backdrop-blur-xl gap-y-2">
                        {/* Left: Navigation + Symbol Info */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200 text-slate-400 hover:text-white shrink-0"
                                title="Go Back"
                            >
                                <ArrowLeft size={18} />
                            </button>

                            <div className="h-6 w-px bg-slate-700/50 shrink-0 hidden sm:block" />

                            {/* Symbol Badge */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/20 rounded-lg shrink-0">
                                    <BarChart2 size={14} className="text-blue-400" />
                                    <span className="text-sm font-bold tracking-wide text-blue-100">{symbol}</span>
                                </div>
                                {profile && (
                                    <span className="text-sm text-slate-500 truncate hidden md:block max-w-[200px]">{profile.name}</span>
                                )}
                            </div>

                            {/* Price Display */}
                            {stats && (
                                <div className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-3">
                                    <span className="text-xl sm:text-2xl font-semibold tracking-tight text-white tabular-nums">
                                        {formatPrice(crosshairData?.price ?? stats.price)}
                                    </span>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs sm:text-sm font-medium tabular-nums ${(crosshairData?.change ?? stats.change) >= 0
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                        {(crosshairData?.change ?? stats.change) >= 0
                                            ? <ArrowUpRight size={14} />
                                            : <ArrowDownRight size={14} />
                                        }
                                        <span className="hidden sm:inline">
                                            {(crosshairData?.change ?? stats.change) >= 0 ? '+' : ''}
                                            {((crosshairData?.change ?? stats.change)).toFixed(2)}
                                        </span>
                                        <span>({stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%)</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-2">
                            <button
                                onClick={() => setIsInWatchlist(!isInWatchlist)}
                                className={`p-2 rounded-lg transition-all duration-200 ${isInWatchlist
                                    ? 'text-amber-400 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            >
                                {isInWatchlist ? <Star size={18} fill="currentColor" /> : <Star size={18} />}
                            </button>

                            <Link
                                href={getAssetDetailPath(symbol, assetType)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                                title="View Stock Details"
                            >
                                <ExternalLink size={18} />
                            </Link>

                            <button
                                onClick={toggleFullscreen}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            >
                                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>

                            <div className="h-6 w-px bg-slate-700/40 mx-1 hidden sm:block" />

                            <button
                                onClick={() => setShowSidebar(!showSidebar)}
                                className={`p-2 rounded-lg transition-all duration-200 ${showSidebar
                                    ? 'text-blue-400 bg-blue-400/10'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                title={showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
                            >
                                <Menu size={18} />
                            </button>
                        </div>
                    </div>

                    {/* ═══════ CHART CONTROLS TOOLBAR ═══════ */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 bg-[#0d1220]/90 backdrop-blur-sm border-t border-slate-800/30 shrink-0 relative z-[60]">
                        {/* Period Selector — pill group */}
                        <div className="flex items-center bg-slate-800/40 rounded-lg p-0.5 shrink-0">
                            {PERIODS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setPeriod(p.id)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${period === p.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-5 w-px bg-slate-700/30 shrink-0" />

                        {/* Interval Dropdown */}
                        <IntervalSelector interval={interval} onIntervalChange={setInterval} period={getPeriodParams(period, interval).period} />

                        {/* Chart Type Dropdown */}
                        <ChartTypeSelector chartType={chartType} onChartTypeChange={setChartType} />

                        <div className="h-5 w-px bg-slate-700/30 shrink-0" />

                        {/* Feature Buttons Group */}
                        <button
                            onClick={() => setShowPatterns(!showPatterns)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 shrink-0 ${showPatterns
                                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Eye size={13} />
                            <span className="hidden sm:inline">Patterns</span>
                        </button>

                        <button
                            onClick={() => setShowRiskPanel(!showRiskPanel)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 shrink-0 ${showRiskPanel
                                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25 shadow-[0_0_10px_rgba(249,115,22,0.1)]'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Shield size={13} />
                            <span className="hidden sm:inline">Risk</span>
                        </button>

                        {/* Indicators */}
                        <IndicatorPanel
                            activeIndicators={activeIndicators}
                            onAddIndicator={handleAddIndicator}
                            onRemoveIndicator={handleRemoveIndicator}
                            onUpdateIndicator={handleUpdateIndicator}
                        />

                        {/* Comparison */}
                        <ComparisonMode
                            primarySymbol={symbol}
                            primaryData={data}
                            onComparisonDataChange={setComparisonSymbols}
                            period={getPeriodParams(period, interval).period}
                            interval={getPeriodParams(period, interval).interval}
                        />

                        <button
                            onClick={() => setShowMultiTimeframe(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 shrink-0"
                        >
                            <Layers size={13} />
                            <span className="hidden sm:inline">Multi-TF</span>
                        </button>

                        {/* Layout Selector */}
                        <div className="hidden md:flex items-center gap-2 border-l border-slate-700/30 pl-3 ml-1 shrink-0">
                            <ChartLayoutSelector
                                layout={layout}
                                onLayoutChange={setLayout}
                            />
                        </div>
                    </div>
                </header>

                {/* ═══════ MAIN CONTENT ═══════ */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Drawing Tools */}
                    <div className="hidden md:flex w-11 border-r border-slate-800/50 bg-[#0b1020] flex-col items-center py-2 gap-0.5">
                        <ChartToolbar
                            activeTool={activeTool}
                            onToolSelect={startDrawingTool}
                            onClearDrawings={clearAll}
                            variant="vertical-compact"
                        />
                    </div>

                    {/* Center: Chart Area */}
                    <div className="flex-1 flex flex-col relative min-h-0 min-w-0 bg-[#0a0e17]">
                        {layout === '1x1' ? (
                            <>
                                {/* Loading Overlay */}
                                {loading && (
                                    <div className="absolute inset-0 bg-[#0a0e17]/90 flex items-center justify-center z-10 transition-opacity duration-300">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs text-slate-500">Loading chart data...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Main chart */}
                                <div ref={chartContainerRef} className="flex-1 w-full" />

                                {/* Volume chart */}
                                <div ref={volumeContainerRef} className="h-20 border-t border-slate-800/40 w-full" />

                                {/* SVG Drawing Layer */}
                                <svg
                                    ref={svgRef}
                                    className="absolute inset-0 pointer-events-none"
                                    style={{ top: 0, left: 0, width: '100%', height: 'calc(100% - 80px)' }}
                                >
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
                        <ChartSidebar symbol={symbol} onClose={() => setShowSidebar(false)} />
                    )}
                </div>

                {/* ═══════ BOTTOM STATUS BAR ═══════ */}
                <footer className="h-7 border-t border-slate-800/50 flex items-center justify-between px-4 text-[11px] bg-[#0b1020]/80 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-3 sm:gap-5 text-slate-500 tabular-nums">
                        <span>
                            <span className="text-blue-400/70 font-medium">O</span>{' '}
                            {data.length > 0 && crosshairData?.time ? formatPrice(data.find(d => d.date.split('T')[0] === crosshairData.time || Math.floor(new Date(d.date).getTime() / 1000) === (crosshairData.time as any))?.open ?? 0) : '—'}
                        </span>
                        <span>
                            <span className="text-emerald-400/70 font-medium">H</span>{' '}
                            {data.length > 0 && crosshairData?.time ? formatPrice(data.find(d => d.date.split('T')[0] === crosshairData.time || Math.floor(new Date(d.date).getTime() / 1000) === (crosshairData.time as any))?.high ?? 0) : '—'}
                        </span>
                        <span>
                            <span className="text-red-400/70 font-medium">L</span>{' '}
                            {data.length > 0 && crosshairData?.time ? formatPrice(data.find(d => d.date.split('T')[0] === crosshairData.time || Math.floor(new Date(d.date).getTime() / 1000) === (crosshairData.time as any))?.low ?? 0) : '—'}
                        </span>
                        <span>
                            <span className="text-amber-400/70 font-medium">C</span>{' '}
                            {crosshairData ? formatPrice(crosshairData.price) : '—'}
                        </span>
                        <span className="hidden sm:inline">
                            <span className="text-purple-400/70 font-medium">Vol</span>{' '}
                            {crosshairData ? formatNumber(crosshairData.volume) : '—'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                        <span className="hidden sm:inline">Data by Yahoo Finance</span>
                        <span>© 2026 Pearto Finance</span>
                    </div>
                </footer>

                {/* Panels & Modals */}
                <RiskAnalysisPanel
                    symbol={symbol}
                    isOpen={showRiskPanel}
                    onClose={() => setShowRiskPanel(false)}
                />

                <MultiTimeframeView
                    symbol={symbol}
                    chartType={chartType}
                    isOpen={showMultiTimeframe}
                    onClose={() => setShowMultiTimeframe(false)}
                />
            </div>
        </FeatureLock>
    );
}

