'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Sparkles, Lightbulb, RefreshCw, X, ChevronRight,
    TrendingUp, Calculator, DollarSign, Cloud, Zap
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { AIChat } from '@/components/ai/AIChat';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';

// Tool categories for suggestions
const TOOL_CATEGORIES = [
    {
        title: 'Stocks & Markets',
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-emerald-400',
        items: [
            { text: 'Apple stock price', prompt: 'Get Apple (AAPL) stock price' },
            { text: 'Tesla quote', prompt: 'Get Tesla (TSLA) stock quote' },
            { text: 'Top gainers today', prompt: 'Show top gaining stocks today' },
            { text: 'Top losers today', prompt: 'Show top losing stocks today' },
        ]
    },
    {
        title: 'Crypto',
        icon: <Zap className="w-4 h-4" />,
        color: 'text-orange-400',
        items: [
            { text: 'Bitcoin price', prompt: 'What is Bitcoin (BTC) price?' },
            { text: 'Ethereum price', prompt: 'Get Ethereum (ETH) price' },
            { text: 'Solana price', prompt: 'Get Solana (SOL) price' },
        ]
    },
    {
        title: 'Calculators',
        icon: <Calculator className="w-4 h-4" />,
        color: 'text-blue-400',
        items: [
            { text: 'SIP calculator', prompt: 'Calculate SIP for $500/month for 10 years at 12%' },
            { text: 'EMI calculator', prompt: 'Calculate EMI for $50000 at 8% for 5 years' },
            { text: 'Compound interest', prompt: 'Calculate compound interest on $10000 at 7% for 15 years' },
        ]
    },
    {
        title: 'Forex & Currency',
        icon: <DollarSign className="w-4 h-4" />,
        color: 'text-purple-400',
        items: [
            { text: 'USD exchange rates', prompt: 'Get forex rates for USD to EUR, GBP, JPY' },
            { text: 'Convert currency', prompt: 'Convert 1000 USD to EUR' },
        ]
    },
    {
        title: 'Weather',
        icon: <Cloud className="w-4 h-4" />,
        color: 'text-sky-400',
        items: [
            { text: 'Kathmandu weather', prompt: 'What is the weather in Kathmandu?' },
            { text: 'New York weather', prompt: 'Get weather for New York' },
            { text: 'London weather', prompt: 'Weather in London' },
        ]
    },
];

function ToolCategory({
    category,
    onSelect
}: {
    category: typeof TOOL_CATEGORIES[0];
    onSelect: (prompt: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-700/50 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className={category.color}>{category.icon}</span>
                    <span className="text-sm text-slate-700 dark:text-white font-medium">{category.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-2 px-3">
                    {category.items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSelect(item.prompt)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                            {item.text}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AIPage() {
    const [showPanel, setShowPanel] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>();

    const handleSelectPrompt = (prompt: string) => {
        setSelectedPrompt(prompt);
        setShowPanel(false);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 flex overflow-hidden">
                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col p-4 lg:p-6">
                        {/* Page Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pearto AI</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Your Financial AI Assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPanel(!showPanel)}
                                className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            >
                                <Lightbulb className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Component */}
                        <div className="flex-1 min-h-0">
                            <AIChat
                                showSuggestions={false}
                                compact={true}
                                height="h-full"
                                initialPrompt={selectedPrompt}
                            />
                        </div>
                    </div>

                    {/* Right Panel - Desktop */}
                    <aside className="hidden lg:flex flex-col w-80 border-l border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30">
                        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-400" />
                                <span className="font-semibold text-slate-900 dark:text-white text-sm">Quick Suggestions</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Click a suggestion to try it</p>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {TOOL_CATEGORIES.map((cat, idx) => (
                                <ToolCategory key={idx} category={cat} onSelect={handleSelectPrompt} />
                            ))}
                        </div>

                        {/* AI Insights Panel - Similar to Screener Insights in Stocks */}
                        <div className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-slate-700/50">
                            <AIAnalysisPanel
                                title="AI Quick Insights"
                                pageType="ai-assistant"
                                pageData={{
                                    capabilities: ['stocks', 'crypto', 'forex', 'calculators', 'weather'],
                                    status: 'ready'
                                }}
                                autoAnalyze={false}
                                compact={true}
                                quickPrompts={[
                                    'Best value stocks here',
                                    'High dividend picks',
                                    'Growth opportunities'
                                ]}
                                className="mb-3"
                            />

                            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 border border-emerald-100 dark:border-emerald-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 uppercase">Pro Tip</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Try natural queries like "AAPL stock", "Calculate SIP for $1000/month", or "weather in Tokyo"
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Panel */}
                    {showPanel && (
                        <div className="lg:hidden fixed inset-0 z-50 flex">
                            <div className="flex-1 bg-black/50" onClick={() => setShowPanel(false)} />
                            <aside className="w-80 h-full bg-white dark:bg-slate-900 flex flex-col">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
                                    <span className="font-semibold text-slate-900 dark:text-white text-sm">Suggestions</span>
                                    <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded">
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {TOOL_CATEGORIES.map((cat, idx) => (
                                        <ToolCategory key={idx} category={cat} onSelect={handleSelectPrompt} />
                                    ))}
                                </div>
                            </aside>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
