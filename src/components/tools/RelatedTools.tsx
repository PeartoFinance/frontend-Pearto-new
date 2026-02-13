'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Wrench, Calculator, LineChart, Cpu, Zap } from 'lucide-react';
import { toolsMeta, ToolMeta } from '@/data/tools';
import { getEnabledTools, ToolSetting } from '@/services/toolsService';

interface RelatedToolsProps {
    category: string; // e.g., 'Investing', 'Utilities', 'Crypto'
    title?: string;
    limit?: number;
    layout?: 'grid' | 'list' | 'sidebar';
    className?: string;
}

export default function RelatedTools({
    category,
    title = 'Related Tools',
    limit = 4,
    layout = 'list',
    className = ''
}: RelatedToolsProps) {
    const [tools, setTools] = useState<(ToolSetting & ToolMeta)[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTools = async () => {
            try {
                // Fetch enabled tools from backend using service
                const enabledTools = await getEnabledTools();

                // Filter by category and merge with metadata
                const relevantTools = enabledTools
                    .filter(tool =>
                        // Match category strictly or partially (e.g. "Investing" matches "Investing" or "Crypto/Investing")
                        tool.category.toLowerCase().includes(category.toLowerCase()) ||
                        (category.toLowerCase() === 'investing' && tool.category === 'Finance & Loans') // Broaden investing to include finance
                    )
                    .map(tool => {
                        const meta = toolsMeta[tool.tool_slug];
                        return meta ? { ...tool, ...meta } : undefined;
                    })
                    .filter((item): item is (ToolSetting & ToolMeta) => !!item)
                    .slice(0, limit);

                if (relevantTools.length === 0 && category.toLowerCase() === 'utilities') {
                    const fallbackSlugs = ['currency-converter', 'unit-converter', 'percentage', 'age-calculator'];
                    const fallbackTools = fallbackSlugs
                        .map(slug => {
                            const meta = toolsMeta[slug];
                            if (!meta) return undefined;
                            return {
                                ...meta,
                                tool_slug: slug,
                                tool_name: meta.name,
                                category: meta.category,
                                enabled: true,
                                country_code: 'US',
                                order_index: 0,
                                is_implemented: true
                            } as ToolSetting & ToolMeta;
                        })
                        .filter((item): item is (ToolSetting & ToolMeta) => !!item);

                    setTools(fallbackTools);
                } else {
                    setTools(relevantTools);
                }
            } catch (err) {
                console.error('Error loading related tools:', err);
                // On error, also try fallback for utilities
                if (category.toLowerCase() === 'utilities') {
                    const fallbackSlugs = ['currency-converter', 'unit-converter', 'percentage', 'age-calculator'];
                    const fallbackTools = fallbackSlugs.map(slug => {
                        const meta = toolsMeta[slug];
                        if (!meta) return undefined;
                        return {
                            ...meta,
                            tool_slug: slug,
                            tool_name: meta.name,
                            category: meta.category,
                            enabled: true,
                            country_code: 'US',
                            order_index: 0,
                            is_implemented: true
                        } as ToolSetting & ToolMeta;
                    }).filter((item): item is (ToolSetting & ToolMeta) => !!item);

                    setTools(fallbackTools);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTools();
    }, [category, limit]);

    if (loading) {
        return (
            <div className={`animate-pulse space-y-3 ${className}`}>
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="space-y-2">
                    {[...Array(limit)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (tools.length === 0) return null;

    // determine Icon based on category if needed, or use tool specific logic
    const getIcon = (toolCategory: string) => {
        if (toolCategory.includes('Crypto')) return Cpu;
        if (toolCategory.includes('Investing')) return LineChart;
        if (toolCategory.includes('Utilities')) return Zap;
        return Calculator;
    };

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wrench size={16} className="text-emerald-500" />
                    {title}
                </h3>
                <Link href="/tools" className="text-xs font-medium text-emerald-600 hover:text-emerald-500 flex items-center gap-1">
                    View All <ArrowRight size={12} />
                </Link>
            </div>

            <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 p-4' : 'divide-y divide-slate-100 dark:divide-slate-700/50'}>
                {tools.map((tool) => {
                    const Icon = getIcon(tool.category);

                    return (
                        <Link
                            key={tool.slug}
                            href={`/tools/${tool.slug}`}
                            className={`group flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${layout === 'grid' ? 'bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800' : ''
                                }`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                                <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                                    {tool.name}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                    {tool.description}
                                </p>
                            </div>
                            {layout !== 'grid' && (
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors self-center" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
