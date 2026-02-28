'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Lightbulb, TrendingUp, TrendingDown, Minus, Heart, MessageCircle,
    Eye, Filter, Plus, ChevronDown, Clock, Flame, Users, Search, Target, Shield, ArrowRight
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { ideasApi, TradingIdea } from '@/services/socialService';
import PriceDisplay from '@/components/common/PriceDisplay';
import Footer from '@/components/layout/Footer';

const IDEA_TYPE_STYLES = {
    long: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', border: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400', icon: TrendingUp },
    short: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', border: 'border-rose-500/20 text-rose-600 dark:text-rose-400', icon: TrendingDown },
    neutral: { bg: 'bg-slate-500/10 dark:bg-slate-500/20', border: 'border-slate-500/20 text-slate-600 dark:text-slate-400', icon: Minus },
};

function IdeaCard({ idea }: { idea: TradingIdea }) {
    const typeStyle = IDEA_TYPE_STYLES[idea.ideaType] || IDEA_TYPE_STYLES.neutral;
    const TypeIcon = typeStyle.icon;

    return (
        <Link href={`/ideas/${idea.id}`} className="block group">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 hover:shadow-2xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden h-full flex flex-col">

                {/* Glow effect on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Header */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        {idea.author?.avatarUrl ? (
                            <img src={idea.author.avatarUrl} alt={idea.author.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                        ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-sm">
                                <span className="text-white font-bold text-sm tracking-widest">{idea.author?.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900 dark:text-white text-sm hover:text-emerald-500 transition-colors">{idea.author?.name || 'Anonymous'}</span>
                                {idea.author?.verifiedBadge && (
                                    <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[10px] shadow-sm shadow-emerald-500/30">✓</span>
                                )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(idea.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 mb-4 relative z-10 font-mono">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeStyle.bg} ${typeStyle.border}`}>
                        <TypeIcon size={14} strokeWidth={3} />
                        <span className="tracking-wider">{idea.ideaType.toUpperCase()}</span>
                    </div>
                    {idea.symbol && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600/50">
                            {idea.symbol}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 relative z-10">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">{idea.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed">{idea.content}</p>
                </div>

                {/* Price targets display */}
                {(idea.targetPrice || idea.stopLoss) && (
                    <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 relative z-10">
                        {idea.entryPrice && (
                            <div className="col-span-2 flex items-center justify-between text-xs mb-1 bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-lg">
                                <span className="text-slate-500 font-medium">Entry Setup</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300"><PriceDisplay amount={idea.entryPrice} /></span>
                            </div>
                        )}
                        {idea.targetPrice && (
                            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <div className="text-[10px] uppercase font-bold text-emerald-600/70 dark:text-emerald-400/70 flex items-center gap-1">
                                    <Target size={12} /> Target
                                </div>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm"><PriceDisplay amount={idea.targetPrice} /></span>
                            </div>
                        )}
                        {idea.stopLoss && (
                            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                                <div className="text-[10px] uppercase font-bold text-rose-600/70 dark:text-rose-400/70 flex items-center gap-1">
                                    <Shield size={12} /> Stop Loss
                                </div>
                                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm"><PriceDisplay amount={idea.stopLoss} /></span>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Metrics */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-slate-500 relative z-10">
                    <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                            <Heart size={16} className={idea.likesCount > 0 ? 'text-rose-500 fill-rose-500/20' : ''} />
                            {idea.likesCount}
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                            <MessageCircle size={16} />
                            {idea.commentsCount}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Eye size={16} />
                            {idea.viewsCount}
                        </span>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
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
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
                {/* Background Ambient Glows */}
                <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
                <div className="absolute top-[-10rem] right-[-10rem] w-[40rem] h-[40rem] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px] relative z-10 max-w-7xl mx-auto w-full">
                    <div className="p-4 lg:p-8">

                        {/* Premium Hero Header Section */}
                        <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-8 mb-8 relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-3xl rounded-full" />

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold tracking-wide mb-4">
                                        <Lightbulb size={16} className="text-amber-500" /> COMMUNITY ALPHA
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                                        Trading Ideas
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
                                        Discover actionable market insights, technical setups, and unique investment perspectives from top traders in our community.
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <Link
                                        href="/ideas/new"
                                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                                        <Plus size={20} className="transition-transform group-hover:rotate-90" />
                                        Share Insight
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Glassmorphic Filters Bar */}
                        <div className="sticky top-[130px] z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-3 mb-8 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">

                                {/* Refined Sort Dropdown */}
                                <div className="relative group min-w-[160px]">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border-none bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition-colors hover:bg-slate-200/80 dark:hover:bg-slate-700/80"
                                    >
                                        <option value="newest">Latest Setups</option>
                                        <option value="popular">Most Liked</option>
                                        <option value="comments">Most Discussed</option>
                                        <option value="views">Most Viewed</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-amber-500 transition-colors" />
                                </div>

                                {/* Premium Pill Tabs for Type Filter */}
                                <div className="flex p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 overflow-x-auto hide-scrollbar">
                                    {[
                                        { id: '', label: 'All Ideas', icon: Flame },
                                        { id: 'long', label: 'Long', icon: TrendingUp },
                                        { id: 'short', label: 'Short', icon: TrendingDown },
                                        { id: 'neutral', label: 'Neutral', icon: Minus }
                                    ].map((tab) => {
                                        const isActive = typeFilter === tab.id;
                                        const TabIcon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setTypeFilter(tab.id)}
                                                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${isActive
                                                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <TabIcon size={14} className={isActive ? 'text-emerald-500' : ''} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Modern Search Input */}
                                <div className="relative md:ml-auto flex-1 md:max-w-xs">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by ticker (e.g. AAPL)..."
                                        value={symbolFilter}
                                        onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchIdeas()}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-slate-100/80 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/50 transition-shadow"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ideas Grid Feed */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-5 animate-pulse min-h-[300px] flex flex-col">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-11 h-11 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                                            <div className="flex-1">
                                                <div className="h-4 w-28 bg-slate-200/80 dark:bg-slate-700/80 rounded mb-2" />
                                                <div className="h-3 w-16 bg-slate-200/80 dark:bg-slate-700/80 rounded" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mb-6">
                                            <div className="h-6 w-16 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                                            <div className="h-6 w-16 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                                        </div>
                                        <div className="h-6 w-3/4 bg-slate-200/80 dark:bg-slate-700/80 rounded mb-4" />
                                        <div className="h-4 w-full bg-slate-200/80 dark:bg-slate-700/80 rounded mb-2" />
                                        <div className="h-4 w-5/6 bg-slate-200/80 dark:bg-slate-700/80 rounded mb-auto" />
                                        <div className="h-10 w-full mt-6 bg-slate-200/80 dark:bg-slate-700/80 rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        ) : ideas.length === 0 ? (
                            <div className="text-center py-24 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-700/50">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Lightbulb size={32} className="text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">No active insights</h3>
                                <p className="text-slate-500 mb-8 max-w-sm mx-auto">It's quiet in the market right now. Be the first to share your technical analysis or investment thesis.</p>
                                <Link
                                    href="/ideas/new"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    <Plus size={20} />
                                    Publish Market Insight
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {ideas.map((idea) => (
                                        <IdeaCard key={idea.id} idea={idea} />
                                    ))}
                                </div>

                                {/* Modern Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-12 pb-8">
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-12 h-12 rounded-xl font-bold transition-all ${page === p
                                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 dark:shadow-white/20 -translate-y-1'
                                                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
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
              <Footer />
      </main>
        </div>
    );
}
