'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users, Search, Trophy, Medal, Star, TrendingUp, Filter,
    UserCheck, BarChart2, Award, ChevronDown, Rocket, Crown
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { profilesApi, UserProfile, badgesApi } from '@/services/socialService';
import { useAuth } from '@/context/AuthContext';

const TRADING_STYLES: Record<string, { label: string; color: string }> = {
    day_trader: { label: 'Day Trader', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
    swing_trader: { label: 'Swing Trader', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
    long_term: { label: 'Long Term', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
    value: { label: 'Value', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    growth: { label: 'Growth', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
    dividend: { label: 'Dividend', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
    mixed: { label: 'Mixed', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
};

function InvestorCard({ profile }: { profile: UserProfile }) {
    const style = TRADING_STYLES[profile.tradingStyle] || TRADING_STYLES.mixed;

    return (
        <Link href={`/investors/${profile.publicUsername || profile.userId}`} className="block group">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-2xl hover:shadow-cyan-500/5 dark:hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden h-full flex flex-col">

                {/* Glow effect on hover */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-start gap-4 mb-5 relative z-10">
                    {/* Avatar with Status Ring */}
                    <div className="relative">
                        {profile.user?.avatarUrl ? (
                            <img src={profile.user.avatarUrl} alt={profile.user.name} className="w-16 h-16 rounded-2xl object-cover shadow-md ring-4 ring-white dark:ring-slate-800 group-hover:ring-cyan-50 dark:group-hover:ring-cyan-900/30 transition-all" />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl shadow-md ring-4 ring-white dark:ring-slate-800 group-hover:ring-cyan-50 dark:group-hover:ring-cyan-900/30 transition-all bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-black text-2xl tracking-widest">{profile.user?.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                            </div>
                        )}
                        {profile.user?.verifiedBadge && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-sm ring-2 ring-white dark:ring-slate-800">
                                <UserCheck size={10} className="text-white" strokeWidth={3} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                {profile.user?.name || 'Anonymous'}
                            </h3>
                        </div>

                        {profile.publicUsername && (
                            <p className="text-sm text-cyan-500/80 dark:text-cyan-400/80 font-medium mb-2 truncate">@{profile.publicUsername}</p>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${style.color}`}>
                            {style.label}
                        </span>
                    </div>
                </div>

                {/* Bio */}
                <div className="flex-1 relative z-10 mb-6">
                    {profile.bio ? (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{profile.bio}</p>
                    ) : (
                        <p className="text-sm text-slate-400 dark:text-slate-500 italic">No bio provided.</p>
                    )}
                </div>

                {/* Modern Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mt-auto relative z-10">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800 group-hover:border-cyan-500/10 transition-colors">
                        <div className="text-xl font-black text-slate-900 dark:text-white mb-0.5">{profile.followersCount}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Followers</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800 group-hover:border-cyan-500/10 transition-colors">
                        <div className="text-xl font-black text-slate-900 dark:text-white mb-0.5">{profile.ideasCount}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ideas</div>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-3 text-center border border-cyan-100 dark:border-cyan-800/50 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/40 transition-colors">
                        <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 mb-0.5">{profile.likesReceived}</div>
                        <div className="text-[10px] uppercase font-bold text-cyan-600/70 dark:text-cyan-400/70 tracking-wider">Likes</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function InvestorsPage() {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('followers');
    const [styleFilter, setStyleFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [profilesRes, leaderboardRes] = await Promise.all([
                    profilesApi.list({ sort_by: sortBy, trading_style: styleFilter || undefined }),
                    badgesApi.getLeaderboard(5)
                ]);
                setProfiles(profilesRes.profiles);
                setLeaderboard(leaderboardRes.leaderboard);
            } catch (err) {
                console.error('Failed to fetch:', err);
            }
            setLoading(false);
        };
        fetchData();
    }, [sortBy, styleFilter]);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
                {/* Ambient Backgrounds */}
                <div className="absolute top-0 right-0 h-96 w-full bg-gradient-to-bl from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />
                <div className="absolute top-[-20rem] left-[-10rem] w-[50rem] h-[50rem] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px] relative z-10 max-w-[1400px] mx-auto w-full">
                    <div className="p-4 lg:p-8">

                        {/* Premium Hero Header Section */}
                        <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-8 lg:p-10 mb-8 relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/20 to-purple-500/20 blur-3xl rounded-full" />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-wide mb-4">
                                        <Rocket size={16} /> TRADER NETWORK
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                                        Top Investors
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                                        Find and follow expert traders, value investors, and community leaders. Learn from their strategies and market insights.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                            {/* Main Content Area */}
                            <div className="xl:col-span-3">

                                {/* Glassmorphic Filters */}
                                <div className="sticky top-[130px] z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-3 mb-8 shadow-sm">
                                    <div className="flex flex-wrap md:flex-nowrap items-center gap-3">

                                        <div className="w-full md:w-auto relative group">
                                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                <Filter size={16} className="text-slate-400" />
                                            </div>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="w-full appearance-none pl-10 pr-10 py-2.5 rounded-xl border-none bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm font-semibold focus:ring-2 focus:ring-cyan-500/50 cursor-pointer transition-colors hover:bg-slate-200/80 dark:hover:bg-slate-700/80"
                                            >
                                                <option value="followers">Most Followers</option>
                                                <option value="ideas">Most Ideas</option>
                                                <option value="likes">Most Liked</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-cyan-500 transition-colors" />
                                        </div>

                                        <div className="w-full md:w-auto relative group">
                                            <select
                                                value={styleFilter}
                                                onChange={(e) => setStyleFilter(e.target.value)}
                                                className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl w-[200px] border-none bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm font-semibold focus:ring-2 focus:ring-cyan-500/50 cursor-pointer transition-colors hover:bg-slate-200/80 dark:hover:bg-slate-700/80"
                                            >
                                                <option value="">All Trading Styles</option>
                                                <option value="day_trader">Day Traders</option>
                                                <option value="swing_trader">Swing Traders</option>
                                                <option value="long_term">Long Term</option>
                                                <option value="value">Value Investors</option>
                                                <option value="growth">Growth Investors</option>
                                                <option value="dividend">Dividend Investors</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-cyan-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                {/* Investors Grid */}
                                {loading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-6 animate-pulse h-[280px] flex flex-col">
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-200/80 dark:bg-slate-700/80" />
                                                    <div className="flex-1 mt-2">
                                                        <div className="h-5 w-32 bg-slate-200/80 dark:bg-slate-700/80 rounded mb-2" />
                                                        <div className="h-4 w-24 bg-slate-200/80 dark:bg-slate-700/80 rounded" />
                                                    </div>
                                                </div>
                                                <div className="mt-6 flex-1">
                                                    <div className="h-4 w-full bg-slate-200/80 dark:bg-slate-700/80 rounded mb-2" />
                                                    <div className="h-4 w-3/4 bg-slate-200/80 dark:bg-slate-700/80 rounded" />
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 mt-auto">
                                                    <div className="h-16 rounded-xl bg-slate-200/80 dark:bg-slate-700/80" />
                                                    <div className="h-16 rounded-xl bg-slate-200/80 dark:bg-slate-700/80" />
                                                    <div className="h-16 rounded-xl bg-slate-200/80 dark:bg-slate-700/80" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : profiles.length === 0 ? (
                                    <div className="text-center py-24 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-700/50">
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <Users size={32} className="text-slate-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">No profiles found</h3>
                                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">We couldn't find any public investor profiles matching your current filters.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {profiles.map((profile) => (
                                            <InvestorCard key={profile.id} profile={profile} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sticky Sidebar - Leaderboard */}
                            <div className="xl:col-span-1">
                                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-6 sticky top-[130px] shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <Crown size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-none">Leaderboard</h3>
                                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Top Points</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative">
                                        {leaderboard.map((user, i) => {
                                            const isTop3 = i < 3;
                                            const rankColors = [
                                                'bg-gradient-to-br from-amber-300 to-amber-600 text-amber-900 ring-2 ring-amber-400/30', // Gold
                                                'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 ring-2 ring-slate-400/30', // Silver
                                                'bg-gradient-to-br from-orange-300 to-amber-700 text-orange-950 ring-2 ring-orange-500/30', // Bronze
                                            ];
                                            const rankBg = isTop3 ? rankColors[i] : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400';

                                            return (
                                                <div key={user.userId} className={`flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isTop3 ? 'border border-slate-100 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/20 shadow-sm' : ''}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${rankBg}`}>
                                                        {i + 1}
                                                    </div>

                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 shadow-inner">
                                                            <span className="text-white text-sm font-bold tracking-wider">{user.name?.substring(0, 2).toUpperCase()}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.name}</div>
                                                        <div className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 inline-flex px-1.5 py-0.5 rounded mt-0.5">{user.points} pts</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <Link href="/badges" className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                                        View All Badges
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
