'use client';

import { useState, useEffect } from 'react';
import {
    Sparkles, Lightbulb, X, ChevronRight, Search,
    TrendingUp, Calculator, DollarSign, Cloud, Zap,
    BarChart3, GitCompare, Filter, Brain, ArrowRight,
    Mic, Globe, Shield, Layers, Target
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { AIChat } from '@/components/ai/AIChat';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';

type AIMode = 'default' | 'deep-analysis' | 'quick';

// Enhanced tool categories with more options
const TOOL_CATEGORIES = [
    {
        title: 'Stocks & Markets',
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'from-emerald-500 to-teal-500',
        textColor: 'text-emerald-400',
        items: [
            { text: 'Apple stock price', prompt: 'Get Apple (AAPL) stock price' },
            { text: 'Tesla quote', prompt: 'Get Tesla (TSLA) stock quote' },
            { text: 'Top gainers today', prompt: 'Show top gaining stocks today' },
            { text: 'Top losers today', prompt: 'Show top losing stocks today' },
            { text: 'Sector performance', prompt: 'Show sector performance overview' },
        ]
    },
    {
        title: 'Compare & Analyze',
        icon: <GitCompare className="w-4 h-4" />,
        color: 'from-violet-500 to-purple-500',
        textColor: 'text-violet-400',
        items: [
            { text: 'AAPL vs MSFT', prompt: 'Compare Apple (AAPL) vs Microsoft (MSFT) stocks' },
            { text: 'TSLA vs RIVN', prompt: 'Compare Tesla (TSLA) vs Rivian (RIVN)' },
            { text: 'Tech giants comparison', prompt: 'Compare AAPL, MSFT, GOOGL, AMZN stocks' },
            { text: 'NVDA technical analysis', prompt: 'Technical analysis for NVDA' },
        ]
    },
    {
        title: 'Stock Screener',
        icon: <Filter className="w-4 h-4" />,
        color: 'from-blue-500 to-cyan-500',
        textColor: 'text-blue-400',
        items: [
            { text: 'High dividend stocks', prompt: 'Screen stocks with dividend yield above 3%' },
            { text: 'Value stocks (low P/E)', prompt: 'Find value stocks with P/E below 15' },
            { text: 'Tech sector stocks', prompt: 'Screen Technology sector stocks by market cap' },
            { text: 'Large cap healthcare', prompt: 'Find healthcare stocks with market cap above 50 billion' },
        ]
    },
    {
        title: 'Crypto',
        icon: <Zap className="w-4 h-4" />,
        color: 'from-orange-500 to-amber-500',
        textColor: 'text-orange-400',
        items: [
            { text: 'Bitcoin price', prompt: 'What is Bitcoin (BTC) price?' },
            { text: 'Ethereum price', prompt: 'Get Ethereum (ETH) price' },
            { text: 'Solana price', prompt: 'Get Solana (SOL) price' },
            { text: 'BTC vs ETH', prompt: 'Compare Bitcoin and Ethereum' },
        ]
    },
    {
        title: 'Calculators',
        icon: <Calculator className="w-4 h-4" />,
        color: 'from-blue-500 to-indigo-500',
        textColor: 'text-blue-400',
        items: [
            { text: 'SIP calculator', prompt: 'Calculate SIP for $500/month for 10 years at 12%' },
            { text: 'EMI calculator', prompt: 'Calculate EMI for $50000 at 8% for 5 years' },
            { text: 'Compound interest', prompt: 'Calculate compound interest on $10000 at 7% for 15 years compounded monthly' },
        ]
    },
    {
        title: 'Forex & Currency',
        icon: <DollarSign className="w-4 h-4" />,
        color: 'from-purple-500 to-fuchsia-500',
        textColor: 'text-purple-400',
        items: [
            { text: 'USD exchange rates', prompt: 'Get forex rates for USD' },
            { text: 'EUR exchange rates', prompt: 'Get forex rates for EUR' },
        ]
    },
    {
        title: 'Weather',
        icon: <Cloud className="w-4 h-4" />,
        color: 'from-sky-500 to-blue-500',
        textColor: 'text-sky-400',
        items: [
            { text: 'Kathmandu weather', prompt: 'What is the weather in Kathmandu?' },
            { text: 'New York weather', prompt: 'Get weather for New York' },
            { text: 'London weather', prompt: 'Weather in London' },
        ]
    },
];

// Quick action cards for the landing state
const QUICK_ACTIONS = [
    {
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Market Overview',
        description: 'Top movers, sectors & trends',
        prompt: 'Give me a market overview with top gainers, losers and sector performance',
        gradient: 'from-emerald-500/20 to-teal-500/20',
        border: 'border-emerald-500/30',
        iconColor: 'text-emerald-400',
    },
    {
        icon: <GitCompare className="w-5 h-5" />,
        title: 'Compare Stocks',
        description: 'Side-by-side analysis',
        prompt: 'Compare AAPL vs MSFT vs GOOGL stocks',
        gradient: 'from-violet-500/20 to-purple-500/20',
        border: 'border-violet-500/30',
        iconColor: 'text-violet-400',
    },
    {
        icon: <Target className="w-5 h-5" />,
        title: 'Stock Screener',
        description: 'Find stocks matching criteria',
        prompt: 'Find technology stocks with P/E below 25 and market cap above 10 billion',
        gradient: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/30',
        iconColor: 'text-blue-400',
    },
    {
        icon: <BarChart3 className="w-5 h-5" />,
        title: 'Technical Analysis',
        description: 'RSI, support & resistance',
        prompt: 'Give me technical analysis for AAPL stock',
        gradient: 'from-amber-500/20 to-orange-500/20',
        border: 'border-amber-500/30',
        iconColor: 'text-amber-400',
    },
];

// Mode selector definitions
const AI_MODES: { key: AIMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'default', label: 'Standard', icon: <Sparkles className="w-3.5 h-3.5" />, desc: 'Balanced responses' },
    { key: 'deep-analysis', label: 'Deep Analysis', icon: <Brain className="w-3.5 h-3.5" />, desc: 'Detailed research' },
    { key: 'quick', label: 'Quick', icon: <Zap className="w-3.5 h-3.5" />, desc: 'Fast & concise' },
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
        <div className="border-b border-slate-200/50 dark:border-slate-700/30 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                        <span className="text-white">{category.icon}</span>
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{category.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-2 px-3 animate-in slide-in-from-top-2 duration-200">
                    {category.items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSelect(item.prompt)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-2 group"
                        >
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                            <span>{item.text}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AIPage() {
    const [showPanel, setShowPanel] = useState(false);
    const [externalPrompt, setExternalPrompt] = useState<{ text: string; timestamp: number } | undefined>();
    const [aiMode, setAIMode] = useState<AIMode>('default');
    const [searchFilter, setSearchFilter] = useState('');

    const handleSelectPrompt = (prompt: string) => {
        setExternalPrompt({ text: prompt, timestamp: Date.now() });
        setShowPanel(false);
    };

    const filteredCategories = searchFilter
        ? TOOL_CATEGORIES.map(cat => ({
            ...cat,
            items: cat.items.filter(item =>
                item.text.toLowerCase().includes(searchFilter.toLowerCase()) ||
                item.prompt.toLowerCase().includes(searchFilter.toLowerCase())
            )
        })).filter(cat => cat.items.length > 0)
        : TOOL_CATEGORIES;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 flex overflow-hidden">
                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col p-4 lg:p-6">
                        {/* Page Header with Mode Selector */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pearto AI</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Financial Intelligence Assistant</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* AI Mode Selector */}
                                <div className="hidden sm:flex items-center bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/50 p-1">
                                    {AI_MODES.map(mode => (
                                        <button
                                            key={mode.key}
                                            onClick={() => setAIMode(mode.key)}
                                            title={mode.desc}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                                aiMode === mode.key
                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                            }`}
                                        >
                                            {mode.icon}
                                            <span>{mode.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowPanel(!showPanel)}
                                    className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                                >
                                    <Lightbulb className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Component */}
                        <div className="flex-1 min-h-0">
                            <AIChat
                                showSuggestions={false}
                                compact={true}
                                height="h-full"
                                externalPrompt={externalPrompt}
                                mode={aiMode}
                                quickActions={QUICK_ACTIONS}
                                onModeChange={setAIMode}
                            />
                        </div>
                    </div>

                    {/* Right Panel - Desktop */}
                    <aside className="hidden lg:flex flex-col w-80 border-l border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/20">
                        {/* Panel Header with Search */}
                        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-amber-400" />
                                <span className="font-semibold text-slate-900 dark:text-white text-sm">AI Tools & Suggestions</span>
                            </div>
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search tools..."
                                    value={searchFilter}
                                    onChange={e => setSearchFilter(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-lg text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                                />
                            </div>
                        </div>

                        {/* Capabilities Banner */}
                        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
                            <div className="grid grid-cols-3 gap-1.5">
                                {[
                                    { icon: <Globe className="w-3 h-3" />, label: 'Live Data' },
                                    { icon: <Shield className="w-3 h-3" />, label: 'Accurate' },
                                    { icon: <Layers className="w-3 h-3" />, label: 'Multi-Tool' },
                                ].map((cap, i) => (
                                    <div key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800/40 rounded-md">
                                        <span className="text-emerald-500">{cap.icon}</span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{cap.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tool Categories */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredCategories.map((cat, idx) => (
                                <ToolCategory key={idx} category={cat} onSelect={handleSelectPrompt} />
                            ))}
                            {filteredCategories.length === 0 && (
                                <div className="p-4 text-center text-xs text-slate-400">
                                    No matching tools found
                                </div>
                            )}
                        </div>

                        {/* Bottom Section */}
                        <div className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-slate-700/50 space-y-3">
                            <AIAnalysisPanel
                                title="AI Quick Insights"
                                pageType="ai-assistant"
                                pageData={{
                                    capabilities: ['stocks', 'crypto', 'forex', 'calculators', 'weather', 'screener', 'compare'],
                                    status: 'ready'
                                }}
                                autoAnalyze={false}
                                compact={true}
                                quickPrompts={[
                                    'Best value stocks today',
                                    'High dividend picks',
                                    'Market sector analysis'
                                ]}
                                className="mb-0"
                            />

                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-700/20">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Brain className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">AI Capabilities</span>
                                </div>
                                <div className="space-y-1">
                                    {[
                                        'Compare multiple stocks side-by-side',
                                        'Screen stocks by any criteria',
                                        'Technical analysis with RSI & levels',
                                        'Compound interest & SIP calculators',
                                    ].map((tip, i) => (
                                        <p key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                            <span className="text-emerald-500 mt-0.5">•</span>
                                            {tip}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Panel */}
                    {showPanel && (
                        <div className="lg:hidden fixed inset-0 z-50 flex">
                            <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setShowPanel(false)} />
                            <aside className="w-80 h-full bg-white dark:bg-slate-900 flex flex-col shadow-2xl">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
                                    <span className="font-semibold text-slate-900 dark:text-white text-sm">AI Tools</span>
                                    <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded">
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                                {/* Mobile Mode Selector */}
                                <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700/50 flex gap-1">
                                    {AI_MODES.map(mode => (
                                        <button
                                            key={mode.key}
                                            onClick={() => setAIMode(mode.key)}
                                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                aiMode === mode.key
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {mode.icon}
                                            <span className="hidden sm:inline">{mode.label}</span>
                                        </button>
                                    ))}
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
