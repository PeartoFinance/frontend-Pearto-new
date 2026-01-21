'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    User, Award, TrendingUp, MessageSquare, Calendar, MapPin,
    UserPlus, UserCheck, Send, ExternalLink, Share2
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { profilesApi, UserProfile, followApi, ideasApi, TradingIdea, badgesApi, UserBadge } from '@/services/socialService';
import { useAuth } from '@/context/AuthContext';

const TRADING_STYLES: Record<string, { label: string; color: string }> = {
    day_trader: { label: 'Day Trader', color: 'bg-red-500' },
    swing_trader: { label: 'Swing Trader', color: 'bg-orange-500' },
    long_term: { label: 'Long Term', color: 'bg-blue-500' },
    value: { label: 'Value Investor', color: 'bg-green-500' },
    growth: { label: 'Growth Investor', color: 'bg-purple-500' },
    dividend: { label: 'Dividend Investor', color: 'bg-teal-500' },
    mixed: { label: 'Mixed', color: 'bg-slate-500' },
};

export default function InvestorProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const { isAuthenticated, user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [ideas, setIdeas] = useState<TradingIdea[]>([]);
    const [badges, setBadges] = useState<UserBadge[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ideas' | 'badges'>('ideas');

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await profilesApi.getPublic(username);
                setProfile(res.profile);

                if (res.profile.userId) {
                    const [ideasRes, badgesRes] = await Promise.all([
                        ideasApi.list({}),
                        badgesApi.getUserBadges(res.profile.userId)
                    ]);
                    // Filter ideas by user
                    setIdeas(ideasRes.ideas.filter((idea: TradingIdea) => idea.userId === res.profile.userId));
                    setBadges(badgesRes.badges);

                    if (isAuthenticated) {
                        const followRes = await followApi.checkStatus(res.profile.userId);
                        setIsFollowing(followRes.isFollowing);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [username, isAuthenticated]);

    const handleFollow = async () => {
        if (!profile?.userId) return;
        try {
            if (isFollowing) {
                await followApi.unfollow(profile.userId);
                setIsFollowing(false);
            } else {
                await followApi.follow(profile.userId);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error('Follow action failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px]">
                        <div className="p-4 lg:p-6 animate-pulse">
                            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6" />
                            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                            <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px] flex items-center justify-center">
                        <div className="text-center">
                            <User size={64} className="mx-auto text-slate-300 mb-4" />
                            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Profile not found</h2>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const style = TRADING_STYLES[profile.tradingStyle] || TRADING_STYLES.mixed;
    const isOwnProfile = user?.id !== undefined && Number(user.id) === profile.userId;

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
                    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
                        {/* Cover & Profile Header */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                            {/* Cover - reduced height */}
                            <div className="h-32 bg-gradient-to-br from-emerald-500 via-cyan-500 to-purple-500 relative">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                            </div>

                            {/* Profile Info */}
                            <div className="px-6 py-4">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Avatar */}
                                    {profile.user?.avatarUrl ? (
                                        <img
                                            src={profile.user.avatarUrl}
                                            alt={profile.user.name}
                                            className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 object-cover shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                            <span className="text-white font-bold text-3xl">{profile.user?.name?.charAt(0) || 'U'}</span>
                                        </div>
                                    )}

                                    <div className="flex-1 md:pb-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {profile.user?.name || 'Anonymous'}
                                            </h1>
                                            {profile.user?.verifiedBadge && (
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white">✓</span>
                                            )}
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${style.color}`}>
                                                {style.label}
                                            </span>
                                        </div>
                                        {profile.publicUsername && (
                                            <p className="text-emerald-500 font-medium mt-1">@{profile.publicUsername}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        {isOwnProfile ? (
                                            <Link
                                                href="/profile"
                                                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                                            >
                                                Edit Profile
                                            </Link>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleFollow}
                                                    className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition ${isFollowing
                                                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                        }`}
                                                >
                                                    {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                                                    {isFollowing ? 'Following' : 'Follow'}
                                                </button>
                                                <Link
                                                    href={`/messages?user=${profile.userId}`}
                                                    className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 transition"
                                                >
                                                    <Send size={20} />
                                                </Link>
                                            </>
                                        )}
                                        <button className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 transition">
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Bio */}
                                {profile.bio && (
                                    <p className="text-slate-600 dark:text-slate-400 mt-4 max-w-2xl">{profile.bio}</p>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-6 mt-4 text-sm">
                                    <div>
                                        <span className="font-bold text-slate-900 dark:text-white">{profile.followersCount}</span>
                                        <span className="text-slate-500 ml-1">Followers</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 dark:text-white">{profile.followingCount}</span>
                                        <span className="text-slate-500 ml-1">Following</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 dark:text-white">{profile.ideasCount}</span>
                                        <span className="text-slate-500 ml-1">Ideas</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-emerald-500">{profile.likesReceived}</span>
                                        <span className="text-slate-500 ml-1">Likes</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 mb-6 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                            <button
                                onClick={() => setActiveTab('ideas')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'ideas'
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <MessageSquare size={16} className="inline mr-2" />
                                Ideas ({ideas.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('badges')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'badges'
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Award size={16} className="inline mr-2" />
                                Badges ({badges.length})
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'ideas' ? (
                            ideas.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">No trading ideas shared yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {ideas.map((idea) => (
                                        <Link key={idea.id} href={`/ideas/${idea.id}`}>
                                            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${idea.ideaType === 'long' ? 'bg-emerald-100 text-emerald-700' :
                                                        idea.ideaType === 'short' ? 'bg-red-100 text-red-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {idea.ideaType.toUpperCase()}
                                                    </span>
                                                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{idea.symbol}</span>
                                                </div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{idea.title}</h3>
                                                <p className="text-sm text-slate-500 line-clamp-2">{idea.content}</p>
                                                <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                                                    <span>{idea.likesCount} likes</span>
                                                    <span>{idea.commentsCount} comments</span>
                                                    <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )
                        ) : (
                            badges.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <Award size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">No badges earned yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {badges.map((ub) => (
                                        <div key={ub.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                    <Award size={24} className="text-amber-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 dark:text-white">{ub.badge?.name}</h4>
                                                    <p className="text-sm text-slate-500">{ub.badge?.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
