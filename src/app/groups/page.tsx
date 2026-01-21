'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users, TrendingUp, Bitcoin, Globe, MessageSquare, Plus, Search,
    Lock, Globe2, UserPlus
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
    options: TrendingUp,
    general: MessageSquare,
};

const CATEGORY_COLORS: Record<string, string> = {
    stocks: 'from-blue-500 to-indigo-500',
    crypto: 'from-amber-500 to-orange-500',
    forex: 'from-emerald-500 to-teal-500',
    options: 'from-purple-500 to-pink-500',
    general: 'from-slate-500 to-slate-600',
};

function GroupCard({ group }: { group: DiscussionGroup }) {
    const Icon = CATEGORY_ICONS[group.category] || MessageSquare;
    const gradient = CATEGORY_COLORS[group.category] || CATEGORY_COLORS.general;

    return (
        <Link href={`/groups/${group.slug || group.id}`} className="block">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                {/* Cover */}
                <div className={`h-24 bg-gradient-to-br ${gradient} relative`}>
                    {group.coverUrl && (
                        <img src={group.coverUrl} alt="" className="w-full h-full object-cover absolute inset-0" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Icon */}
                <div className="relative -mt-8 px-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800`}>
                        {group.iconUrl ? (
                            <img src={group.iconUrl} alt="" className="w-10 h-10 rounded-lg" />
                        ) : (
                            <Icon size={28} className="text-white" />
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{group.name}</h3>
                        {group.groupType === 'private' && <Lock size={14} className="text-slate-400" />}
                    </div>

                    {group.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{group.description}</p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-slate-500">
                            <span className="flex items-center gap-1">
                                <Users size={14} />
                                {group.membersCount} members
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare size={14} />
                                {group.postsCount} posts
                            </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${gradient} text-white`}>
                            {group.category}
                        </span>
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
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <Users className="text-cyan-500" />
                                    Discussion Groups
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">Join communities and discuss investments</p>
                            </div>
                            {isAuthenticated && (
                                <Link
                                    href="/groups/new"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow hover:shadow-lg transition"
                                >
                                    <Plus size={20} />
                                    Create Group
                                </Link>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => setActiveTab('discover')}
                                    className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'discover'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <Globe2 size={16} className="inline mr-2" />
                                    Discover
                                </button>
                                <button
                                    onClick={() => setActiveTab('my')}
                                    className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'my'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <UserPlus size={16} className="inline mr-2" />
                                    My Groups
                                </button>
                            </div>

                            {/* Category Filter */}
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                            >
                                <option value="">All Categories</option>
                                <option value="stocks">Stocks</option>
                                <option value="crypto">Crypto</option>
                                <option value="forex">Forex</option>
                                <option value="options">Options</option>
                                <option value="general">General</option>
                            </select>

                            {/* Search */}
                            <div className="relative ml-auto">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search groups..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm w-48"
                                />
                            </div>
                        </div>

                        {/* Groups Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden animate-pulse">
                                        <div className="h-24 bg-slate-200 dark:bg-slate-700" />
                                        <div className="p-4">
                                            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : displayGroups.length === 0 ? (
                            <div className="text-center py-16">
                                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {activeTab === 'my' ? 'You haven\'t joined any groups' : 'No groups found'}
                                </h3>
                                <p className="text-slate-500 mb-6">
                                    {activeTab === 'my' ? 'Discover and join groups to start discussions!' : 'Try a different search or category'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
