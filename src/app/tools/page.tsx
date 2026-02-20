'use client';

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import ToolsGrid from '@/components/tools/ToolsGrid';
import { getEnabledTools, type ToolSetting } from '@/services/toolsService';
import { Wrench, Sparkles, CheckCircle2, Clock, LayoutGrid } from 'lucide-react';
import { AIWidget } from '@/components/ai';

export default function ToolsPage() {
    const [tools, setTools] = useState<ToolSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTools() {
            try {
                const data = await getEnabledTools();
                setTools(data);
            } catch (err) {
                console.error('Failed to fetch tools:', err);
                setError('Failed to load tools');
            } finally {
                setLoading(false);
            }
        }
        fetchTools();
    }, []);

    const readyCount = useMemo(() => tools.filter(t => t.is_implemented).length, [tools]);
    const categoriesCount = useMemo(() => new Set(tools.map(t => t.category)).size, [tools]);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                <div className="fixed top-0 right-0 left-0 md:left-[200px] z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="p-4 lg:p-6 space-y-6 max-w-full">
                        {/* Hero Section */}
                        <div className="relative rounded-2xl overflow-hidden">
                            {/* Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black" />
                            <div className="absolute inset-0">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
                                {/* Grid pattern */}
                                <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '32px 32px'}} />
                            </div>

                            <div className="relative px-6 py-8 md:px-10 md:py-10">
                                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                                    <div className="space-y-4 max-w-xl">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">Tools Suite</span>
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                            Tools & Calculators
                                        </h1>
                                        <p className="text-slate-400 text-[15px] leading-relaxed">
                                            Professional-grade calculators and planners for smarter financial decisions — investments, loans, taxes, and more.
                                        </p>
                                    </div>

                                    {/* Stats Cards */}
                                    {!loading && (
                                        <div className="flex gap-3">
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                                <div className="p-2 rounded-lg bg-emerald-500/15">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold text-white leading-none">{readyCount}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Ready</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                                <div className="p-2 rounded-lg bg-amber-500/15">
                                                    <Clock className="w-4 h-4 text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold text-white leading-none">{tools.length - readyCount}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Coming</p>
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                                <div className="p-2 rounded-lg bg-blue-500/15">
                                                    <LayoutGrid className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold text-white leading-none">{categoriesCount}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Categories</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                <p className="text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Tools Grid */}
                        <ToolsGrid tools={tools} loading={loading} />
                    </div>
                </div>
            </main>

            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="tools"
                quickPrompts={["Calculate SIP returns", "Calculate EMI"]}
            />
        </div>
    );
}
