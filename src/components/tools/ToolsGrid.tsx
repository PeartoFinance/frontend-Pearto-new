'use client';

import { useState, useMemo, useRef } from 'react';
import { Search, Grid3X3, List, Sparkles, Clock, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import ToolCard from './ToolCard';
import type { ToolSetting } from '@/services/toolsService';

interface ToolsGridProps {
    tools: ToolSetting[];
    loading?: boolean;
}

// Category accent dot colors
const categoryAccents: Record<string, string> = {
    'Finance': 'bg-emerald-500', 'Finance & Loans': 'bg-blue-500', 'Investing': 'bg-blue-500',
    'Insurance': 'bg-purple-500', 'Taxation': 'bg-amber-500', 'Utilities': 'bg-cyan-500',
    'Health': 'bg-rose-500', 'Health & Fitness': 'bg-rose-500', 'Health & Medical': 'bg-red-500',
    'Retirement': 'bg-indigo-500', 'Savings': 'bg-green-500', 'Debt': 'bg-red-500',
    'Real Estate': 'bg-orange-500', 'Portfolio': 'bg-teal-500', 'Portfolio Analysis': 'bg-teal-500',
    'Trading': 'bg-violet-500', 'Personal Finance': 'bg-cyan-500', 'Business': 'bg-slate-500',
    'Business Operations': 'bg-zinc-500', 'Business Strategy': 'bg-violet-500',
    'Education': 'bg-blue-500', 'Education & Study': 'bg-sky-500', 'Travel': 'bg-cyan-500',
    'Cooking & Recipes': 'bg-orange-500', 'Marketing': 'bg-pink-500', 'SEO': 'bg-orange-500',
    'E-commerce': 'bg-emerald-500', 'Legal': 'bg-stone-500', 'Gaming': 'bg-fuchsia-500',
    'Fun & Entertainment': 'bg-lime-500', 'Design': 'bg-pink-500', 'Writing': 'bg-amber-500',
    'Data & Code': 'bg-slate-500', 'Security': 'bg-yellow-500', 'Productivity': 'bg-green-500',
    'Content': 'bg-cyan-500', 'Weather & Astronomy': 'bg-sky-500', 'Sustainability': 'bg-green-500',
    'Income & Employment': 'bg-blue-500', 'Family & Goals': 'bg-pink-500', 'Startup': 'bg-violet-500',
    'Project Management': 'bg-indigo-500', 'Wellness': 'bg-teal-500', 'Math & Science': 'bg-blue-500',
    'Entertainment': 'bg-fuchsia-500',
};

function getDotColor(category: string) {
    return categoryAccents[category] || 'bg-slate-500';
}

export default function ToolsGrid({ tools, loading }: ToolsGridProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showImplemented, setShowImplemented] = useState<'all' | 'ready' | 'coming'>('all');
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
    const [showAllCategories, setShowAllCategories] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) next.delete(category);
            else next.add(category);
            return next;
        });
    };

    const categories = useMemo(() => {
        const catCounts: Record<string, number> = { 'All': tools.length };
        tools.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
        return Object.entries(catCounts).sort(([a], [b]) => {
            if (a === 'All') return -1;
            if (b === 'All') return 1;
            return a.localeCompare(b);
        });
    }, [tools]);

    const filteredTools = useMemo(() => {
        return tools.filter(tool => {
            const q = search.toLowerCase();
            const matchesSearch = !q || tool.tool_name.toLowerCase().includes(q) ||
                tool.category.toLowerCase().includes(q) || tool.tool_slug.toLowerCase().includes(q);
            const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
            const matchesStatus = showImplemented === 'all' ||
                (showImplemented === 'ready' && tool.is_implemented) ||
                (showImplemented === 'coming' && !tool.is_implemented);
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [tools, search, selectedCategory, showImplemented]);

    const groupedTools = useMemo(() => {
        const groups: Record<string, ToolSetting[]> = {};
        filteredTools.forEach(tool => {
            if (!groups[tool.category]) groups[tool.category] = [];
            groups[tool.category].push(tool);
        });
        return groups;
    }, [filteredTools]);

    const implementedCount = tools.filter(t => t.is_implemented).length;
    const comingCount = tools.length - implementedCount;

    const visibleCategories = useMemo(() => {
        if (showAllCategories) return categories;
        return categories.slice(0, 9);
    }, [categories, showAllCategories]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 animate-pulse">
                    <div className="h-11 bg-slate-100 dark:bg-slate-700 rounded-xl" />
                    <div className="mt-4 flex gap-2">
                        {[1,2,3,4,5].map(i => <div key={i} className="h-8 w-20 bg-slate-100 dark:bg-slate-700 rounded-full" />)}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-5 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
                                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full mb-2" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Search & Filters */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search tools by name or category..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 
                                    bg-slate-50 dark:bg-slate-900/50 
                                    focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 
                                    transition-all placeholder:text-slate-400"
                            />
                            {search && (
                                <button
                                    onClick={() => { setSearch(''); searchRef.current?.focus(); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                >
                                    <X className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Status Filter */}
                            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-900/50">
                                {(['all', 'ready', 'coming'] as const).map(status => {
                                    const active = showImplemented === status;
                                    const label = status === 'all' ? 'All' : status === 'ready' ? `Ready (${implementedCount})` : `Coming (${comingCount})`;
                                    const Icon = status === 'ready' ? Sparkles : status === 'coming' ? Clock : null;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setShowImplemented(status)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all
                                                ${active
                                                    ? status === 'coming' ? 'bg-amber-500 text-white shadow-sm' : 'bg-emerald-500 text-white shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            {Icon && <Icon size={12} />}
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* View Toggle */}
                            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-900/50">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Grid3X3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex flex-wrap gap-1.5">
                            {visibleCategories.map(([cat, count]) => {
                                const isActive = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                            ${isActive
                                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                                                : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {cat !== 'All' && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : getDotColor(cat)}`} />
                                        )}
                                        {cat}
                                        <span className={`${isActive ? 'text-white/60 dark:text-slate-900/50' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                            {categories.length > 9 && (
                                <button
                                    onClick={() => setShowAllCategories(!showAllCategories)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                                        text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                                >
                                    <SlidersHorizontal className="w-3 h-3" />
                                    {showAllCategories ? 'Show less' : `+${categories.length - 9} more`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredTools.length}</span>{' '}
                    {filteredTools.length === 1 ? 'tool' : 'tools'}
                    {selectedCategory !== 'All' && (
                        <> in <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedCategory}</span>
                            <button onClick={() => setSelectedCategory('All')} className="ml-1.5 text-slate-400 hover:text-red-500 transition">
                                <X className="w-3 h-3 inline" />
                            </button>
                        </>
                    )}
                </p>
            </div>

            {/* Empty State */}
            {filteredTools.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/50">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-7 h-7 text-slate-300 dark:text-slate-500" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No tools found</p>
                    <p className="text-sm text-slate-500 mt-1.5 mb-4">Try adjusting your search or filters</p>
                    <button
                        onClick={() => { setSearch(''); setSelectedCategory('All'); setShowImplemented('all'); }}
                        className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Grid View */}
            {filteredTools.length > 0 && viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTools.map(tool => (
                        <ToolCard key={tool.tool_slug} tool={tool} />
                    ))}
                </div>
            )}

            {/* List View - Grouped */}
            {filteredTools.length > 0 && viewMode === 'list' && (
                <div className="space-y-3">
                    {Object.entries(groupedTools).sort(([a], [b]) => a.localeCompare(b)).map(([category, categoryTools]) => {
                        const isCollapsed = collapsedCategories.has(category);
                        return (
                            <div key={category} className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden">
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2 h-2 rounded-full ${getDotColor(category)}`} />
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{category}</h3>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium tabular-nums">{categoryTools.length}</span>
                                    </div>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
                                </button>
                                {!isCollapsed && (
                                    <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {categoryTools.map(tool => (
                                            <ToolCard key={tool.tool_slug} tool={tool} compact />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
