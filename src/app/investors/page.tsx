'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users, Search, Trophy, Medal, Star, TrendingUp, Filter,
    UserCheck, BarChart2, Award
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { profilesApi, UserProfile, badgesApi } from '@/services/socialService';
import { useAuth } from '@/context/AuthContext';

const TRADING_STYLES: Record<string, { label: string; color: string }> = {
    day_trader: { label: 'Day Trader', color: 'bg-red-100 text-red-700' },
    swing_trader: { label: 'Swing Trader', color: 'bg-orange-100 text-orange-700' },
    long_term: { label: 'Long Term', color: 'bg-blue-100 text-blue-700' },
    value: { label: 'Value', color: 'bg-green-100 text-green-700' },
    growth: { label: 'Growth', color: 'bg-purple-100 text-purple-700' },
    dividend: { label: 'Dividend', color: 'bg-teal-100 text-teal-700' },
    mixed: { label: 'Mixed', color: 'bg-slate-100 text-slate-700' },
};

function InvestorCard({ profile }: { profile: UserProfile }) {
    const style = TRADING_STYLES[profile.tradingStyle] || TRADING_STYLES.mixed;

    return (
        <Link href={`/investors/${profile.publicUsername || profile.userId}`} className="block">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {profile.user?.avatarUrl ? (
                        <img src={profile.user.avatarUrl} alt={profile.user.name} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">{profile.user?.name?.charAt(0) || 'U'}</span>
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
                                {profile.user?.name || 'Anonymous'}
                            </h3>
                            {profile.user?.verifiedBadge && (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs">✓</span>
                            )}
                        </div>

                        {profile.publicUsername && (
                            <p className="text-sm text-emerald-500 mb-2">@{profile.publicUsername}</p>
                        )}

                        {profile.bio && (
                            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{profile.bio}</p>
                        )}

                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.color}`}>
                                {style.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{profile.followersCount}</div>
                        <div className="text-xs text-slate-500">Followers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{profile.ideasCount}</div>
                        <div className="text-xs text-slate-500">Ideas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{profile.likesReceived}</div>
                        <div className="text-xs text-slate-500">Likes</div>
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
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <Users className="text-purple-500" />
                                Discover Investors
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Find and follow top traders</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-3">
                                {/* Filters */}
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                        >
                                            <option value="followers">Most Followers</option>
                                            <option value="ideas">Most Ideas</option>
                                            <option value="likes">Most Liked</option>
                                        </select>

                                        <select
                                            value={styleFilter}
                                            onChange={(e) => setStyleFilter(e.target.value)}
                                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                        >
                                            <option value="">All Styles</option>
                                            <option value="day_trader">Day Traders</option>
                                            <option value="swing_trader">Swing Traders</option>
                                            <option value="long_term">Long Term</option>
                                            <option value="value">Value Investors</option>
                                            <option value="growth">Growth Investors</option>
                                            <option value="dividend">Dividend Investors</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Investors Grid */}
                                {loading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 animate-pulse">
                                                <div className="flex gap-4">
                                                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700" />
                                                    <div className="flex-1">
                                                        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : profiles.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No public profiles yet</h3>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {profiles.map((profile) => (
                                            <InvestorCard key={profile.id} profile={profile} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sidebar - Leaderboard */}
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sticky top-24">
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Trophy className="text-amber-500" />
                                        Points Leaderboard
                                    </h3>

                                    <div className="space-y-3">
                                        {leaderboard.map((user, i) => (
                                            <div key={user.userId} className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-500 text-white' :
                                                    i === 1 ? 'bg-slate-400 text-white' :
                                                        i === 2 ? 'bg-amber-700 text-white' :
                                                            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">{user.name?.charAt(0)}</span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{user.name}</div>
                                                    <div className="text-xs text-emerald-500">{user.points} pts</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Link href="/badges" className="block text-center text-sm text-emerald-500 hover:underline mt-4">
                                        View All Badges →
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
