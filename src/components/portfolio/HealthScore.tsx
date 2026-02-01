'use client';

import { useEffect, useState } from 'react';
import { getPortfolioHealth, type PortfolioHealth } from '@/services/portfolioService';
import { Activity, AlertCircle, CheckCircle, TrendingUp, Wallet } from 'lucide-react';

interface HealthScoreProps {
    compact?: boolean; // For profile or sidebar view
    onConfigure?: () => void;
}

export default function HealthScore({ compact = false, onConfigure }: HealthScoreProps) {
    const [health, setHealth] = useState<PortfolioHealth | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHealth();
    }, []);

    const loadHealth = async () => {
        try {
            const data = await getPortfolioHealth();

            // Process raw data to match component expectations
            if (data && !data.needs_setup && !data.needs_holdings) {
                // Compute letter grade
                let grade = 'A';
                if (data.score < 60) grade = 'F';
                else if (data.score < 70) grade = 'D';
                else if (data.score < 80) grade = 'C';
                else if (data.score < 90) grade = 'B';

                data.letter_grade = grade;
                data.summary = `Your portfolio health is ${data.status}.`;

                // Compute allocation health
                const allocHealth: any = {};
                if (data.actual_allocation && data.target_allocation) {
                    Object.keys(data.target_allocation).forEach(key => {
                        const actual = data.actual_allocation?.[key] || 0;
                        const target = data.target_allocation?.[key] || 0;
                        const diff = actual - target;

                        let status = "Balanced";
                        if (diff > 5) status = "Overweight";
                        else if (diff < -5) status = "Underweight";

                        allocHealth[key] = { actual, target, diff, status };
                    });
                }
                data.allocation_health = allocHealth;
            }

            setHealth(data);
        } catch (error) {
            console.error('Failed to load portfolio health:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse h-40 bg-slate-800 rounded-xl"></div>;

    if (!health || health.needs_setup || health.needs_holdings) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="text-emerald-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Portfolio Health Check</h3>
                <p className="text-slate-500 text-sm mb-4">Set your target allocation strategy to get a health score and rebalancing tips.</p>
                <button
                    onClick={onConfigure}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-lg transition"
                >
                    Set Strategy
                </button>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-red-500';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-amber-500';
        return 'bg-red-500';
    };

    if (compact) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition cursor-pointer" onClick={onConfigure}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Health Score</h3>
                        <p className="text-xs text-slate-500">{health.summary}</p>
                    </div>
                    <div className={`text-2xl font-black ${getScoreColor(health.score)}`}>
                        {health.letter_grade}
                    </div>
                </div>

                <div className="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-2">
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full ${getScoreBg(health.score)}`}
                        style={{ width: `${health.score}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Score: {health.score}/100</span>
                    <span className="group-hover:text-emerald-500 transition">View Details →</span>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Card */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="relative w-40 h-40 mb-4 flex items-center justify-center">
                    {/* SVG Gauge */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                        <circle
                            cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                            strokeDasharray={440} strokeDashoffset={440 - (440 * health.score) / 100}
                            className={`${getScoreColor(health.score)} transition-all duration-1000 ease-out`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-black ${getScoreColor(health.score)}`}>{health.score}</span>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Score</span>
                    </div>
                </div>
                <h2 className={`text-2xl font-bold mb-1 ${getScoreColor(health.score)}`}>Grade: {health.letter_grade}</h2>
                <p className="text-slate-500 text-sm">{health.summary}</p>

                <button onClick={onConfigure} className="mt-6 text-xs text-emerald-500 font-bold hover:underline uppercase tracking-wide">
                    Edit Strategy
                </button>
            </div>

            {/* Allocation Breakdown */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 lg:col-span-2">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Wallet size={18} className="text-emerald-500" /> Allocation Analysis
                </h3>

                <div className="space-y-4">
                    {Object.entries(health.allocation_health || {}).map(([assetClass, data]) => {
                        const label = assetClass.charAt(0).toUpperCase() + assetClass.slice(1);
                        const isAligned = Math.abs(data.diff) < 5;

                        return (
                            <div key={assetClass} className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-3 text-sm font-medium text-slate-500 capitalize">{label}</div>
                                <div className="col-span-7">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Actual: <strong className="text-white">{data.actual.toFixed(1)}%</strong></span>
                                        <span className="text-slate-400">Target: <strong className="text-white">{data.target}%</strong></span>
                                    </div>
                                    <div className="relative h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        {/* Target Marker */}
                                        <div
                                            className="absolute top-0 bottom-0 w-1 bg-slate-400 dark:bg-slate-500 z-10"
                                            style={{ left: `${Math.min(data.target, 100)}%` }}
                                        />
                                        {/* Actual Bar */}
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full ${isAligned ? 'bg-emerald-500' : data.diff > 0 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(data.actual, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isAligned ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {data.diff > 0 ? '+' : ''}{data.diff.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recommendations */}
                {(health.recommendations || []).length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-500" /> Action Items
                        </h4>
                        <div className="space-y-2">
                            {health.recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300">
                                    <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                    {rec}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
