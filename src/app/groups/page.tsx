'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users, TrendingUp, Bitcoin, Globe, MessageSquare, Plus, Search,
    Lock, Globe2, UserPlus, ArrowRight, Activity
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { groupsApi, DiscussionGroup } from '@/services/socialService';
import { useAuth } from '@/context/AuthContext';

const CATEGORY_ICONS: Record<string, any> = {
    stocks: TrendingUp,
    crypto: Bitcoin,
    forex: Globe,
    options: Activity,
    general: MessageSquare,
};

const CATEGORY_COLORS: Record<string, string> = {
    stocks: 'from-blue-500 to-indigo-600',
    crypto: 'from-amber-400 to-orange-600',
    forex: 'from-emerald-400 to-teal-600',
    options: 'from-purple-500 to-pink-600',
    general: 'from-slate-600 to-slate-800',
};

function GroupCard({ group }: { group: DiscussionGroup }) {
    const Icon = CATEGORY_ICONS[group.category] || MessageSquare;
    const gradient = CATEGORY_COLORS[group.category] || CATEGORY_COLORS.general;

    return (
        <Link href={`/groups/${group.slug || group.id}`} className="block group">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 flex flex-col h-full transform hover:-translate-y-1">

                {/* Cover High-impact Area */}
                <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                    {group.coverUrl && (
                        <img src={group.coverUrl} alt="" className="w-full h-full object-cover absolute inset-0 opacity-80 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Floating Privacy Badge */}
                    {group.groupType === 'private' && (
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-white/10">
                            <Lock size={12} className="text-white/80" />
                            <span className="text-[10px] text-white font-bold uppercase tracking-wider">Private</span>
                        </div>
                    )}
                </div>

                {/* Floating Icon Base */}
                <div className="relative -mt-10 px-6 flex justify-between items-end">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl border-[6px] border-white dark:border-slate-800 relative z-10 group-hover:-translate-y-2 transition-transform duration-500`}>
                        {group.iconUrl ? (
                            <img src={group.iconUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                        ) : (
                            <Icon size={32} className="text-white drop-shadow-md" />
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-tight group-hover:text-emerald-500 transition-colors">
                            {group.name}
                        </h3>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6 flex-1">
                        {group.description || <span className="italic opacity-70">No description provided.</span>}
                    </p>

                    {/* Footer Metrics */}
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                <Users size={14} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{group.membersCount}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                <MessageSquare size={14} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{group.postsCount}</span>
                            </div>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowRight size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function GroupsPage() {
    const { isAuthenticated } = useAuth();
    const [groups, setGroups] = useState<DiscussionGroup[]>([]);
    const [myGroups, setMyGroups] = useState<DiscussionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'discover' | 'my'>('discover');

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);
            try {
                const params: Record<string, any> = {};
                if (category) params.category = category;
                if (search) params.search = search;

                const res = await groupsApi.list(params);
                setGroups(res.groups);

                if (isAuthenticated) {
                    const myRes = await groupsApi.getMyGroups();
                    setMyGroups(myRes.groups);
                }
            } catch (err) {
                console.error('Failed to fetch groups:', err);
            }
            setLoading(false);
        };
        fetchGroups();
    }, [category, isAuthenticated]);

    const displayGroups = activeTab === 'my' ? myGroups : groups;

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
                {/* Background Ambient Glows */}
                <div className="absolute top-0 right-0 h-96 w-full bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
                <div className="absolute top-[20%] right-[-10rem] w-[40rem] h-[40rem] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

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
                            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl rounded-full" />

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold tracking-wide mb-4">
                                        <Globe2 size={16} /> COMMUNITY HUBS
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                                        Discussion Groups
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                                        Join specialized communities, engage in deep market analysis, and collaborate with like-minded investors.
                                    </p>
                                </div>
                                {isAuthenticated && (
                                    <div className="flex-shrink-0">
                                        <Link
                                            href="/groups/new"
                                            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                                            <Plus size={20} className="transition-transform group-hover:rotate-90" />
                                            Create Hub
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Glassmorphic Filters Bar with Pill Tabs */}
                        <div className="sticky top-[130px] z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-3 mb-8 shadow-sm">
                            <div className="flex flex-col xl:flex-row xl:items-center gap-4">

                                {/* Sliding Pill Tabs */}
                                <div className="flex p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl relative">
                                    <button
                                        onClick={() => setActiveTab('discover')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 z-10 ${activeTab === 'discover'
                                            ? 'text-white'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        <Globe2 size={16} />
                                        Discover
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('my')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 z-10 ${activeTab === 'my'
                                            ? 'text-white'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        <UserPlus size={16} />
                                        My Groups
                                    </button>

                                    {/* Sliding Background */}
                                    <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-900 dark:bg-emerald-600 rounded-lg shadow-sm transition-transform duration-300 ease-in-out ${activeTab === 'my' ? 'translate-x-full left-auto right-1' : 'translate-x-0 left-1'}`} />
                                </div>

                                {/* Category Pills */}
                                <div className="flex p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 overflow-x-auto hide-scrollbar flex-1">
                                    {[
                                        { id: '', label: 'All', icon: Globe },
                                        { id: 'stocks', label: 'Stocks', icon: TrendingUp },
                                        { id: 'crypto', label: 'Crypto', icon: Bitcoin },
                                        { id: 'forex', label: 'Forex', icon: Globe2 },
                                        { id: 'options', label: 'Options', icon: Activity },
                                        { id: 'general', label: 'General', icon: MessageSquare }
                                    ].map((cat) => {
                                        const isActive = category === cat.id;
                                        const CatIcon = cat.icon;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCategory(cat.id)}
                                                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${isActive
                                                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <CatIcon size={14} className={isActive ? 'text-emerald-500' : ''} />
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Search Input */}
                                <div className="relative xl:w-64">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search hubs..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-slate-100/80 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/50 transition-shadow"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Groups Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl overflow-hidden animate-pulse border border-slate-200/50 dark:border-slate-700/50 h-[320px] flex flex-col">
                                        <div className="h-32 bg-slate-200/80 dark:bg-slate-700/80" />
                                        <div className="px-6 -mt-10 mb-4">
                                            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800" />
                                        </div>
                                        <div className="px-6 flex-1 flex flex-col">
                                            <div className="h-5 w-3/4 bg-slate-200/80 dark:bg-slate-700/80 rounded mb-4" />
                                            <div className="h-4 w-full bg-slate-200/80 dark:bg-slate-700/80 rounded mb-2" />
                                            <div className="h-4 w-5/6 bg-slate-200/80 dark:bg-slate-700/80 rounded" />

                                            <div className="mt-auto flex gap-4">
                                                <div className="h-8 w-16 bg-slate-200/80 dark:bg-slate-700/80 rounded-lg" />
                                                <div className="h-8 w-16 bg-slate-200/80 dark:bg-slate-700/80 rounded-lg" />
                                            </div>
                                        </div>
                                        <div className="h-6" />
                                    </div>
                                ))}
                            </div>
                        ) : displayGroups.length === 0 ? (
                            <div className="text-center py-24 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-700/50">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Users size={32} className="text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                                    {activeTab === 'my' ? 'No active hub memberships' : 'No hubs found'}
                                </h3>
                                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                    {activeTab === 'my' ? 'Explore the community to discover and join hubs that match your investment interests.' : 'We couldn\'t find any discussion groups matching your current search or category filters.'}
                                </p>
                                {activeTab === 'my' && (
                                    <button
                                        onClick={() => setActiveTab('discover')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
                                    >
                                        <Globe2 size={20} />
                                        Discover Hubs
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {displayGroups.map((group) => (
                                    <GroupCard key={group.id} group={group} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
