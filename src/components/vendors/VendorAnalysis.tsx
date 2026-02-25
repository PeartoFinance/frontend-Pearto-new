'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, AreaSeries } from 'lightweight-charts';
import { getVendorHistory } from '@/services/vendorService';
import { BarChart2, TrendingUp } from 'lucide-react';

interface VendorAnalysisProps {
    vendorId: string;
}

export default function VendorAnalysis({ vendorId }: VendorAnalysisProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ date: string; value: number; metric: string }[]>([]);
    const [selectedMetric, setSelectedMetric] = useState<string>('');
    const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await getVendorHistory(vendorId);
                setData(history);
                
                // Extract unique metric types
                const metrics = Array.from(new Set(history.map(h => h.metric)));
                setAvailableMetrics(metrics);
                if (metrics.length > 0 && !selectedMetric) {
                    setSelectedMetric(metrics[0]);
                }
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [vendorId]);

    // Filter data by selected metric
    const filteredData = selectedMetric
        ? data.filter(d => d.metric === selectedMetric)
        : data;

    useEffect(() => {
        if (!chartContainerRef.current || filteredData.length === 0) return;

        // Clean up existing chart
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            grid: {
                vertLines: { color: 'rgba(148, 163, 184, 0.2)' },
                horzLines: { color: 'rgba(148, 163, 184, 0.2)' },
            },
        });

        const areaSeries = chart.addSeries(AreaSeries, {
            lineColor: '#10b981',
            topColor: 'rgba(16, 185, 129, 0.4)',
            bottomColor: 'rgba(16, 185, 129, 0.0)',
        });

        const chartData = filteredData.map(d => ({
            time: d.date.split('T')[0],
            value: d.value
        }));

        chartData.sort((a, b) => (new Date(a.time).getTime() - new Date(b.time).getTime()));

        areaSeries.setData(chartData);
        chart.timeScale().fitContent();

        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
        };
    }, [filteredData]);

    if (loading) return <div className="h-64 flex items-center justify-center text-slate-400">Loading analysis...</div>;
    if (data.length === 0) return (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <BarChart2 className="w-10 h-10 mb-3 opacity-50" />
            <p>No historical data available for analysis.</p>
        </div>
    );

    const metricName = selectedMetric.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'VALUE';

    // Compute summary stats for the selected metric
    const values = filteredData.map(d => d.value);
    const currentValue = values[values.length - 1];
    const previousValue = values.length > 1 ? values[values.length - 2] : null;
    const changePercent = previousValue && previousValue !== 0
        ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
        : null;
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const avgVal = values.reduce((a, b) => a + b, 0) / values.length;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-500" />
                    {metricName}
                </h3>
                {availableMetrics.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {availableMetrics.map(metric => (
                            <button
                                key={metric}
                                onClick={() => setSelectedMetric(metric)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedMetric === metric
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {metric.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Current</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{currentValue?.toFixed(2)}</p>
                    {changePercent !== null && (
                        <p className={`text-xs font-medium ${changePercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                        </p>
                    )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Average</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{avgVal.toFixed(2)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Low</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{minVal.toFixed(2)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">High</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{maxVal.toFixed(2)}</p>
                </div>
            </div>

            <div ref={chartContainerRef} className="w-full" />
            
            <p className="text-xs text-slate-400 text-center">{filteredData.length} data points</p>
        </div>
    );
}
