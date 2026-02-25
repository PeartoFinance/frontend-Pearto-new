'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Send, Sparkles, User, Loader2, RefreshCw, X,
    TrendingUp, Calculator, DollarSign, Cloud, Zap, ChevronRight,
    Brain, ArrowRight, Copy, Check, ThumbsUp, ThumbsDown,
    GitCompare, Filter, BarChart3, Target, MessageSquare
} from 'lucide-react';
import { post } from '@/services/api';
import { ToolResultCard } from './ToolResultCard';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useSubscription } from '@/context/SubscriptionContext';
import { UsageLimitBanner, UpgradeModal } from '@/components/subscription/FeatureGating';

type AIMode = 'default' | 'deep-analysis' | 'quick';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    toolsUsed?: ToolExecution[];
    isStreaming?: boolean;
    followUpQuestions?: string[];
    mode?: AIMode;
}

interface ToolExecution {
    tool: string;
    args: Record<string, unknown>;
    result: unknown;
}

interface QuickAction {
    icon: React.ReactNode;
    title: string;
    description: string;
    prompt: string;
    gradient: string;
    border: string;
    iconColor: string;
}

// Tool categories for suggestions
const TOOL_CATEGORIES = [
    {
        title: 'Stocks',
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-emerald-400',
        items: [
            { text: 'Apple stock', prompt: 'Get Apple (AAPL) stock price' },
            { text: 'Top gainers', prompt: 'Show top gaining stocks today' },
        ]
    },
    {
        title: 'Crypto',
        icon: <Zap className="w-4 h-4" />,
        color: 'text-orange-400',
        items: [
            { text: 'Bitcoin', prompt: 'What is Bitcoin (BTC) price?' },
            { text: 'Ethereum', prompt: 'Get Ethereum (ETH) price' },
        ]
    },
    {
        title: 'Calculators',
        icon: <Calculator className="w-4 h-4" />,
        color: 'text-blue-400',
        items: [
            { text: 'SIP calc', prompt: 'Calculate SIP for $500/month for 10 years at 12%' },
            { text: 'EMI calc', prompt: 'Calculate EMI for $50000 at 8% for 5 years' },
        ]
    },
    {
        title: 'Forex',
        icon: <DollarSign className="w-4 h-4" />,
        color: 'text-purple-400',
        items: [
            { text: 'USD rates', prompt: 'Get forex rates for USD' },
        ]
    },
    {
        title: 'Weather',
        icon: <Cloud className="w-4 h-4" />,
        color: 'text-sky-400',
        items: [
            { text: 'Kathmandu', prompt: 'Weather in Kathmandu' },
        ]
    },
];

// Copy button for messages
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-slate-700/50 transition-colors"
            title="Copy"
        >
            {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
            ) : (
                <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />
            )}
        </button>
    );
}

// Follow-up question chips
function FollowUpQuestions({ questions, onSelect }: { questions: string[]; onSelect: (q: string) => void }) {
    if (!questions.length) return null;
    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {questions.map((q, idx) => (
                <button
                    key={idx}
                    onClick={() => onSelect(q)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 hover:border-emerald-500/30 rounded-full transition-all group"
                >
                    <MessageSquare className="w-3 h-3 text-emerald-400 group-hover:text-emerald-300" />
                    <span>{q}</span>
                </button>
            ))}
        </div>
    );
}

// Message Bubble Component
function MessageBubble({ message, onFollowUp }: { message: Message; onFollowUp?: (q: string) => void }) {
    const isUser = message.role === 'user';
    
    // Clean content of any leaked tool JSON
    const cleanContent = (content: string) => {
        return content
            .replace(/\{\s*"name"\s*:\s*"[^"]+"\s*,\s*"arguments"\s*:\s*\{[^}]*\}\s*\}/g, '')
            .replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, '')
            .trim();
    };

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isUser ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-purple-600 to-pink-500'}`}>
                {isUser ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
            </div>
            <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
                {isUser ? (
                    <div className="inline-block px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-left text-sm">
                        {message.content}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {message.isStreaming ? (
                            <div className="flex items-center gap-3 text-slate-400 text-sm py-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-xs">
                                    {message.mode === 'deep-analysis' ? 'Analyzing deeply...' : 'Thinking...'}
                                </span>
                            </div>
                        ) : (
                            <>
                                {/* Tool Result Cards */}
                                {message.toolsUsed?.map((exec, idx) => (
                                    <ToolResultCard key={idx} tool={exec.tool} result={exec.result} />
                                ))}
                                {/* AI Response */}
                                {message.content && (
                                    <MarkdownRenderer content={cleanContent(message.content)} compact className="text-slate-300" />
                                )}
                                {/* Action bar */}
                                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CopyButton text={cleanContent(message.content)} />
                                </div>
                                {/* Follow-up Questions */}
                                {message.followUpQuestions && onFollowUp && (
                                    <FollowUpQuestions questions={message.followUpQuestions} onSelect={onFollowUp} />
                                )}
                            </>
                        )}
                    </div>
                )}
                <div className="text-[10px] text-slate-600 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                    {message.mode && message.mode !== 'default' && (
                        <span className="ml-2 px-1.5 py-0.5 bg-slate-800/60 rounded text-slate-500">
                            {message.mode === 'deep-analysis' ? 'Deep' : 'Quick'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// Suggestion Category
function SuggestionCategory({ category, onSelect }: { category: typeof TOOL_CATEGORIES[0]; onSelect: (prompt: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-700/50 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className={category.color}>{category.icon}</span>
                    <span className="text-sm text-white font-medium">{category.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-2 px-2">
                    {category.items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSelect(item.prompt)}
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                            {item.text}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Props for AIChat component
interface AIChatProps {
    context?: { pageType?: string; pageData?: unknown };
    showSuggestions?: boolean;
    compact?: boolean;
    height?: string;
    initialPrompt?: string;
    externalPrompt?: { text: string; timestamp: number };
    mode?: AIMode;
    quickActions?: QuickAction[];
    onModeChange?: (mode: AIMode) => void;
}

export function AIChat({
    context,
    showSuggestions = true,
    compact = false,
    height = 'h-[500px]',
    initialPrompt,
    externalPrompt,
    mode = 'default',
    quickActions,
    onModeChange
}: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { trackUsage, isPro, usage } = useSubscription();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    // Auto-send initial prompt
    useEffect(() => {
        if (initialPrompt && messages.length === 0) {
            sendMessage(initialPrompt);
        }
    }, [initialPrompt]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        // Check usage limit before sending (Free users only)
        if (!isPro) {
            const result = await trackUsage('ai_queries_limit');
            if (!result.allowed) {
                setShowUpgradeModal(true);
                return;
            }
        }

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: messageText.trim(),
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const streamingId = `assistant-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: streamingId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true,
            mode
        }]);

        try {
            const response = await post<{
                success: boolean;
                response: string;
                toolsUsed?: ToolExecution[];
                followUpQuestions?: string[];
                mode?: string;
            }>('/ai/chat-with-tools', {
                message: messageText.trim(),
                history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
                enableTools: true,
                context: context,
                mode: mode
            });

            setMessages(prev => prev.map(m =>
                m.id === streamingId
                    ? {
                        ...m,
                        content: response.response || '',
                        isStreaming: false,
                        toolsUsed: response.toolsUsed || [],
                        followUpQuestions: response.followUpQuestions || [],
                        mode
                    }
                    : m
            ));
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => prev.map(m =>
                m.id === streamingId
                    ? { ...m, content: 'Sorry, an error occurred. Please try again.', isStreaming: false }
                    : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-send external prompt when it changes
    const sendMessageRef = useRef(sendMessage);
    useEffect(() => {
        sendMessageRef.current = sendMessage;
    });

    useEffect(() => {
        if (externalPrompt?.text) {
            sendMessageRef.current(externalPrompt.text);
        }
    }, [externalPrompt?.timestamp]);

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleFollowUp = (question: string) => {
        sendMessage(question);
    };

    return (
        <div className={`flex ${height} bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/50`}>
            {/* Main Chat */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header (if not compact) */}
                {!compact && (
                    <header className="flex-shrink-0 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/50 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-slate-900 dark:text-white font-bold text-sm">Pearto AI</span>
                            </div>
                            {messages.length > 0 && (
                                <button
                                    onClick={() => setMessages([])}
                                    className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded transition"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </header>
                )}

                {/* Messages */}
                <main className="flex-1 overflow-y-auto px-4 py-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            {/* Hero */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">What can I help you with?</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md">
                                Ask about stocks, compare assets, screen markets, run calculators, or get financial insights
                            </p>

                            {/* Quick Action Cards */}
                            {quickActions && quickActions.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 w-full max-w-lg mb-6">
                                    {quickActions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sendMessage(action.prompt)}
                                            className={`text-left p-3.5 rounded-xl bg-gradient-to-br ${action.gradient} border ${action.border} hover:scale-[1.02] transition-all duration-200 group`}
                                        >
                                            <div className={`${action.iconColor} mb-2`}>{action.icon}</div>
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">{action.title}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{action.description}</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Quick Prompts */}
                            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                                {[
                                    'AAPL stock price',
                                    'Compare TSLA vs RIVN',
                                    'SIP calculator',
                                    'Top gainers',
                                    'BTC price',
                                ].map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessage(prompt)}
                                        className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/30 rounded-full transition-all"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {messages.map(m => (
                                <MessageBubble key={m.id} message={m} onFollowUp={handleFollowUp} />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </main>

                {/* Input */}
                <div className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-slate-700/50">
                    {/* Clear chat button when messages exist */}
                    {compact && messages.length > 0 && (
                        <div className="flex justify-center mb-2">
                            <button
                                onClick={() => setMessages([])}
                                className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-full transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
                            >
                                <RefreshCw className="w-3 h-3" />
                                New conversation
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden focus-within:ring-1 focus-within:ring-emerald-500/50 transition-shadow">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={mode === 'deep-analysis' ? 'Ask for deep analysis...' : mode === 'quick' ? 'Quick question...' : 'Ask anything about stocks, crypto, markets...'}
                                className="w-full py-3 pl-4 pr-12 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm resize-none focus:outline-none min-h-[44px] max-h-[100px]"
                                disabled={isLoading}
                                rows={1}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center disabled:opacity-40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                            </button>
                        </div>
                    </form>
                    <div className="flex items-center justify-between mt-1.5 px-1">
                        <span className="text-[10px] text-slate-400">
                            {mode === 'deep-analysis' ? '🔬 Deep Analysis Mode' : mode === 'quick' ? '⚡ Quick Mode' : ''}
                        </span>
                        <span className="text-[10px] text-slate-500">
                            Shift+Enter for new line
                        </span>
                    </div>
                </div>
            </div>

            {/* Suggestions Sidebar */}
            {showSuggestions && (
                <aside className="hidden md:flex flex-col w-48 border-l border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30">
                    <div className="flex-shrink-0 px-3 py-2 border-b border-slate-200 dark:border-slate-700/50">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Suggestions</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {TOOL_CATEGORIES.map((cat, idx) => (
                            <SuggestionCategory key={idx} category={cat} onSelect={sendMessage} />
                        ))}
                    </div>
                    {!isPro && (
                        <div className="p-2 border-t border-slate-200 dark:border-slate-700/50">
                            <UsageLimitBanner
                                featureKey="ai_queries_limit"
                                featureLabel="AI Queries"
                                compact
                            />
                        </div>
                    )}
                </aside>
            )}

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                featureKey="ai_queries_limit"
            />
        </div>
    );
}

export default AIChat;
