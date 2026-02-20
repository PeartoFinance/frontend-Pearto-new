'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import api from '@/services/api';

interface SectorData {
    name: string;
    avgChangePercent: number;
    totalMarketCap: number;
    stockCount: number;
    topGainer: { symbol: string; changePercent: number } | null;
    topLoser: { symbol: string; changePercent: number } | null;
}

// Map sector names to emojis for visual flair
const SECTOR_EMOJI: Record<string, string> = {
    'Technology': '💻',
    'Healthcare': '🏥',
    'Financial Services': '🏦',
    'Consumer Cyclical': '🛍️',
    'Communication Services': '📡',
    'Industrials': '🏭',
    'Consumer Defensive': '🛒',
    'Energy': '⛽',
    'Basic Materials': '⛏️',
    'Real Estate': '🏠',
    'Utilities': '💡',
};

function getHeatColor(change: number): string {
    if (change >= 3) return 'bg-emerald-600 text-white';
    if (change >= 1.5) return 'bg-emerald-500 text-white';
    if (change >= 0.5) return 'bg-emerald-400 text-white';
    if (change >= 0.1) return 'bg-emerald-300 text-emerald-900';
    if (change >= -0.1) return 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
    if (change >= -0.5) return 'bg-red-300 text-red-900';
    if (change >= -1.5) return 'bg-red-400 text-white';
    if (change >= -3) return 'bg-red-500 text-white';
    return 'bg-red-600 text-white';
}

function formatMarketCap(num: number): string {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(0)}M`;
    return num.toLocaleString();
}

export default function SectorHeatmap() {
    const [sectors, setSectors] = useState<SectorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredSector, setHoveredSector] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/live/sector-performance');
                const data = Array.isArray(res) ? res : (res as any)?.data || [];
                setSectors(data);
            } catch (err) {
                console.error('Failed to load sector performance:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={18} className="text-teal-500" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sector Performance</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (sectors.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={18} className="text-teal-500" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sector Performance</h3>
                </div>
                <p className="text-slate-400 text-sm text-center py-6">No sector data available</p>
            </div>
        );
    }

    // Compute max market cap for sizing
    const maxMarketCap = Math.max(...sectors.map(s => s.totalMarketCap || 1));

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-teal-500" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sector Performance Heatmap</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-3 h-3 bg-red-500 rounded-sm" /> Declining
                    <span className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-sm" /> Flat
                    <span className="w-3 h-3 bg-emerald-500 rounded-sm" /> Rising
                </div>
            </div>

            {/* Treemap-style grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {sectors.map((sector) => {
                    const isHovered = hoveredSector === sector.name;
                    // Compute relative size (min 1 to prevent collapse)
                    const relSize = Math.max(0.5, (sector.totalMarketCap / maxMarketCap));
                    // Use size to determine if we show as a "large" or "small" cell
                    const isLarge = relSize > 0.3;

                    return (
                        <div
                            key={sector.name}
                            className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200 ${getHeatColor(sector.avgChangePercent)} ${isHovered ? 'ring-2 ring-white/60 shadow-lg scale-[1.02] z-10' : 'hover:shadow-md'} ${isLarge ? 'lg:col-span-1' : ''}`}
                            onMouseEnter={() => setHoveredSector(sector.name)}
                            onMouseLeave={() => setHoveredSector(null)}
                        >
                            {/* Sector name and emoji */}
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-base">{SECTOR_EMOJI[sector.name] || '📊'}</span>
                                <span className="font-bold text-sm truncate">{sector.name}</span>
                            </div>

                            {/* Change % */}
                            <div className="flex items-center gap-1 mb-2">
                                {sector.avgChangePercent >= 0 ? (
                                    <TrendingUp size={14} className="flex-shrink-0" />
                                ) : (
                                    <TrendingDown size={14} className="flex-shrink-0" />
                                )}
                                <span className="text-xl font-bold">
                                    {sector.avgChangePercent >= 0 ? '+' : ''}{sector.avgChangePercent.toFixed(2)}%
                                </span>
                            </div>

                            {/* Details on hover */}
                            <div className={`text-xs opacity-70 space-y-0.5 transition-opacity ${isHovered ? 'opacity-100' : ''}`}>
                                <div>{sector.stockCount} stocks • {formatMarketCap(sector.totalMarketCap)} cap</div>
                                {sector.topGainer && (
                                    <div className="flex items-center gap-1">
                                        <TrendingUp size={10} className="flex-shrink-0" />
                                        <span className="font-medium">{sector.topGainer.symbol}</span>
                                        <span>+{sector.topGainer.changePercent.toFixed(1)}%</span>
                                    </div>
                                )}
                                {sector.topLoser && (
                                    <div className="flex items-center gap-1">
                                        <TrendingDown size={10} className="flex-shrink-0" />
                                        <span className="font-medium">{sector.topLoser.symbol}</span>
                                        <span>{sector.topLoser.changePercent.toFixed(1)}%</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
