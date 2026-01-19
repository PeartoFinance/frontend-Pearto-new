'use client';

import { useState, useEffect } from 'react';
import {
    Loader2, TrendingUp, TrendingDown, PieChart, BarChart3, Wallet, Target
} from 'lucide-react';
import {
    getPortfolios,
    getPortfolioAnalytics,
    getWealthHistory,
    type PortfolioAnalytics,
    type WealthHistoryPoint,
    type Portfolio
} from '@/services/portfolioService';

// Simple chart colors
const COLORS = [
    '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

export default function ProfileInsights() {
    const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
    const [wealthHistory, setWealthHistory] = useState<WealthHistoryPoint[]>([]);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPortfolios();
    }, []);

    useEffect(() => {
        if (selectedPortfolioId) {
            loadAnalytics(selectedPortfolioId);
        }
    }, [selectedPortfolioId]);

    const loadPortfolios = async () => {
        try {
            const [portfolioList, history] = await Promise.all([
                getPortfolios().catch(() => []),
                getWealthHistory(30).catch(() => [])
            ]);
            setPortfolios(portfolioList);
            setWealthHistory(history);

            if (portfolioList.length > 0) {
                setSelectedPortfolioId(portfolioList[0].id.toString());
            } else {
                setLoading(false);
            }
        } catch (e) {
            console.error('Failed to load portfolios:', e);
            setError('Failed to load portfolio data');
            setLoading(false);
        }
    };

    const loadAnalytics = async (portfolioId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPortfolioAnalytics(portfolioId);
            setAnalytics(data);
        } catch (e) {
            console.error('Failed to load analytics:', e);
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const formatPercent = (num: number) => {
        return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    };

    // Empty state
    if (!loading && portfolios.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                <PieChart className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Portfolio Found</h3>
                <p className="text-slate-500 text-sm">Create a portfolio to see your analytics and insights.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Portfolio Selector */}
            {portfolios.length > 1 && (
                <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-400">Portfolio:</label>
                    <select
                        value={selectedPortfolioId}
                        onChange={(e) => setSelectedPortfolioId(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    >
                        {portfolios.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Total Value"
                    value={formatCurrency(analytics?.totalValue || 0)}
                    icon={<Wallet className="text-emerald-500" size={20} />}
                />
                <SummaryCard
                    title="Total Gain/Loss"
                    value={formatCurrency(analytics?.totalGain || 0)}
                    subValue={formatPercent(analytics?.totalGainPercent || 0)}
                    isPositive={(analytics?.totalGain || 0) >= 0}
                    icon={(analytics?.totalGain || 0) >= 0 ? <TrendingUp className="text-emerald-500" size={20} /> : <TrendingDown className="text-red-500" size={20} />}
                />
                <SummaryCard
                    title="Holdings"
                    value={String(analytics?.holdingsCount || 0)}
                    icon={<BarChart3 className="text-blue-500" size={20} />}
                />
                <SummaryCard
                    title="Sectors"
                    value={String(analytics?.sectorBreakdown?.length || 0)}
                    icon={<PieChart className="text-purple-500" size={20} />}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Allocation Pie Chart */}
                <ChartCard title="Portfolio Allocation" icon={<PieChart size={18} />}>
                    {analytics?.allocation && analytics.allocation.length > 0 ? (
                        <div className="flex items-center gap-6">
                            {/* Simple CSS Pie Chart */}
                            <div className="relative w-32 h-32 flex-shrink-0">
                                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                    {renderPieSlices(analytics.allocation.slice(0, 6))}
                                </svg>
                            </div>
                            {/* Legend */}
                            <div className="flex-1 space-y-2">
                                {analytics.allocation.slice(0, 6).map((item, i) => (
                                    <div key={item.symbol} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-sm text-white font-medium">{item.symbol}</span>
                                        </div>
                                        <span className="text-sm text-slate-400">{item.weight.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <EmptyChart message="No holdings to display" />
                    )}
                </ChartCard>

                {/* Sector Breakdown */}
                <ChartCard title="Sector Breakdown" icon={<Target size={18} />}>
                    {analytics?.sectorBreakdown && analytics.sectorBreakdown.length > 0 ? (
                        <div className="space-y-3">
                            {analytics.sectorBreakdown.slice(0, 6).map((sector, i) => (
                                <div key={sector.sector}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white">{sector.sector}</span>
                                        <span className="text-slate-400">{sector.weight.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${sector.weight}%`,
                                                backgroundColor: COLORS[i % COLORS.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyChart message="No sector data available" />
                    )}
                </ChartCard>

                {/* Top Performers */}
                <ChartCard title="Top Performers" icon={<TrendingUp size={18} className="text-emerald-500" />}>
                    {analytics?.topPerformers && analytics.topPerformers.length > 0 ? (
                        <div className="space-y-3">
                            {analytics.topPerformers.slice(0, 5).map((item) => (
                                <div key={item.symbol} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                                    <div>
                                        <span className="text-white font-medium">{item.symbol}</span>
                                        <span className="text-xs text-slate-500 ml-2">{item.name}</span>
                                    </div>
                                    <span className={`text-sm font-bold ${item.gainPercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {formatPercent(item.gainPercent)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyChart message="No performance data" />
                    )}
                </ChartCard>

                {/* Worst Performers */}
                <ChartCard title="Underperformers" icon={<TrendingDown size={18} className="text-red-500" />}>
                    {analytics?.worstPerformers && analytics.worstPerformers.length > 0 ? (
                        <div className="space-y-3">
                            {analytics.worstPerformers.slice(0, 5).map((item) => (
                                <div key={item.symbol} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                                    <div>
                                        <span className="text-white font-medium">{item.symbol}</span>
                                        <span className="text-xs text-slate-500 ml-2">{item.name}</span>
                                    </div>
                                    <span className={`text-sm font-bold ${item.gainPercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {formatPercent(item.gainPercent)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyChart message="No performance data" />
                    )}
                </ChartCard>
            </div>

            {/* Net Worth History */}
            <ChartCard title="Net Worth History (30 Days)" icon={<BarChart3 size={18} />}>
                {wealthHistory.length > 0 ? (
                    <div className="h-48">
                        <NetWorthChart data={wealthHistory} />
                    </div>
                ) : (
                    <EmptyChart message="No wealth history data available" />
                )}
            </ChartCard>
        </div>
    );
}

// Helper Components
function SummaryCard({ title, value, subValue, isPositive, icon }: {
    title: string;
    value: string;
    subValue?: string;
    isPositive?: boolean;
    icon: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide">{title}</span>
                {icon}
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
            {subValue && (
                <div className={`text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {subValue}
                </div>
            )}
        </div>
    );
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="text-slate-400">{icon}</div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function EmptyChart({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
            {message}
        </div>
    );
}

// SVG Pie Chart Helper
function renderPieSlices(data: { weight: number }[]) {
    let cumulativePercent = 0;

    return data.map((item, i) => {
        const startAngle = cumulativePercent * 3.6;
        cumulativePercent += item.weight;
        const endAngle = cumulativePercent * 3.6;

        const largeArcFlag = item.weight > 50 ? 1 : 0;

        const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
        const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
        const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
        const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

        return (
            <path
                key={i}
                d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                fill={COLORS[i % COLORS.length]}
                stroke="#1e293b"
                strokeWidth="1"
            />
        );
    });
}

// Simple Net Worth Line Chart
function NetWorthChart({ data }: { data: WealthHistoryPoint[] }) {
    if (data.length < 2) return <EmptyChart message="Not enough data points" />;

    const values = data.map(d => d.totalValue);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.totalValue - minValue) / range) * 80 - 10;
        return `${x},${y}`;
    }).join(' ');

    const isPositive = data[data.length - 1]?.totalValue >= data[0]?.totalValue;

    return (
        <div className="relative w-full h-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                {/* Grid lines */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="2" />

                {/* Area fill */}
                <polygon
                    points={`0,100 ${points} 100,100`}
                    fill={isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
                />

                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-500">
                <span>{data[0]?.date?.split('T')[0]}</span>
                <span>{data[data.length - 1]?.date?.split('T')[0]}</span>
            </div>
        </div>
    );
}
