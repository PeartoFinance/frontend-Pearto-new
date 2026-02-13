'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Lightbulb, TrendingUp, TrendingDown, Minus, Heart, MessageCircle,
    Eye, Filter, Plus, ChevronDown, Clock, Flame, Users, Search
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { ideasApi, TradingIdea } from '@/services/socialService';
import PriceDisplay from '@/components/common/PriceDisplay';

const IDEA_TYPE_STYLES = {
    long: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: TrendingUp },
    short: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: TrendingDown },
    neutral: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-400', icon: Minus },
};

function IdeaCard({ idea }: { idea: TradingIdea }) {
    const typeStyle = IDEA_TYPE_STYLES[idea.ideaType] || IDEA_TYPE_STYLES.neutral;
    const TypeIcon = typeStyle.icon;

    return (
        <Link href={`/ideas/${idea.id}`} className="block">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    {idea.author?.avatarUrl ? (
                        <img src={idea.author.avatarUrl} alt={idea.author.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{idea.author?.name?.charAt(0) || 'U'}</span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">{idea.author?.name || 'Anonymous'}</span>
                            {idea.author?.verifiedBadge && (
                                <span className="text-emerald-500 text-xs">✓</span>
                            )}
                        </div>
                        <div className="text-xs text-slate-500">{new Date(idea.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${typeStyle.bg} ${typeStyle.text}`}>
                        <TypeIcon size={14} />
                        <span className="uppercase">{idea.ideaType}</span>
                    </div>
                </div>

                {/* Symbol badge */}
                {idea.symbol && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-mono mb-3">
                        <span className="font-bold text-slate-900 dark:text-white">{idea.symbol}</span>
                    </div>
                )}

                {/* Title & Content */}
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2">{idea.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4">{idea.content}</p>

                {/* Price targets */}
                {(idea.targetPrice || idea.stopLoss) && (
                    <div className="flex gap-4 text-xs mb-4">
                        {idea.entryPrice && (
                            <div>
                                <span className="text-slate-500">Entry:</span>
                                <span className="ml-1 font-semibold text-slate-700 dark:text-slate-300"><PriceDisplay amount={idea.entryPrice} /></span>
                            </div>
                        )}
                        {idea.targetPrice && (
                            <div>
                                <span className="text-slate-500">Target:</span>
                                <span className="ml-1 font-semibold text-emerald-600"><PriceDisplay amount={idea.targetPrice} /></span>
                            </div>
                        )}
                        {idea.stopLoss && (
                            <div>
                                <span className="text-slate-500">Stop:</span>
                                <span className="ml-1 font-semibold text-red-600"><PriceDisplay amount={idea.stopLoss} /></span>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <Heart size={16} className={idea.likesCount > 0 ? 'text-red-400' : ''} />
                        {idea.likesCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <MessageCircle size={16} />
                        {idea.commentsCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Eye size={16} />
                        {idea.viewsCount}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<TradingIdea[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('newest');
    const [typeFilter, setTypeFilter] = useState('');
    const [symbolFilter, setSymbolFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const fetchIdeas = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, sort_by: sortBy };
            if (typeFilter) params.type = typeFilter;
            if (symbolFilter) params.symbol = symbolFilter;

            const res = await ideasApi.list(params);
            setIdeas(res.ideas);
            setTotalPages(res.pages);
        } catch (err) {
            console.error('Failed to fetch ideas:', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchIdeas(); }, [page, sortBy, typeFilter]);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="p-4 lg:p-6">
                        {/* Page Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <Lightbulb className="text-amber-500" />
                                    Trading Ideas
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">Discover and share investment insights</p>
                            </div>
                            <Link
                                href="/ideas/new"
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow hover:shadow-lg transition"
                            >
                                <Plus size={20} />
                                Share Idea
                            </Link>
                        </div>

                        {/* Filters Bar */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Sort */}
                                <div className="flex items-center gap-2">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="popular">Most Liked</option>
                                        <option value="comments">Most Discussed</option>
                                        <option value="views">Most Viewed</option>
                                    </select>
                                </div>

                                {/* Type Filter */}
                                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                    {['', 'long', 'short', 'neutral'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setTypeFilter(type)}
                                            className={`px-3 py-2 text-sm font-medium transition ${typeFilter === type
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            {type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* Symbol Search */}
                                <div className="flex items-center gap-2 ml-auto">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Filter by symbol..."
                                            value={symbolFilter}
                                            onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === 'Enter' && fetchIdeas()}
                                            className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-40"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ideas Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                                            <div className="flex-1">
                                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                                            </div>
                                        </div>
                                        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                                        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : ideas.length === 0 ? (
                            <div className="text-center py-16">
                                <Lightbulb size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No ideas yet</h3>
                                <p className="text-slate-500 mb-6">Be the first to share your trading insight!</p>
                                <Link
                                    href="/ideas/new"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl"
                                >
                                    <Plus size={20} />
                                    Share Your First Idea
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {ideas.map((idea) => (
                                        <IdeaCard key={idea.id} idea={idea} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-10 h-10 rounded-lg font-medium transition ${page === p
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
