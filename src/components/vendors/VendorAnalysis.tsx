'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, AreaSeries } from 'lightweight-charts';
import { getVendorHistory } from '@/services/vendorService';

interface VendorAnalysisProps {
    vendorId: string;
}

export default function VendorAnalysis({ vendorId }: VendorAnalysisProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ date: string; value: number; metric: string }[]>([]);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                // Determine metric based on vendor type? For now fetch default
                const history = await getVendorHistory(vendorId);
                setData(history);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [vendorId]);

    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            grid: {
                vertLines: { color: 'rgba(148, 163, 184, 0.1)' },
                horzLines: { color: 'rgba(148, 163, 184, 0.1)' },
            },
        });

        const areaSeries = chart.addSeries(AreaSeries, {
            lineColor: '#10b981',
            topColor: 'rgba(16, 185, 129, 0.4)',
            bottomColor: 'rgba(16, 185, 129, 0.0)',
        });

        // Format data: lightweight-charts expects { time: string, value: number }
        const chartData = data.map(d => ({
            time: d.date.split('T')[0], // 'YYYY-MM-DD'
            value: d.value
        }));

        // Sort by time just in case
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
        };
    }, [data]);

    if (loading) return <div className="h-64 flex items-center justify-center text-slate-400">Loading analysis...</div>;
    if (data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl">No historical data available for analysis.</div>;

    const metricName = data[0]?.metric.replace(/_/g, ' ').toUpperCase() || 'VALUE';

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Historical Analysis: {metricName}</h3>
            <div ref={chartContainerRef} className="w-full" />
        </div>
    );
}
