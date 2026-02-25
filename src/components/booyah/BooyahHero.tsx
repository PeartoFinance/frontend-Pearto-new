'use client';

import { Sparkles, Zap, TrendingUp } from 'lucide-react';

export default function BooyahHero() {
    return (
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 dark:from-emerald-900 dark:via-teal-900 dark:to-slate-900 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full" />
                <div className="absolute top-20 right-20 w-48 h-48 border border-white/10 rounded-full" />
                <div className="absolute bottom-10 left-1/3 w-24 h-24 border border-white/15 rounded-full" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                            Booyah!
                        </h1>
                        <p className="text-emerald-100 text-sm font-medium">AI-Powered Stock Predictions</p>
                    </div>
                </div>

                <p className="text-white/80 max-w-2xl text-base leading-relaxed mb-6">
                    Get instant AI predictions on any stock, crypto, or asset. Our AI analyzes technical indicators,
                    market sentiment, and fundamentals to give you actionable buy/sell signals with confidence scores.
                </p>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span className="text-white text-xs font-medium">AI Analysis</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                        <TrendingUp className="w-4 h-4 text-emerald-300" />
                        <span className="text-white text-xs font-medium">Technical Signals</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                        <Zap className="w-4 h-4 text-cyan-300" />
                        <span className="text-white text-xs font-medium">Real-time Data</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
