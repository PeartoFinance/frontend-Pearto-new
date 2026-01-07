'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import ToolsGrid from '@/components/tools/ToolsGrid';
import { getEnabledTools, type ToolSetting } from '@/services/toolsService';
import { Calculator, Sparkles } from 'lucide-react';

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

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-950">
            {/* Sidebar - Desktop Only */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header Section - Always visible */}
                <div className="fixed top-0 right-0 left-0 md:left-[200px] z-40 bg-gray-50 dark:bg-neutral-950">
                    <TickerTape />
                    <Header />
                </div>

                {/* Scrollable Content - with top padding for fixed header */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="p-4 lg:p-6 space-y-6 max-w-full">
                        {/* Hero Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl" />
                            </div>

                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <Calculator className="w-7 h-7" />
                                    </div>
                                    <Sparkles className="w-5 h-5 text-yellow-300" />
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                                    Financial Tools & Calculators
                                </h1>
                                <p className="text-emerald-100 text-lg max-w-2xl">
                                    Interactive calculators and planners to help you make better financial decisions.
                                    From investment planning to loan calculations.
                                </p>

                                {!loading && (
                                    <div className="flex gap-4 mt-6">
                                        <span className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">
                                            {tools.length} Tools Available
                                        </span>
                                        <span className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">
                                            {tools.filter(t => t.is_implemented).length} Ready to Use
                                        </span>
                                    </div>
                                )}
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
        </div>
    );
}
