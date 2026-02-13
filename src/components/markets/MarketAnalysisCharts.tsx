'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSectorAnalysis, type SectorAnalysisData, type SectorAnalysisResponse } from '@/services/marketService';
import { PieChart, Loader2, Layers, TrendingUp, Filter } from 'lucide-react';
import SectorHeatmap from './SectorHeatmap';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';

import { formatLargeNumber } from '@/lib/formatters';

// Fixed color palette for sectors
// Fixed color palette for sectors
export const SECTOR_COLORS: Record<string, string> = {
    'BANKING': '#4ade80',
    'Commercial Banks': '#4ade80',
    'COMMUNICATION': '#6366f1', // Indigo to avoid red fallback
    'Communication Services': '#6366f1',
    'DEVBANK': '#f472b6',
    'Development Banks': '#f472b6',
    'FINANCE': '#c084fc',
    'Finance': '#c084fc',
    'HOTELS': '#a78bfa',
    'Hotels And Tourism': '#a78bfa',
    'HYDROPOWER': '#2dd4bf', // Teal (Water) instead of Red
    'Hydro Power': '#2dd4bf',
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
    'NONLIFEINSURANCE': '#d946ef', // Fuchsia instead of Light Red
    'Non Life Insurance': '#d946ef',
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
    // Fallback hash color
    let hash = 0;
    for (let i = 0; i < sector.length; i++) {
        hash = sector.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}

export function getSectorShortName(sector: string): string {
    const shortNames: Record<string, string> = {
        'Commercial Banks': 'Banking',
        'Development Banks': 'Dev Banks',
        'Hydro Power': 'Hydropower',
        'Manufacturing And Processing': 'Manufacturing',
        'Life Insurance': 'Life Ins.',
        'Non Life Insurance': 'Non-Life Ins.',
        'Hotels And Tourism': 'Hotels',
        'Mutual Fund': 'Mutual Funds',
    };
    return shortNames[sector] || sector;
}

// Reusable Donut Chart for LiveMarketsPage and others
export function DonutChart({
    data,
    title,
    valueKey,
    percentKey
}: {
    data: SectorAnalysisData[];
    title: string;
    valueKey: 'turnover' | 'volume' | 'transactions' | 'weight';
    percentKey: 'turnoverPercent' | 'volumePercent' | 'transactionsPercent' | 'weight';
}) {
    const { symbol, formatPrice } = useCurrency();

    // Sort and filter data
    const chartData = useMemo(() => {
        return data
            .map(s => ({
                name: getSectorShortName(s.sector),
                fullName: s.sector,
                value: s[valueKey] as number,
                percent: s[percentKey] as number,
                color: getSectorColor(s.sector)
            }))
            .filter(item => item.percent > 0.5) // Filter out tiny segments
            .sort((a, b) => b.value - a.value);
    }, [data, valueKey, percentKey]);

    const formatValue = (val: number) => {
        if (valueKey === 'volume' || valueKey === 'transactions') return val.toLocaleString();
        return formatLargeNumber(val, (v) => formatPrice(v, 2));
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center mb-4 uppercase tracking-wider">{title}</h3>

            <div className="flex-1 min-h-[160px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded shadow-lg text-xs z-50">
                                            <p className="font-bold text-slate-900 dark:text-white">{d.fullName}</p>
                                            <div className="flex justify-between gap-2 mt-1">
                                                <span className="text-slate-500 dark:text-slate-400">Share:</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{d.percent.toFixed(2)}%</span>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <span className="text-slate-500 dark:text-slate-400">Value:</span>
                                                <span className="font-mono text-slate-700 dark:text-slate-300 opacity-90">{formatValue(d.value)}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>

            {/* Simple Legend for top 3 */}
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-[10px] text-slate-500">
                {chartData.slice(0, 3).map(item => (
                    <div key={item.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span>{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Interactive Distribution Card with Tabs
function DistributionCard({ data }: { data: SectorAnalysisData[] }) {
    const { symbol, formatPrice } = useCurrency();
    const [activeTab, setActiveTab] = useState<'weight' | 'volume' | 'transactions'>('weight');

    // Sort and filter data based on active tab
    const chartData = useMemo(() => {
        let key: keyof SectorAnalysisData = 'weight'; // Default
        if (activeTab === 'weight') key = 'turnoverPercent'; // Using turnover % as weight proxy if needed, or weight itself
        if (activeTab === 'volume') key = 'volumePercent';
        if (activeTab === 'transactions') key = 'weight';

        return data
            .map(s => ({
                name: getSectorShortName(s.sector),
                fullName: s.sector,
                value: s[key] as number,
                rawValue: activeTab === 'weight' ? s.turnover : (activeTab === 'volume' ? s.volume : s.transactions),
                color: getSectorColor(s.sector)
            }))
            .filter(item => item.value > 0.5) // Filter out tiny segments
            .sort((a, b) => b.value - a.value);
    }, [data, activeTab]);

    const formatTooltipValue = (val: number, rawVal: number | undefined) => {
        if (rawVal == null) return '-';
        if (activeTab === 'weight') return formatLargeNumber(rawVal, (v) => formatPrice(v, 2)); // Show turnover amount
        return rawVal.toLocaleString(); // Volume/Txns
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Distribution</h3>
                <PieChart size={20} className="text-slate-400" />
            </div>

            {/* Custom Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
                {(['weight', 'volume', 'transactions'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === tab
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 min-h-[220px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded shadow-lg text-xs z-50">
                                            <p className="font-bold text-slate-900 dark:text-white">{d.fullName}</p>
                                            <div className="flex justify-between gap-2 mt-1">
                                                <span className="text-slate-500 dark:text-slate-400">Percent:</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{d.value.toFixed(2)}%</span>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <span className="text-slate-500 dark:text-slate-400">Value:</span>
                                                <span className="font-mono text-slate-700 dark:text-slate-300 opacity-90">{formatTooltipValue(d.value, d.rawValue)}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </RechartsPieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Selected</span>
                    <span className="text-xl font-bold text-slate-800 dark:text-white">100%</span>
                </div>
            </div>

            {/* Legend / List with Progress Bars */}
            <div className="mt-6 space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {chartData.map((item) => (
                    <div key={item.name} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-600 dark:text-slate-300 uppercase">{item.name}</span>
                            <span className="font-bold text-slate-800 dark:text-white">{item.value.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{ width: `${item.value}%`, backgroundColor: item.color }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MarketAnalysisCharts() {
    const { symbol, formatPrice } = useCurrency();
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
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <span className="ml-3 text-slate-600 dark:text-slate-400">Loading market analysis...</span>
            </div>
        );
    }

    if (error || !sectorData) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-500 dark:text-slate-400 min-h-[400px] flex items-center justify-center">
                {error || 'No data available'}
            </div>
        );
    }

    const { sectors, totals } = sectorData;

    return (
        <div className="space-y-6">
            {/* Main Title */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Layers size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sector Performance</h2>
            </div>

            {/* Grid Layout: Heatmap (2/3) + Distribution (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Heatmap Card */}
                <div className="lg:col-span-2 flex flex-col">
                    <SectorHeatmap data={sectors} height={500} />
                </div>

                {/* Distribution Card */}
                <div className="lg:col-span-1">
                    <DistributionCard data={sectors} />
                </div>
            </div>

            {/* Summary Stats Footer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Total Turnover ({symbol})</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatLargeNumber(totals.turnover, (v) => formatPrice(v, 2))}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Total Volume</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatLargeNumber(totals.volume)}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Transactions</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{totals.transactions.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Active Sectors</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{totals.sectorCount}</p>
                </div>
            </div>
        </div>
    );
}
