'use client';

import { useState, useMemo } from 'react';
import { Search, Grid3X3, List } from 'lucide-react';
import ToolCard from './ToolCard';
import type { ToolSetting } from '@/services/toolsService';

interface ToolsGridProps {
    tools: ToolSetting[];
    loading?: boolean;
}

export default function ToolsGrid({ tools, loading }: ToolsGridProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(tools.map(t => t.category));
        return ['All', ...Array.from(cats).sort()];
    }, [tools]);

    // Filter tools
    const filteredTools = useMemo(() => {
        return tools.filter(tool => {
            const matchesSearch =
                tool.tool_name.toLowerCase().includes(search.toLowerCase()) ||
                tool.category.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [tools, search, selectedCategory]);

    // Group by category
    const groupedTools = useMemo(() => {
        const groups: Record<string, ToolSetting[]> = {};
        filteredTools.forEach(tool => {
            if (!groups[tool.category]) groups[tool.category] = [];
            groups[tool.category].push(tool);
        });
        return groups;
    }, [filteredTools]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                </div>

                <div className="flex items-center gap-3">
                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'}`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
                <span className="px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                    {filteredTools.length} Tools
                </span>
                <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium">
                    {categories.length - 1} Categories
                </span>
            </div>

            {/* No Results */}
            {filteredTools.length === 0 && (
                <div className="text-center py-16">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No tools found matching your search</p>
                </div>
            )}

            {/* Tools Grid */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTools.map(tool => (
                        <ToolCard key={tool.tool_slug} tool={tool} />
                    ))}
                </div>
            ) : (
                /* List View - Grouped by Category */
                <div className="space-y-8">
                    {Object.entries(groupedTools).sort(([a], [b]) => a.localeCompare(b)).map(([category, categoryTools]) => (
                        <div key={category}>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                {category}
                                <span className="text-sm font-normal text-slate-500">({categoryTools.length})</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {categoryTools.map(tool => (
                                    <ToolCard key={tool.tool_slug} tool={tool} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
