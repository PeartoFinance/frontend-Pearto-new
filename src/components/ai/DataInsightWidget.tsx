'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Lightbulb, ChevronRight, Loader2, Maximize2, Lock } from 'lucide-react';
import { post } from '@/services/api';
import { AISidepanel } from './AISidepanel';
import { useAIEnabled } from '@/context/FeatureFlagsContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { UpgradeModal } from '@/components/subscription/FeatureGating';

interface DataInsightWidgetProps {
    /** Data to analyze */
    data: unknown;
    /** Type of data (chart, table, portfolio, etc) */
    dataType: 'chart' | 'progress' | 'table' | 'metrics' | 'portfolio' | 'crypto' | 'stock' | 'forex';
    /** Widget title */
    title?: string;
    /** Compact mode */
    compact?: boolean;
    /** Position in parent */
    position?: 'top-right' | 'bottom' | 'inline';
    /** Custom class */
    className?: string;
}

export function DataInsightWidget({
    data,
    dataType,
    title = '💡 AI Insights',
    compact = false,
    position = 'inline',
    className = ''
}: DataInsightWidgetProps) {
    // Feature Flags & Subscription
    const { isAIEnabled, isLoading: flagsLoading } = useAIEnabled();
    const { isPro, isLoading: subLoading, trackUsage } = useSubscription();

    const [insights, setInsights] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    // Initial Auto-Analyze Only for Pro Users
    useEffect(() => {
        if (isPro && !hasAnalyzed && data) {
            generateInsights();
        }
    }, [data, dataType, isPro, hasAnalyzed]);

    const handleManualGenerate = async () => {
        const result = await trackUsage('ai_queries_limit');
        if (result.allowed) {
            generateInsights();
        } else {
            setShowUpgradeModal(true);
        }
    };

    const generateInsights = async () => {
        if (!data) return;

        setLoading(true);
        setError(null);
        setHasAnalyzed(true);

        try {
            const response = await post<{ success: boolean; insights?: string[]; analysis?: string }>('/ai/analyze', {
                pageType: dataType,
                pageData: data
            });

            if (response.insights && response.insights.length > 0) {
                setInsights(response.insights);
            } else {
                setInsights([]);
            }
        } catch (err) {
            console.error('AI Insight generation error:', err);
            setError('AI unavailable');
            setInsights([]);
        } finally {
            setLoading(false);
        }
    };

    // If disabled by admin, hide completely
    if (!flagsLoading && !isAIEnabled) {
        return null;
    }

    // Positions
    const positionStyles = {
        'top-right': 'absolute top-4 right-4 max-w-sm z-10',
        'bottom': 'mt-4',
        'inline': 'my-4'
    };

    // Render Logic for Non-Pro / Unanalyzed state
    if (!hasAnalyzed && !loading && insights.length === 0) {
        // For Pro users, it auto-runs so this state is transient.
        // For non-Pro, we show the "Get AI Insights" CTA.
        if (isPro || subLoading) return null; // Don't flash CTA for Pro users while loading

        return (
            <>
                <div className={`bg-gradient-to-br from-emerald-900/10 to-teal-900/10 border border-emerald-700/20 rounded-xl p-3 flex items-center justify-between gap-4 ${positionStyles[position]} ${className}`}>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-emerald-100">Get AI Insights for this view</span>
                    </div>
                    <button
                        onClick={handleManualGenerate}
                        className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
                    >
                        Analyze <span className="opacity-75 text-[10px]">(1 Credit)</span>
                    </button>
                    <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} featureKey="ai_queries_limit" />
                </div>
            </>
        );
    }

    // Loading State
    if (loading && insights.length === 0) {
        return (
            <div className={`bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-700/30 rounded-xl p-4 ${positionStyles[position]} ${className}`}>
                <div className="flex items-center gap-2 text-emerald-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analyzing data with AI...</span>
                </div>
            </div>
        );
    }

    // Don't render empty results if not loading
    if (insights.length === 0 && hasAnalyzed) {
        return null;
    }

    // Results State
    return (
        <>
            <div className={`bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-cyan-900/20 border border-emerald-700/30 rounded-xl shadow-sm hover:shadow-md transition-all ${positionStyles[position]} ${className}`}>
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-emerald-100 text-sm">
                                    {title}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300 font-medium border border-emerald-700/50">
                                    AI Powered
                                </span>
                            </div>

                            {/* Insights List */}
                            <ul className="space-y-1.5 mb-3">
                                {insights.slice(0, compact ? 2 : 3).map((insight, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                        <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-emerald-400 flex-shrink-0" />
                                        <span className="leading-relaxed">{insight}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Expand Button */}
                            <button
                                onClick={() => setIsPanelOpen(true)}
                                className="text-xs text-emerald-300 hover:text-emerald-100 flex items-center gap-1 group transition"
                            >
                                <Maximize2 className="w-3 h-3" />
                                Detailed Analysis & Chat
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* AI Attribution */}
                    <div className="mt-3 pt-2 border-t border-emerald-700/30">
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Context-aware AI analysis • Updated in real-time
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Side Panel */}
            <AISidepanel
                isOpen={isPanelOpen}
                onToggle={() => setIsPanelOpen(!isPanelOpen)}
                pageType={dataType}
                pageData={data}
            />

            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} featureKey="ai_queries_limit" />
        </>
    );
}

export default DataInsightWidget;
