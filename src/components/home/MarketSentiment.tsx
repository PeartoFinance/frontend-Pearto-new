'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Activity, TrendingUp, TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { get } from '@/services/api';

interface Mover {
    symbol: string;
    name?: string;
    price?: number;
    change?: number;
    changePercent?: number;
}

interface MoversResponse {
    gainers?: Mover[];
    losers?: Mover[];
}

type Sentiment = 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';

function getSentiment(score: number): { label: Sentiment; color: string; bgColor: string; emoji: string } {
    if (score >= 80) return { label: 'Extreme Greed', color: 'text-emerald-500', bgColor: 'bg-emerald-500', emoji: '🚀' };
    if (score >= 60) return { label: 'Greed', color: 'text-emerald-400', bgColor: 'bg-emerald-400', emoji: '📈' };
    if (score >= 40) return { label: 'Neutral', color: 'text-amber-400', bgColor: 'bg-amber-400', emoji: '😐' };
    if (score >= 20) return { label: 'Fear', color: 'text-red-400', bgColor: 'bg-red-400', emoji: '📉' };
    return { label: 'Extreme Fear', color: 'text-red-500', bgColor: 'bg-red-500', emoji: '😱' };
}

export default function MarketSentiment() {
    const [gainers, setGainers] = useState<Mover[]>([]);
    const [losers, setLosers] = useState<Mover[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSentiment = useCallback(async () => {
        try {
            setLoading(true);
            const data = await get<MoversResponse>('/live/movers', { type: 'both', limit: 20 });
            setGainers(data?.gainers || []);
            setLosers(data?.losers || []);
        } catch (err) {
            console.error('MarketSentiment fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSentiment();
    }, [fetchSentiment]);

    const gainersCount = gainers.length;
    const losersCount = losers.length;
    const total = gainersCount + losersCount;

    const avgGainerPct = gainersCount > 0 ? gainers.reduce((s, x) => s + Math.abs(x.changePercent || 0), 0) / gainersCount : 0;
    const avgLoserPct = losersCount > 0 ? losers.reduce((s, x) => s + Math.abs(x.changePercent || 0), 0) / losersCount : 0;

    const topGainer = gainers.length > 0 ? gainers.reduce((best, m) => (m.changePercent || 0) > (best.changePercent || 0) ? m : best) : null;
    const topLoser = losers.length > 0 ? losers.reduce((worst, m) => (m.changePercent || 0) < (worst.changePercent || 0) ? m : worst) : null;

    // Calculate sentiment score 0-100
    const score = useMemo(() => {
        if (total === 0) return 50;
        const ratioScore = (gainersCount / total) * 100;
        const magAdj = (avgGainerPct - avgLoserPct) * 5;
        return Math.max(0, Math.min(100, ratioScore + magAdj));
    }, [gainersCount, total, avgGainerPct, avgLoserPct]);

    const sentiment = getSentiment(score);
    const needleAngle = -180 + (score / 100) * 180;
    const breadthPct = total > 0 ? Math.round((gainersCount / total) * 100) : 50;

    return (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Activity size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Market Sentiment</h3>
                        <p className="text-[10px] text-slate-400">Gainers vs Losers</p>
                    </div>
                </div>
                <button
                    onClick={fetchSentiment}
                    disabled={loading}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    {/* Gauge */}
                    <div className="flex flex-col items-center mb-2">
                        <div className="relative w-40 h-20">
                            <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                                <path d="M 10 95 A 90 90 0 0 1 190 95" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="text-slate-200 dark:text-slate-700" />
                                <path d="M 10 95 A 90 90 0 0 1 32 40" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
                                <path d="M 32 40 A 90 90 0 0 1 75 12" fill="none" stroke="#f97316" strokeWidth="12" strokeLinecap="round" opacity="0.7" />
                                <path d="M 75 12 A 90 90 0 0 1 125 12" fill="none" stroke="#eab308" strokeWidth="12" strokeLinecap="round" opacity="0.7" />
                                <path d="M 125 12 A 90 90 0 0 1 168 40" fill="none" stroke="#34d399" strokeWidth="12" strokeLinecap="round" opacity="0.7" />
                                <path d="M 168 40 A 90 90 0 0 1 190 95" fill="none" stroke="#10b981" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
                                <line x1="100" y1="95" x2="100" y2="25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-slate-700 dark:text-slate-200 transition-transform duration-700" transform={`rotate(${needleAngle} 100 95)`} />
                                <circle cx="100" cy="95" r="5" fill="currentColor" className="text-slate-700 dark:text-slate-200" />
                            </svg>
                        </div>
                        <p className={`text-2xl font-bold ${sentiment.color} -mt-1`}>{Math.round(score)}</p>
                        <p className={`text-xs font-semibold ${sentiment.color} flex items-center gap-1`}>
                            <span>{sentiment.emoji}</span>{sentiment.label}
                        </p>
                    </div>

                    {/* Breadth Bar */}
                    <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Gainers {breadthPct}%</span>
                            <span>{100 - breadthPct}% Losers</span>
                        </div>
                        <div className="w-full h-2 bg-red-200 dark:bg-red-900/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${breadthPct}%` }}
                            />
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                            <TrendingUp size={14} className="text-emerald-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{gainersCount}</p>
                                <p className="text-[10px] text-slate-500">Avg +{avgGainerPct.toFixed(1)}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <TrendingDown size={14} className="text-red-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-base font-bold text-red-600 dark:text-red-400">{losersCount}</p>
                                <p className="text-[10px] text-slate-500">Avg -{avgLoserPct.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Top Mover Highlights */}
                    <div className="space-y-1.5 mt-auto">
                        {topGainer && (
                            <Link href={`/stocks/${topGainer.symbol}`} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition group">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px] font-bold text-emerald-600 shrink-0">🔥</div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-500 transition">{topGainer.symbol}</p>
                                        <p className="text-[10px] text-slate-400 truncate">{topGainer.name || 'Top Gainer'}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-emerald-500 shrink-0">+{topGainer.changePercent?.toFixed(2)}%</span>
                            </Link>
                        )}
                        {topLoser && (
                            <Link href={`/stocks/${topLoser.symbol}`} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition group">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] font-bold text-red-600 shrink-0">💧</div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-red-500 transition">{topLoser.symbol}</p>
                                        <p className="text-[10px] text-slate-400 truncate">{topLoser.name || 'Top Loser'}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-red-500 shrink-0">{topLoser.changePercent?.toFixed(2)}%</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
