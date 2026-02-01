'use client';

import { useState, useMemo } from 'react';
import { Search, Grid3X3, List, Sparkles, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import ToolCard from './ToolCard';
import type { ToolSetting } from '@/services/toolsService';

interface ToolsGridProps {
    tools: ToolSetting[];
    loading?: boolean;
}

// Category colors for pills
const categoryColors: Record<string, string> = {
    'All': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200',
    'Finance': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200',
    'Investing': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200',
    'Insurance': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200',
    'Taxation': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200',
    'Utilities': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-200',
    'Health': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-200',
    'Retirement': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200',
    'Savings': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200',
    'Debt': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200',
    'Real Estate': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200',
    'Portfolio': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-200',
    'Trading': 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 hover:bg-violet-200',
};

export default function ToolsGrid({ tools, loading }: ToolsGridProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showImplemented, setShowImplemented] = useState<'all' | 'ready' | 'coming'>('all');
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    // Get unique categories with counts
    const categories = useMemo(() => {
        const catCounts: Record<string, number> = { 'All': tools.length };
        tools.forEach(t => {
            catCounts[t.category] = (catCounts[t.category] || 0) + 1;
        });
        return Object.entries(catCounts).sort(([a], [b]) => {
            if (a === 'All') return -1;
            if (b === 'All') return 1;
            return a.localeCompare(b);
        });
    }, [tools]);

    // Filter tools
    const filteredTools = useMemo(() => {
        return tools.filter(tool => {
            const matchesSearch =
                tool.tool_name.toLowerCase().includes(search.toLowerCase()) ||
                tool.category.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
            const matchesImplemented =
                showImplemented === 'all' ||
                (showImplemented === 'ready' && tool.is_implemented) ||
                (showImplemented === 'coming' && !tool.is_implemented);
            return matchesSearch && matchesCategory && matchesImplemented;
        });
    }, [tools, search, selectedCategory, showImplemented]);

    // Group by category
    const groupedTools = useMemo(() => {
        const groups: Record<string, ToolSetting[]> = {};
        filteredTools.forEach(tool => {
            if (!groups[tool.category]) groups[tool.category] = [];
            groups[tool.category].push(tool);
        });
        return groups;
    }, [filteredTools]);

    // Stats
    const implementedCount = tools.filter(t => t.is_implemented).length;
    const comingCount = tools.length - implementedCount;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500/30 border-t-emerald-500" />
                <p className="text-slate-500">Loading tools...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search & Filters Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <button
                                onClick={() => setShowImplemented('all')}
                                className={`px-4 py-2.5 text-sm font-medium transition ${showImplemented === 'all'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setShowImplemented('ready')}
                                className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 transition ${showImplemented === 'ready'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                <Sparkles size={14} /> Ready ({implementedCount})
                            </button>
                            <button
                                onClick={() => setShowImplemented('coming')}
                                className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 transition ${showImplemented === 'coming'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                <Clock size={14} /> Coming ({comingCount})
                            </button>
                        </div>

                        {/* View Toggle */}
                        <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 transition ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'}`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 border-l border-slate-200 dark:border-slate-700 transition ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                        {categories.map(([cat, count]) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                                    : categoryColors[cat] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                {cat}
                                <span className={`ml-1.5 ${selectedCategory === cat ? 'text-emerald-100' : 'opacity-60'}`}>
                                    {count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Stats */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                    Showing <strong className="text-slate-900 dark:text-white">{filteredTools.length}</strong> tools
                    {selectedCategory !== 'All' && (
                        <> in <strong className="text-emerald-600">{selectedCategory}</strong></>
                    )}
                </span>
            </div>

            {/* No Results */}
            {filteredTools.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No tools found</p>
                    <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
                </div>
            )}

            {/* Tools Grid */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredTools.map(tool => (
                        <ToolCard key={tool.tool_slug} tool={tool} />
                    ))}
                </div>
            ) : (
                /* List View - Grouped by Category with Collapsible Sections */
                <div className="space-y-4">
                    {Object.entries(groupedTools).sort(([a], [b]) => a.localeCompare(b)).map(([category, categoryTools]) => {
                        const isCollapsed = collapsedCategories.has(category);
                        const categoryColor = categoryColors[category] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';

                        return (
                            <div key={category} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                {/* Category Header - Clickable to Toggle */}
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {category}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                                            {categoryTools.length} tools
                                        </span>
                                    </div>
                                    {isCollapsed ? (
                                        <ChevronDown size={20} className="text-slate-400" />
                                    ) : (
                                        <ChevronUp size={20} className="text-slate-400" />
                                    )}
                                </button>

                                {/* Category Tools - Collapsible */}
                                {!isCollapsed && (
                                    <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
                                        {categoryTools.map(tool => (
                                            <ToolCard key={tool.tool_slug} tool={tool} />
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
