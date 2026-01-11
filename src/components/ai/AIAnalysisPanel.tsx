'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Loader2, MessageSquare } from 'lucide-react';
import { post } from '@/services/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AIAnalysisPanelProps {
    /** Panel title */
    title?: string;
    /** Page type for context */
    pageType: string;
    /** Page data to analyze */
    pageData: unknown;
    /** Auto-analyze on mount */
    autoAnalyze?: boolean;
    /** Compact mode */
    compact?: boolean;
    /** Quick prompt suggestions */
    quickPrompts?: string[];
    /** Custom class */
    className?: string;
}

export function AIAnalysisPanel({
    title = 'Movers Analysis',
    pageType,
    pageData,
    autoAnalyze = true,
    compact = false,
    quickPrompts = [],
    className = ''
}: AIAnalysisPanelProps) {
    const [analysis, setAnalysis] = useState<string>('');
    const [displayedText, setDisplayedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasAutoAnalyzedRef = useRef(false);

    // Typing effect
    useEffect(() => {
        if (!analysis || isLoading) {
            setDisplayedText('');
            return;
        }

        setIsTyping(true);
        let currentIndex = 0;
        const typingSpeed = 8;

        const typeNextChar = () => {
            if (currentIndex < analysis.length) {
                const chunkSize = 3;
                setDisplayedText(analysis.slice(0, Math.min(currentIndex + chunkSize, analysis.length)));
                currentIndex += chunkSize;
                setTimeout(typeNextChar, typingSpeed);
            } else {
                setIsTyping(false);
            }
        };

        typeNextChar();

        return () => { setIsTyping(false); };
    }, [analysis, isLoading]);

    // Auto-scroll while typing
    useEffect(() => {
        if (isTyping && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayedText, isTyping]);

    // Fetch analysis
    const fetchAnalysis = useCallback(async (prompt?: string) => {
        setIsLoading(true);
        setError(null);
        setAnalysis('');
        setDisplayedText('');

        try {
            const message = prompt
                ? prompt
                : `Analyze this ${pageType} data briefly. Highlight 2-3 key insights and trends.`;

            const response = await post<{ success: boolean; response: string }>('/ai/chat', {
                message,
                context: { pageType, pageData }
            });

            setAnalysis(response.response || 'No analysis available.');
        } catch (err) {
            console.error('AI Analysis error:', err);
            setError('Unable to generate analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [pageType, pageData]);

    // Auto-analyze
    useEffect(() => {
        if (autoAnalyze && !hasAutoAnalyzedRef.current && pageData && typeof pageData === 'object' && Object.keys(pageData as object).length > 0) {
            hasAutoAnalyzedRef.current = true;
            const timer = setTimeout(() => fetchAnalysis(), 300);
            return () => clearTimeout(timer);
        }
    }, [autoAnalyze, pageData, fetchAnalysis]);

    return (
        <div className={`bg-linear-to-br from-slate-800/50 to-emerald-900/20 border border-emerald-700/30 rounded-xl ${className}`}>
            {/* Header */}
            <div className={`flex items-center justify-between ${compact ? 'p-3' : 'p-4'} border-b border-emerald-700/30`}>
                <div className="flex items-center gap-2">
                    <Sparkles className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-400`} />
                    <span className={`font-semibold text-white ${compact ? 'text-sm' : ''}`}>{title}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => fetchAnalysis()}
                        disabled={isLoading}
                        className="p-1.5 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-white disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-white"
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className={`${compact ? 'p-3' : 'p-4'}`}>
                    {/* Quick Prompts */}
                    {quickPrompts.length > 0 && !isLoading && !analysis && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {quickPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => fetchAnalysis(prompt)}
                                    className="text-[10px] px-2 py-1 bg-slate-700/50 hover:bg-emerald-600/30 border border-slate-600 hover:border-emerald-500/50 rounded-lg text-slate-300 hover:text-white transition"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Scrollable Content */}
                    <div ref={scrollRef} className="overflow-y-auto max-h-64">
                        {/* Loading */}
                        {isLoading && (
                            <div className="flex items-center gap-2 py-4">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                <span className="text-sm text-slate-400">Analyzing market data...</span>
                            </div>
                        )}

                        {/* Error */}
                        {error && !isLoading && (
                            <div className="text-sm text-red-400 py-2">{error}</div>
                        )}

                        {/* Analysis with typing effect */}
                        {displayedText && !isLoading && (
                            <div>
                                <MarkdownRenderer content={displayedText} compact={compact} />
                                {isTyping && (
                                    <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-0.5" />
                                )}
                            </div>
                        )}

                        {/* Empty state */}
                        {!analysis && !isLoading && !error && (
                            <div className="text-center py-4">
                                <MessageSquare className="w-8 h-8 mx-auto text-emerald-700 mb-2" />
                                <p className="text-xs text-slate-500">Click refresh to get AI insights</p>
                            </div>
                        )}
                    </div>

                    {/* Disclaimer */}
                    {displayedText && !isTyping && (
                        <p className="text-[9px] text-slate-500 mt-3 pt-2 border-t border-slate-700">
                            ⚠️ AI analysis is for informational purposes only. Not financial advice.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default AIAnalysisPanel;
