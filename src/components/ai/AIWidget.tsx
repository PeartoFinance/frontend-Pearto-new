'use client';

import { useState } from 'react';
import { Sparkles, Lightbulb, MessageSquare, TrendingUp } from 'lucide-react';
import { AISidepanel } from './AISidepanel';

interface AIWidgetProps {
    /** Widget display type */
    type?: 'compact' | 'inline' | 'floating';
    /** Position for floating widget */
    position?: 'bottom-right' | 'bottom-left';
    /** Page type for context */
    pageType: string;
    /** Page data for context */
    pageData?: unknown;
    /** Quick prompts to show */
    quickPrompts?: string[];
    /** Widget title */
    title?: string;
    /** Widget description */
    description?: string;
}

export function AIWidget({
    type = 'compact',
    position = 'bottom-right',
    pageType,
    pageData,
    quickPrompts = [],
    title = 'Pearto AI',
    description = 'Get instant AI-powered insights'
}: AIWidgetProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [autoPrompt, setAutoPrompt] = useState<string | undefined>();

    const handleQuickPrompt = (prompt: string) => {
        setAutoPrompt(prompt);
        setIsPanelOpen(true);
    };

    const togglePanel = () => {
        setAutoPrompt(undefined);
        setIsPanelOpen(!isPanelOpen);
    };

    // Compact - just a button
    if (type === 'compact') {
        return (
            <>
                <AISidepanel
                    isOpen={isPanelOpen}
                    onToggle={togglePanel}
                    pageType={pageType}
                    pageData={pageData}
                    initialPrompt={autoPrompt}
                />
            </>
        );
    }

    // Inline - embedded in page
    if (type === 'inline') {
        return (
            <div className="my-6 p-5 bg-linear-to-br from-emerald-900/20 via-teal-900/20 to-cyan-900/20 rounded-2xl border border-emerald-700/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h4 className="font-semibold text-white flex items-center gap-2">
                                {title}
                            </h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30">
                                AI Powered
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            {description}
                        </p>

                        {/* Quick Prompts */}
                        {quickPrompts.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {quickPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickPrompt(prompt)}
                                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                                    >
                                        <Lightbulb className="w-3 h-3 text-amber-400" />
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setIsPanelOpen(true)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Ask AI Anything
                        </button>
                    </div>
                </div>

                {/* AI note */}
                <div className="mt-4 pt-3 border-t border-emerald-700/30">
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        AI provides context-aware insights based on this page's data
                    </p>
                </div>

                <AISidepanel
                    isOpen={isPanelOpen}
                    onToggle={togglePanel}
                    pageType={pageType}
                    pageData={pageData}
                    initialPrompt={autoPrompt}
                />
            </div>
        );
    }

    // Floating - fixed position button
    if (type === 'floating') {
        const positionClasses = {
            'bottom-right': 'bottom-6 right-6',
            'bottom-left': 'bottom-6 left-6'
        };

        return (
            <>
                <button
                    onClick={() => setIsPanelOpen(true)}
                    className={`fixed ${positionClasses[position]} z-50 p-4 bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 group`}
                    aria-label="Open Pearto AI"
                >
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        <div className="hidden sm:block text-left">
                            <div className="text-sm font-semibold">Pearto AI</div>
                            <div className="text-xs text-emerald-100">Ask anything</div>
                        </div>
                    </div>
                </button>

                <AISidepanel
                    isOpen={isPanelOpen}
                    onToggle={togglePanel}
                    pageType={pageType}
                    pageData={pageData}
                    initialPrompt={autoPrompt}
                />
            </>
        );
    }

    return null;
}

export default AIWidget;
