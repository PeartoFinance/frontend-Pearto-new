'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { AIChat } from './AIChat';

interface AISidepanelProps {
    /** Whether the panel is open */
    isOpen: boolean;
    /** Function to toggle the panel */
    onToggle: () => void;
    /** Page context to pass to AI */
    pageType?: string;
    /** Page data to provide context */
    pageData?: unknown;
    /** Initial prompt to auto-send */
    initialPrompt?: string;
}

export function AISidepanel({
    isOpen,
    onToggle,
    pageType = 'general',
    pageData,
    initialPrompt
}: AISidepanelProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onToggle();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onToggle]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
                onClick={onToggle}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className={`fixed right-0 top-0 bottom-0 z-[70] bg-slate-900 border-l border-slate-700/50 shadow-2xl transition-all duration-300 ${isMinimized ? 'w-16' : 'w-full sm:w-96 lg:w-[420px]'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        {!isMinimized && (
                            <div>
                                <span className="text-white font-bold text-sm">Pearto AI</span>
                                <p className="text-[10px] text-slate-400">Financial Assistant</p>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition hidden lg:flex"
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={onToggle}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {!isMinimized && (
                    <div className="h-[calc(100%-56px)]">
                        <AIChat
                            context={{ pageType, pageData }}
                            showSuggestions={false}
                            compact={true}
                            height="h-full"
                            initialPrompt={initialPrompt}
                        />
                    </div>
                )}

                {/* Minimized state */}
                {isMinimized && (
                    <div className="flex flex-col items-center py-4 gap-4">
                        <button
                            onClick={() => setIsMinimized(false)}
                            className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white transition"
                        >
                            <Sparkles className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default AISidepanel;
