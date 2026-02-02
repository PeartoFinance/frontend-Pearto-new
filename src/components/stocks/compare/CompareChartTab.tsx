'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineSeries, type IChartApi } from 'lightweight-charts';
import { Maximize2 } from 'lucide-react';
import Link from 'next/link';
import type { MarketStock, PriceHistoryPoint } from '@/services/marketService';

interface CompareStock extends MarketStock {
    color: string;
    data: PriceHistoryPoint[];
}

interface CompareChartTabProps {
    stocks: CompareStock[];
    period: string;
    onPeriodChange: (period: string) => void;
}

export default function CompareChartTab({ stocks, period, onPeriodChange }: CompareChartTabProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!chartContainerRef.current || stocks.length === 0) return;

        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const container = chartContainerRef.current;
        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDark ? '#94a3b8' : '#64748b',
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
                horzLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
            },
            width: container.clientWidth,
            height: 450,
            rightPriceScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
            timeScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
                timeVisible: true,
            },
        });

        chartRef.current = chart;

        stocks.forEach((stock) => {
            if (stock.data.length === 0) return;

            const dataMap = new Map<string, PriceHistoryPoint>();
            stock.data.forEach(d => dataMap.set(d.date, d));
            const sortedData = Array.from(dataMap.values())
                .sort((a, b) => a.date.localeCompare(b.date));

            const firstPrice = sortedData[0]?.close || 1;

            // Use Unix timestamp for intraday periods (1d, 5d), date string for daily+
            const isIntraday = ['1d', '5d'].includes(period);
            const getTimeKey = (date: string): string | number => {
                if (isIntraday && date.includes('T')) {
                    return Math.floor(new Date(date).getTime() / 1000);
                }
                return date.split('T')[0];
            };

            const series = chart.addSeries(LineSeries, {
                color: stock.color,
                lineWidth: 2,
                title: stock.symbol,
            });

            const normalizedData = sortedData
                .filter(d => d.close != null)
                .map(d => ({
                    time: getTimeKey(d.date),
                    value: ((d.close! - firstPrice) / firstPrice) * 100,
                }));

            series.setData(normalizedData as any);
        });

        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
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
    }, [stocks, isDark]);

    const periods = [
        { id: '1d', label: '1D' },
        { id: '5d', label: '5D' },
        { id: '1mo', label: '1M' },
        { id: '3mo', label: '3M' },
        { id: '1y', label: '1Y' },
        { id: '5y', label: '5Y' },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Price Performance (% Change)
                </h3>
                <div className="flex gap-1">
                    {periods.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onPeriodChange(p.id)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${period === p.id
                                ? 'bg-teal-600 text-white'
                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div ref={chartContainerRef} className="w-full h-[450px]" />

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {stocks.map((stock) => (
                    <div key={stock.symbol} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stock.color }} />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{stock.symbol}</span>
                        <span className={`text-xs ${stock.changePercent >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                        </span>
                        <Link
                            href={`/chart/${stock.symbol}`}
                            target="_blank"
                            className="text-slate-400 hover:text-blue-500 transition ml-1"
                            title={`Advanced Chart for ${stock.symbol}`}
                        >
                            <Maximize2 size={12} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
