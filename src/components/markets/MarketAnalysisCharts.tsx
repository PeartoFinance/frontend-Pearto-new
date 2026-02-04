'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSectorAnalysis, type SectorAnalysisData, type SectorAnalysisResponse } from '@/services/marketService';
import { PieChart, BarChart2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

// Fixed color palette for sectors - consistent with ShareHub Nepal
export const SECTOR_COLORS: Record<string, string> = {
    'BANKING': '#4ade80',
    'Commercial Banks': '#4ade80',
    'DEVBANK': '#f472b6',
    'Development Banks': '#f472b6',
    'FINANCE': '#c084fc',
    'Finance': '#c084fc',
    'HOTELS': '#a78bfa',
    'Hotels And Tourism': '#a78bfa',
    'HYDROPOWER': '#f87171',
    'Hydro Power': '#f87171',
    'INVESTMENT': '#fbbf24',
    'Investment': '#fbbf24',
    'LIFEINSURANCE': '#67e8f9',
    'Life Insurance': '#67e8f9',
    'MANUFACTURE': '#fb923c',
    'Manufacturing And Processing': '#fb923c',
    'MICROFINANCE': '#6ee7b7',
    'Microfinance': '#6ee7b7',
    'MUTUAL': '#818cf8',
    'Mutual Fund': '#818cf8',
    'NONLIFEINSURANCE': '#fca5a5',
    'Non Life Insurance': '#fca5a5',
    'OTHERS': '#94a3b8',
    'Others': '#94a3b8',
    'TRADING': '#38bdf8',
    'Trading': '#38bdf8',
};

export function getSectorColor(sector: string): string {
    const upperSector = sector.toUpperCase();
    for (const [key, color] of Object.entries(SECTOR_COLORS)) {
        if (key.toUpperCase() === upperSector || key.toUpperCase().includes(upperSector) || upperSector.includes(key.toUpperCase())) {
            return color;
        }
    }
    // Generate consistent color for unknown sectors
    let hash = 0;
    for (let i = 0; i < sector.length; i++) {
        hash = sector.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}

export function getSectorShortName(sector: string): string {
    const shortNames: Record<string, string> = {
        'Commercial Banks': 'BANKING',
        'Development Banks': 'DEVBANK',
        'Hydro Power': 'HYDROPOWER',
        'Manufacturing And Processing': 'MANUFACTURE',
        'Life Insurance': 'LIFEINSURANCE',
        'Non Life Insurance': 'NONLIFEINSURANCE',
        'Hotels And Tourism': 'HOTELS',
        'Mutual Fund': 'MUTUAL',
    };
    return shortNames[sector] || sector.toUpperCase().slice(0, 10);
}

// Donut Chart Component
export function DonutChart({
    data,
    title,
    valueKey,
    percentKey
}: {
    data: SectorAnalysisData[];
    title: string;
    valueKey: 'turnover' | 'volume' | 'transactions';
    percentKey: 'turnoverPercent' | 'volumePercent' | 'transactionsPercent';
}) {
    const totalValue = data.reduce((sum, d) => sum + d[valueKey], 0);

    // Calculate SVG path for each sector
    let cumulativePercent = 0;
    const sectors = data.map((sector) => {
        const percent = sector[percentKey];
        const startAngle = cumulativePercent * 3.6 * (Math.PI / 180); // Convert to radians
        cumulativePercent += percent;
        const endAngle = cumulativePercent * 3.6 * (Math.PI / 180);

        return {
            ...sector,
            startAngle,
            endAngle,
            color: getSectorColor(sector.sector)
        };
    });

    // Calculate donut segments - LARGER SIZE
    const radius = 120;
    const innerRadius = 75;
    const centerX = 160;
    const centerY = 160;

    const getArcPath = (startAngle: number, endAngle: number, outer: number, inner: number) => {
        const startOuter = {
            x: centerX + outer * Math.cos(startAngle - Math.PI / 2),
            y: centerY + outer * Math.sin(startAngle - Math.PI / 2),
        };
        const endOuter = {
            x: centerX + outer * Math.cos(endAngle - Math.PI / 2),
            y: centerY + outer * Math.sin(endAngle - Math.PI / 2),
        };
        const startInner = {
            x: centerX + inner * Math.cos(endAngle - Math.PI / 2),
            y: centerY + inner * Math.sin(endAngle - Math.PI / 2),
        };
        const endInner = {
            x: centerX + inner * Math.cos(startAngle - Math.PI / 2),
            y: centerY + inner * Math.sin(startAngle - Math.PI / 2),
        };

        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

        return `
            M ${startOuter.x} ${startOuter.y}
            A ${outer} ${outer} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}
            L ${startInner.x} ${startInner.y}
            A ${inner} ${inner} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}
            Z
        `;
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <h3 className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>

            <div className="relative">
                <svg width="320" height="320" viewBox="0 0 320 320" className="mx-auto">
                    {sectors.map((sector, idx) => {
                        if (sector[percentKey] < 0.5) return null; // Skip tiny segments

                        // Validate angles to prevent NaN
                        if (!Number.isFinite(sector.startAngle) || !Number.isFinite(sector.endAngle)) {
                            return null;
                        }

                        return (
                            <g key={sector.sector}>
                                <path
                                    d={getArcPath(sector.startAngle, sector.endAngle, radius, innerRadius)}
                                    fill={sector.color}
                                    className="stroke-white dark:stroke-slate-800 hover:opacity-80 transition cursor-pointer"
                                    strokeWidth="2"
                                />
                                {/* Labels for larger segments */}
                                {sector[percentKey] > 5 && (() => {
                                    const midAngle = (sector.startAngle + sector.endAngle) / 2 - Math.PI / 2;
                                    const labelRadius = radius + 35;
                                    const x = centerX + labelRadius * Math.cos(midAngle);
                                    const y = centerY + labelRadius * Math.sin(midAngle);

                                    // Validate coordinates
                                    if (!Number.isFinite(x) || !Number.isFinite(y)) {
                                        return null;
                                    }

                                    return (
                                        <g>
                                            <text
                                                x={x}
                                                y={y - 8}
                                                textAnchor="middle"
                                                className="text-[10px] fill-slate-500 dark:fill-slate-300 font-medium"
                                            >
                                                {getSectorShortName(sector.sector)}
                                            </text>
                                            <text
                                                x={x}
                                                y={y + 8}
                                                textAnchor="middle"
                                                className={`text-[10px] font-bold ${sector.avgChangePercent >= 0 ? 'fill-emerald-400' : 'fill-red-400'}`}
                                            >
                                                {sector.avgChangePercent >= 0 ? '▲' : '▼'} {Math.abs(sector.avgChangePercent || 0).toFixed(2)}%
                                            </text>
                                        </g>
                                    );
                                })()}
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

// Bar Chart Component for Change %
function ChangeBarChart({
    data,
    title,
    valueKey
}: {
    data: SectorAnalysisData[];
    title: string;
    valueKey: 'turnoverPercent' | 'volumePercent' | 'transactionsPercent';
}) {
    // Use avgChangePercent for all charts as a proxy for change
    const sortedData = [...data]
        .filter(d => d[valueKey] > 1) // Filter out tiny sectors
        .sort((a, b) => b.avgChangePercent - a.avgChangePercent);

    const maxAbsChange = Math.max(...sortedData.map(d => Math.abs(d.avgChangePercent)), 30);

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <h3 className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {sortedData.map((sector) => {
                    const isPositive = sector.avgChangePercent >= 0;
                    const width = (Math.abs(sector.avgChangePercent) / maxAbsChange) * 100;

                    return (
                        <div key={sector.sector} className="flex items-center gap-2 text-xs">
                            <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getSectorColor(sector.sector) }}
                            />
                            <span className="w-20 truncate text-slate-400" title={sector.sector}>
                                {getSectorShortName(sector.sector)}
                            </span>
                            <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden relative">
                                {/* Center line */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-500" />
                                {/* Bar */}
                                <div
                                    className={`absolute top-0 h-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                                    style={{
                                        width: `${width / 2}%`,
                                        left: isPositive ? '50%' : 'auto',
                                        right: !isPositive ? '50%' : 'auto',
                                    }}
                                />
                            </div>
                            <span className={`w-14 text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isPositive ? '+' : ''}{sector.avgChangePercent.toFixed(2)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Color Legend Component
function ColorLegend({ data }: { data: SectorAnalysisData[] }) {
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            {data.filter(d => d.turnoverPercent > 1).map((sector) => (
                <div key={sector.sector} className="flex items-center gap-1">
                    <span
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: getSectorColor(sector.sector) }}
                    />
                    <span>{getSectorShortName(sector.sector)}</span>
                </div>
            ))}
        </div>
    );
}

export default function MarketAnalysisCharts() {
    const [sectorData, setSectorData] = useState<SectorAnalysisResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await getSectorAnalysis();
                setSectorData(data);
            } catch (err) {
                console.error('Failed to load sector analysis:', err);
                setError('Failed to load sector data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <span className="ml-3 text-slate-600 dark:text-slate-400">Loading market analysis...</span>
            </div>
        );
    }

    if (error || !sectorData) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-500 dark:text-slate-400">
                {error || 'No data available'}
            </div>
        );
    }

    const { sectors, totals } = sectorData;

    return (
        <div className="space-y-6">
            {/* Section Title */}
            <div className="flex items-center gap-3">
                <PieChart size={24} className="text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Market % Analysis</h2>
            </div>

            {/* Pie Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DonutChart
                    data={sectors}
                    title="Market % by Turnover"
                    valueKey="turnover"
                    percentKey="turnoverPercent"
                />
                <DonutChart
                    data={sectors}
                    title="Market % by Volume"
                    valueKey="volume"
                    percentKey="volumePercent"
                />
                <DonutChart
                    data={sectors}
                    title="Market % by Transactions"
                    valueKey="transactions"
                    percentKey="transactionsPercent"
                />
            </div>

            {/* Color Legend */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <ColorLegend data={sectors} />
            </div>

            {/* Bar Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ChangeBarChart
                    data={sectors}
                    title="Turnover Change %"
                    valueKey="turnoverPercent"
                />
                <ChangeBarChart
                    data={sectors}
                    title="Volume Change %"
                    valueKey="volumePercent"
                />
                <ChangeBarChart
                    data={sectors}
                    title="Transactions Change %"
                    valueKey="transactionsPercent"
                />
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Total Turnover</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {totals.turnover >= 1e9
                            ? `${(totals.turnover / 1e9).toFixed(2)} Arab`
                            : totals.turnover >= 1e7
                                ? `${(totals.turnover / 1e7).toFixed(2)} Cr`
                                : totals.turnover.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Total Volume</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {totals.volume >= 1e6
                            ? `${(totals.volume / 1e6).toFixed(2)}M`
                            : totals.volume.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Total Transactions</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{totals.transactions.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Sectors</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{totals.sectorCount}</p>
                </div>
            </div>
        </div>
    );
}
