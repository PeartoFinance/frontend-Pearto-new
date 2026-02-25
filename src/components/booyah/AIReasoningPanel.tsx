'use client';

import { Sparkles, AlertTriangle, Rocket, Shield, Loader2 } from 'lucide-react';
import type { BooyahPrediction } from '@/app/booyah/page';
import type { MarketStock, DetailedForecast } from '@/services/marketService';

interface AIReasoningPanelProps {
    prediction: BooyahPrediction | null;
    stockData: MarketStock | null;
    forecast: DetailedForecast | null;
    loading: boolean;
}

export default function AIReasoningPanel({ prediction, stockData, forecast, loading }: AIReasoningPanelProps) {
    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">AI Analysis</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" style={{ width: `${100 - i * 15}%` }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!prediction) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
                <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">AI reasoning will appear here</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            {/* AI Reasoning */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">AI Reasoning</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {prediction.reasoning}
                </p>
            </div>

            {/* Catalysts */}
            {prediction.catalysts.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Rocket className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Catalysts</h4>
                    </div>
                    <ul className="space-y-1.5">
                        {prediction.catalysts.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                                {c}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Risks */}
            {prediction.risks.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Risks</h4>
                    </div>
                    <ul className="space-y-1.5">
                        {prediction.risks.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Analyst Consensus (if available) */}
            {forecast?.analystConsensus && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Analyst Consensus</h4>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                        {[
                            { label: 'Strong Buy', count: forecast.analystConsensus.strongBuy, color: 'bg-emerald-500' },
                            { label: 'Buy', count: forecast.analystConsensus.buy, color: 'bg-emerald-400' },
                            { label: 'Hold', count: forecast.analystConsensus.hold, color: 'bg-amber-400' },
                            { label: 'Sell', count: forecast.analystConsensus.sell, color: 'bg-red-400' },
                            { label: 'Strong Sell', count: forecast.analystConsensus.strongSell, color: 'bg-red-500' },
                        ].map(item => (
                            <div key={item.label} className="text-center">
                                <div className={`h-1.5 rounded-full ${item.color} mb-1`} />
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.label.split(' ').pop()}</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{item.count}</p>
                            </div>
                        ))}
                    </div>
                    {forecast.analystConsensus.consensus && (
                        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Consensus: <span className="font-semibold text-slate-900 dark:text-white">{forecast.analystConsensus.consensus}</span> ({forecast.analystConsensus.total} analysts)
                        </p>
                    )}
                </div>
            )}

            {/* Disclaimer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                    AI predictions are for informational purposes only and should not be considered financial advice.
                    Always do your own research before making investment decisions.
                </p>
            </div>
        </div>
    );
}
