'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    User, Award, TrendingUp, MessageSquare, Calendar, MapPin,
    UserPlus, UserCheck, Send, ExternalLink, Share2, Activity, Shield, Edit3, Link as LinkIcon, FileText,
    Target, Clock, Eye, Heart, MessageCircle, ArrowRight
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import PriceDisplay from '@/components/common/PriceDisplay';
import { profilesApi, UserProfile, followApi, ideasApi, TradingIdea, badgesApi, UserBadge } from '@/services/socialService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Footer from '@/components/layout/Footer';

const TRADING_STYLES: Record<string, { label: string; color: string; bg: string }> = {
    day_trader: { label: 'Day Trader', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' },
    swing_trader: { label: 'Swing Trader', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
    long_term: { label: 'Long Term', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
    value: { label: 'Value Investor', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    growth: { label: 'Growth Investor', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
    dividend: { label: 'Dividend Investor', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' },
    mixed: { label: 'Mixed Strategy', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
};

function IdeaCard({ idea }: { idea: TradingIdea }) {
    const getBadgeStyle = (type: string) => {
        switch (type) {
            case 'long': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'short': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
            case 'analysis': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'education': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
        }
    };

    return (
        <Link href={`/ideas/${idea.id}`} className="block group h-full">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:border-emerald-500/50 hover:shadow-md transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase border ${getBadgeStyle(idea.ideaType)}`}>
                            {idea.ideaType}
                        </span>
                        {idea.symbol && (
                            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-600 uppercase">
                                {idea.symbol}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2">
                        {idea.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                        {idea.content}
                    </p>

                    {(idea.entryPrice || idea.targetPrice) && (
                        <div className="flex gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            {idea.entryPrice && (
                                <div className="flex-1">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Entry</div>
                                    <div className="font-bold text-slate-900 dark:text-white"><PriceDisplay amount={parseFloat(idea.entryPrice.toString())} /></div>
                                </div>
                            )}
                            {idea.targetPrice && (
                                <div className="flex-1">
                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold mb-1 flex items-center gap-1">
                                        <Target size={12} /> Target
                                    </div>
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400"><PriceDisplay amount={parseFloat(idea.targetPrice.toString())} /></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5"><Heart size={14} className={idea.likesCount > 0 ? 'text-emerald-500 fill-emerald-500/20' : ''} /> {idea.likesCount}</span>
                        <span className="flex items-center gap-1.5"><MessageCircle size={14} /> {idea.commentsCount}</span>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
                </div>
            </div>
        </Link>
    );
}

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
                setProfile(prev => prev ? { ...prev, followersCount: prev.followersCount - 1 } : null);
            } else {
                await followApi.follow(profile.userId);
                setIsFollowing(true);
                setProfile(prev => prev ? { ...prev, followersCount: prev.followersCount + 1 } : null);
            }
        } catch (err) {
            console.error('Follow action failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px] p-4 lg:p-8 animate-pulse">
                        <div className="max-w-6xl mx-auto">
                            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl mb-8" />
                            <div className="flex flex-col md:flex-row gap-8 mt-12">
                                <div className="w-full md:w-1/3 space-y-4">
                                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-48 mb-6" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  <Footer />
      </main>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px] flex items-center justify-center p-4">
                        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-md">
                            <User size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Profile Not Found</h2>
                            <p className="text-slate-500 mb-6">The user you're looking for doesn't exist or has been removed.</p>
                            <Link href="/investors" className="inline-block px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors">
                                Back to Investors
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const styleInfo = TRADING_STYLES[profile.tradingStyle] || TRADING_STYLES.mixed;
    const isOwnProfile = user?.id !== undefined && Number(user.id) === profile.userId;

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] pb-12">

                    {/* Simple Solid Cover Section */}
                    <div className="max-w-6xl mx-auto px-4 lg:px-8">
                        <div className="h-48 md:h-56 w-full rounded-3xl overflow-hidden bg-emerald-600 relative">
                            {/* Subtle pattern instead of blurry heavy glass */}
                            <div className="absolute inset-0 bg-black/10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto px-4 lg:px-8 -mt-20 relative z-20">
                        <div className="flex flex-col md:flex-row gap-8">

                            {/* Profile Card Sidebar */}
                            <div className="w-full md:w-[320px] flex-shrink-0">
                                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sticky top-[140px]">

                                    {/* Avatar */}
                                    <div className="relative w-32 h-32 mx-auto -mt-16 mb-4">
                                        <div className="w-full h-full rounded-2xl border-4 border-white dark:border-slate-800 overflow-hidden bg-emerald-50 dark:bg-slate-700 flex items-center justify-center shadow-md">
                                            {profile.user?.avatarUrl ? (
                                                <img src={profile.user.avatarUrl} alt={profile.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-emerald-500 dark:text-emerald-400 text-4xl font-bold">{profile.user?.name?.charAt(0) || 'U'}</span>
                                            )}
                                        </div>
                                        {profile.user?.verifiedBadge && (
                                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1.5 border-4 border-white dark:border-slate-800">
                                                <UserCheck size={16} className="text-white" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="text-center mb-6">
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                            {profile.user?.name || 'Anonymous User'}
                                        </h1>
                                        {profile.publicUsername && (
                                            <p className="text-slate-500 dark:text-slate-400 mb-3">@{profile.publicUsername}</p>
                                        )}

                                        {styleInfo && (
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded border text-xs font-semibold ${styleInfo.color} ${styleInfo.bg}`}>
                                                {styleInfo.label}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mb-8">
                                        {isOwnProfile ? (
                                            <Link href="/settings" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium rounded-xl transition-colors">
                                                <Edit3 size={16} /> Edit Profile
                                            </Link>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleFollow}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-medium rounded-xl transition-colors ${isFollowing
                                                        ? 'bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                                                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                                        }`}
                                                >
                                                    {isFollowing ? (
                                                        <><UserCheck size={16} /> Following</>
                                                    ) : (
                                                        <><UserPlus size={16} /> Follow</>
                                                    )}
                                                </button>
                                                <Link
                                                    href={`/messages?user=${profile.userId}`}
                                                    className="w-11 flex items-center justify-center bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                                                >
                                                    <Send size={16} />
                                                </Link>
                                            </>
                                        )}
                                        <button
                                            onClick={async () => {
                                                const url = window.location.href;
                                                if (navigator.share) {
                                                    await navigator.share({ title: `${profile.user?.name || profile.publicUsername || 'Investor'}`, url });
                                                } else {
                                                    await navigator.clipboard.writeText(url);
                                                    toast.success('Link copied!');
                                                }
                                            }}
                                            className="w-11 flex items-center justify-center bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                    </div>

                                    {/* Stats List */}
                                    <div className="flex flex-col gap-3 mb-6">
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                            <span className="text-sm font-medium text-slate-500">Followers</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{profile.followersCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                            <span className="text-sm font-medium text-slate-500">Following</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{profile.followingCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50">
                                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500">Likes</span>
                                            <span className="font-bold text-emerald-700 dark:text-emerald-400">{profile.likesReceived}</span>
                                        </div>
                                    </div>

                                    {/* About Links */}
                                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        {(profile as any).location && (
                                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                <MapPin size={16} className="text-slate-400" />
                                                <span>{(profile as any).location}</span>
                                            </div>
                                        )}
                                        {(profile as any).websiteUrl && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <LinkIcon size={16} className="text-emerald-500" />
                                                <a href={(profile as any).websiteUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline truncate">
                                                    {(profile as any).websiteUrl.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <Calendar size={16} className="text-slate-400" />
                                            <span>Joined {new Date((profile as any).createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 space-y-6 lg:mt-6">

                                {/* Bio */}
                                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About</h3>
                                    {profile.bio ? (
                                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{profile.bio}</p>
                                    ) : (
                                        <p className="text-slate-400 italic">This user hasn't added a bio yet.</p>
                                    )}
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => setActiveTab('ideas')}
                                        className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'ideas'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        <Activity size={16} /> Trading Ideas
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('badges')}
                                        className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'badges'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        <Shield size={16} /> Earned Badges
                                    </button>
                                </div>

                                {/* Tab Panels */}
                                <div className="pt-2">
                                    {activeTab === 'ideas' && (
                                        <div>
                                            {ideas.length === 0 ? (
                                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                                                    <Activity size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Trading Ideas</h3>
                                                    <p className="text-slate-500">This investor hasn't published anything yet.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {ideas.map((idea) => (
                                                        <IdeaCard key={idea.id} idea={idea} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'badges' && (
                                        <div>
                                            {badges.length === 0 ? (
                                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                                                    <Shield size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Badges Yet</h3>
                                                    <p className="text-slate-500">This investor hasn't earned any achievement badges.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {badges.map((userBadge) => (
                                                        <div key={userBadge.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-4">
                                                            {userBadge.badge?.iconUrl ? (
                                                                <img src={userBadge.badge.iconUrl} alt={userBadge.badge.name} className="w-16 h-16 object-contain drop-shadow" />
                                                            ) : (
                                                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-400">
                                                                    <Award size={24} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{userBadge.badge?.name}</h4>
                                                                <p className="text-xs text-slate-500 line-clamp-2">{userBadge.badge?.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
