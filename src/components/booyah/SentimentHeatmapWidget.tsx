'use client';

import { Activity, Newspaper, MessageCircle, Users, BarChart2 } from 'lucide-react';
import type { BooyahPrediction } from '@/app/booyah/page';

interface SentimentHeatmapWidgetProps {
    prediction: BooyahPrediction | null;
    loading: boolean;
}

export default function SentimentHeatmapWidget({ prediction, loading }: SentimentHeatmapWidgetProps) {
    if (loading || !prediction) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-purple-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Sentiment Heatmap</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // Mocking some sentiment data based on the overall prediction sentiment
    // In a real app, this would come from the backend
    const baseSentiment = prediction.sentiment; // -100 to 100
    
    const sources = [
        {
            name: 'News Media',
            icon: Newspaper,
            score: Math.min(100, Math.max(-100, baseSentiment + (Math.random() * 40 - 20))),
            weight: 30
        },
        {
            name: 'Social Sentiment',
            icon: MessageCircle,
            score: Math.min(100, Math.max(-100, baseSentiment + (Math.random() * 60 - 30))),
            weight: 20
        },
        {
            name: 'Analyst Ratings',
            icon: Users,
            score: Math.min(100, Math.max(-100, baseSentiment + (Math.random() * 20 - 10))),
            weight: 25
        },
        {
            name: 'Technical Momentum',
            icon: BarChart2,
            score: prediction.technicals.overallScore * 2 - 100, // Convert 0-100 to -100 to 100
            weight: 25
        }
    ];

    const getScoreColor = (score: number) => {
        if (score >= 60) return 'bg-emerald-500 text-white';
        if (score >= 20) return 'bg-emerald-400/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50';
        if (score > -20) return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
        if (score > -60) return 'bg-red-400/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50';
        return 'bg-red-500 text-white';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 60) return 'Very Bullish';
        if (score >= 20) return 'Bullish';
        if (score > -20) return 'Neutral';
        if (score > -60) return 'Bearish';
        return 'Very Bearish';
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Sentiment Heatmap</h3>
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Aggregated Sources
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {sources.map((source, idx) => {
                    const Icon = source.icon;
                    const colorClass = getScoreColor(source.score);
                    
                    return (
                        <div key={idx} className={`p-3 rounded-xl flex flex-col justify-between transition-all hover:scale-[1.02] cursor-default ${colorClass}`}>
                            <div className="flex items-center justify-between mb-2">
                                <Icon className="w-4 h-4 opacity-70 shrink-0" />
                                <span className="text-[10px] font-bold opacity-70 ml-1 truncate">{source.weight}% WGT</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium opacity-90 mb-0.5 truncate">{source.name}</p>
                                <p className="text-sm font-bold truncate">{getScoreLabel(source.score)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Overall Market Mood</span>
                <span className="font-bold text-slate-900 dark:text-white">
                    {baseSentiment > 0 ? '+' : ''}{baseSentiment.toFixed(0)}
                </span>
            </div>
        </div>
    );
}