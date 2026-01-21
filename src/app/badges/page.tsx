'use client';

import { useState, useEffect } from 'react';
import {
    Award, Trophy, Star, Target, TrendingUp, Users, MessageSquare,
    Zap, Shield, Crown, Medal, Gem, Lock
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { badgesApi, Badge, UserBadge } from '@/services/socialService';
import { useAuth } from '@/context/AuthContext';

const BADGE_ICONS: Record<string, any> = {
    first_trade: Target,
    ten_trades: TrendingUp,
    first_idea: MessageSquare,
    popular_idea: Star,
    verified: Shield,
    top_contributor: Crown,
    mentor: Users,
    streak: Zap,
    whale: Gem,
    default: Award,
};

const TIER_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
    bronze: { bg: 'bg-amber-900/20', border: 'border-amber-700', icon: 'text-amber-600' },
    silver: { bg: 'bg-slate-300/20', border: 'border-slate-400', icon: 'text-slate-400' },
    gold: { bg: 'bg-amber-400/20', border: 'border-amber-400', icon: 'text-amber-400' },
    platinum: { bg: 'bg-cyan-400/20', border: 'border-cyan-400', icon: 'text-cyan-400' },
    diamond: { bg: 'bg-purple-400/20', border: 'border-purple-400', icon: 'text-purple-400' },
};

function BadgeCard({ badge, earned, earnedAt }: { badge: Badge; earned: boolean; earnedAt?: string }) {
    const Icon = BADGE_ICONS[badge.slug] || BADGE_ICONS.default;
    const tier = TIER_STYLES[badge.tier] || TIER_STYLES.bronze;

    return (
        <div className={`relative rounded-xl border-2 p-5 transition-all ${earned
            ? `${tier.bg} ${tier.border} hover:shadow-lg`
            : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
            }`}>
            {!earned && (
                <div className="absolute top-2 right-2">
                    <Lock size={16} className="text-slate-400" />
                </div>
            )}

            <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${earned ? tier.bg : 'bg-slate-200 dark:bg-slate-700'
                    }`}>
                    {badge.iconUrl ? (
                        <img src={badge.iconUrl} alt="" className="w-10 h-10" />
                    ) : (
                        <Icon size={28} className={earned ? tier.icon : 'text-slate-400'} />
                    )}
                </div>

                <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${earned ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                        }`}>
                        {badge.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{badge.description}</p>

                    <div className="flex items-center gap-3 mt-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${earned
                            ? `${tier.bg} ${tier.icon}`
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}>
                            {badge.tier}
                        </span>
                        <span className="text-sm text-emerald-500 font-medium">+{badge.pointsAwarded} pts</span>
                    </div>

                    {earned && earnedAt && (
                        <p className="text-xs text-slate-400 mt-2">
                            Earned {new Date(earnedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BadgesPage() {
    const { isAuthenticated, user } = useAuth();
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [myBadges, setMyBadges] = useState<UserBadge[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [badgesRes, leaderboardRes] = await Promise.all([
                    badgesApi.list(),
                    badgesApi.getLeaderboard(10)
                ]);
                setAllBadges(badgesRes.badges);
                setLeaderboard(leaderboardRes.leaderboard);

                if (isAuthenticated && user?.id) {
                    const myRes = await badgesApi.getUserBadges(Number(user.id));
                    setMyBadges(myRes.badges);
                }
            } catch (err) {
                console.error('Failed to fetch badges:', err);
            }
            setLoading(false);
        };
        fetchData();
    }, [isAuthenticated, user]);

    const earnedBadgeIds = new Set(myBadges.map(ub => String(ub.badgeId)));

    const filteredBadges = allBadges.filter(badge => {
        if (filter === 'earned') return earnedBadgeIds.has(String(badge.id));
        if (filter === 'locked') return !earnedBadgeIds.has(String(badge.id));
        return true;
    });

    const totalPoints = myBadges.reduce((sum, ub) => {
        const badge = allBadges.find(b => String(b.id) === String(ub.badgeId));
        return sum + (badge?.pointsAwarded || 0);
    }, 0);

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
                                <Award className="text-amber-500" />
                                Achievement Badges
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Earn badges and climb the leaderboard</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-3">
                                {/* Stats */}
                                {isAuthenticated && (
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 text-white">
                                            <div className="text-3xl font-bold">{myBadges.length}</div>
                                            <div className="text-amber-100 text-sm">Badges Earned</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl p-4 text-white">
                                            <div className="text-3xl font-bold">{totalPoints}</div>
                                            <div className="text-emerald-100 text-sm">Total Points</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                                            <div className="text-3xl font-bold">{allBadges.length - myBadges.length}</div>
                                            <div className="text-purple-100 text-sm">Badges to Unlock</div>
                                        </div>
                                    </div>
                                )}

                                {/* Filter */}
                                <div className="flex items-center gap-2 mb-6">
                                    {(['all', 'earned', 'locked'] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            {f === 'all' ? 'All Badges' : f === 'earned' ? 'Earned' : 'Locked'}
                                        </button>
                                    ))}
                                </div>

                                {/* Badges Grid */}
                                {loading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 animate-pulse">
                                                <div className="flex gap-4">
                                                    <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700" />
                                                    <div className="flex-1">
                                                        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredBadges.map((badge) => {
                                            const userBadge = myBadges.find(ub => ub.badgeId === badge.id);
                                            return (
                                                <BadgeCard
                                                    key={badge.id}
                                                    badge={badge}
                                                    earned={!!userBadge}
                                                    earnedAt={userBadge?.createdAt}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Leaderboard Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sticky top-24">
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Trophy className="text-amber-500" />
                                        Top Achievers
                                    </h3>

                                    <div className="space-y-3">
                                        {leaderboard.map((entry, i) => (
                                            <div key={entry.userId} className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-500 text-white' :
                                                    i === 1 ? 'bg-slate-400 text-white' :
                                                        i === 2 ? 'bg-amber-700 text-white' :
                                                            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                                {entry.avatarUrl ? (
                                                    <img src={entry.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">{entry.name?.charAt(0)}</span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{entry.name}</div>
                                                    <div className="text-xs text-emerald-500">{entry.points} pts</div>
                                                </div>
                                                <Medal size={16} className={
                                                    i === 0 ? 'text-amber-500' :
                                                        i === 1 ? 'text-slate-400' :
                                                            i === 2 ? 'text-amber-700' : 'text-slate-300'
                                                } />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
