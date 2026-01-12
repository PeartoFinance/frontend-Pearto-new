'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Send, Sparkles, User, Loader2, RefreshCw, X,
    TrendingUp, Calculator, DollarSign, Cloud, Zap, ChevronRight
} from 'lucide-react';
import { post } from '@/services/api';
import { ToolResultCard } from './ToolResultCard';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    toolsUsed?: ToolExecution[];
    isStreaming?: boolean;
}

interface ToolExecution {
    tool: string;
    args: Record<string, unknown>;
    result: unknown;
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

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';
    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
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
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span>Thinking...</span>
                            </div>
                        ) : (
                            <>
                                {message.toolsUsed?.map((exec, idx) => (
                                    <ToolResultCard key={idx} tool={exec.tool} result={exec.result} />
                                ))}
                                {message.content && (
                                    <MarkdownRenderer content={message.content} compact className="text-slate-300" />
                                )}
                            </>
                        )}
                    </div>
                )}
                <div className="text-[10px] text-slate-600 mt-1">{message.timestamp.toLocaleTimeString()}</div>
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
    /** Initial context for AI (page type, data) */
    context?: { pageType?: string; pageData?: unknown };
    /** Show suggestions sidebar */
    showSuggestions?: boolean;
    /** Compact mode (no header) */
    compact?: boolean;
    /** Height of chat container */
    height?: string;
    /** Initial prompt to auto-send */
    initialPrompt?: string;
}

export function AIChat({
    context,
    showSuggestions = true,
    compact = false,
    height = 'h-[500px]',
    initialPrompt
}: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 100) + 'px';
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
            isStreaming: true
        }]);

        try {
            const response = await post<{ success: boolean; response: string; toolsUsed?: ToolExecution[] }>('/ai/chat-with-tools', {
                message: messageText.trim(),
                history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
                enableTools: true,
                context: context
            });

            setMessages(prev => prev.map(m =>
                m.id === streamingId
                    ? { ...m, content: response.response || '', isStreaming: false, toolsUsed: response.toolsUsed || [] }
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

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <div className={`flex ${height} bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50`}>
            {/* Main Chat */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header (if not compact) */}
                {!compact && (
                    <header className="flex-shrink-0 bg-slate-800/80 border-b border-slate-700/50 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white font-bold text-sm">Pearto AI</span>
                            </div>
                            {messages.length > 0 && (
                                <button
                                    onClick={() => setMessages([])}
                                    className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition"
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
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">How can I help?</h3>
                            <p className="text-slate-500 text-sm">Ask about stocks, crypto, calculators...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map(m => <MessageBubble key={m.id} message={m} />)}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </main>

                {/* Input */}
                <div className="flex-shrink-0 p-3 border-t border-slate-700/50">
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 overflow-hidden">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything..."
                                className="w-full py-2.5 pl-4 pr-10 bg-transparent text-white placeholder:text-slate-500 text-sm resize-none focus:outline-none min-h-[40px] max-h-[80px]"
                                disabled={isLoading}
                                rows={1}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 bottom-2 w-7 h-7 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center disabled:opacity-50 transition"
                            >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Send className="w-3.5 h-3.5 text-white" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Suggestions Sidebar */}
            {showSuggestions && (
                <aside className="hidden md:flex flex-col w-48 border-l border-slate-700/50 bg-slate-800/30">
                    <div className="flex-shrink-0 px-3 py-2 border-b border-slate-700/50">
                        <span className="text-xs font-semibold text-slate-400">Suggestions</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {TOOL_CATEGORIES.map((cat, idx) => (
                            <SuggestionCategory key={idx} category={cat} onSelect={sendMessage} />
                        ))}
                    </div>
                </aside>
            )}
        </div>
    );
}

export default AIChat;
