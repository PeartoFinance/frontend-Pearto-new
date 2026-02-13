'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getFullProfile, type ProfileData, type UserProfile } from '@/services/userService';
import { getWatchlist, type WatchlistItem } from '@/services/portfolioService';
import Header from '@/components/layout/Header';
import TickerTape from '@/components/layout/TickerTape';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSettings from '@/components/profile/ProfileSettings';
import ProfileVerification from '@/components/profile/ProfileVerification';
import ProfilePreferences from '@/components/profile/ProfilePreferences';
import ProfileSecurity from '@/components/profile/ProfileSecurity';
import ProfilePortfolio from '@/components/profile/ProfilePortfolio';
import ProfileWatchlist from '@/components/profile/ProfileWatchlist';
import ProfileAlerts from '@/components/profile/ProfileAlerts';
import ProfileActivity from '@/components/profile/ProfileActivity';
import ProfileDocuments from '@/components/profile/ProfileDocuments';
import ProfileInsights from '@/components/profile/ProfileInsights';
import ProfileReferrals from '@/components/profile/ProfileReferrals';
import ProfileNotifications from '@/components/profile/ProfileNotifications';
import ProfileSubscription from '@/components/profile/ProfileSubscription';
import ProfileOverview from '@/components/profile/ProfileOverview';
import ProfileSportsFavorites from '@/components/profile/ProfileSportsFavorites';
import {
    Home, Briefcase, BarChart3, Bookmark, Bell, Shield, User, Settings as SettingsIcon, Gift, Crown, FileText, Trophy
} from 'lucide-react';

type TabKey = 'overview' | 'portfolio' | 'insights' | 'watchlist' | 'alerts' | 'activity' | 'documents' | 'referrals' | 'verification' | 'preferences' | 'notifications' | 'security' | 'settings' | 'subscription' | 'sports';

// Wrap the main content in a component that uses search params
function ProfileContent() {
    const { user: authUser, isAuthenticated } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [showSettings, setShowSettings] = useState(false);

    // Handle tab from URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && [
            'overview', 'portfolio', 'insights', 'watchlist', 'alerts', 'activity', 'documents',
            'referrals', 'verification', 'preferences', 'notifications', 'security', 'settings', 'subscription', 'sports'
        ].includes(tab)) {
            setActiveTab(tab as TabKey);
        }
    }, [searchParams]);

    // Update URL when tab changes
    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        router.push(`/profile?tab=${tab}`, { scroll: false });
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const loadData = async () => {
            try {
                setLoading(true);
                const [profile, watchlistData] = await Promise.all([
                    getFullProfile(),
                    getWatchlist().catch(() => []),
                ]);
                setProfileData(profile);
                setWatchlist(watchlistData);

            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, authUser]);


    const handleProfileUpdate = (updatedProfile: UserProfile) => {
        if (profileData) {
            setProfileData({
                ...profileData,
                profile: updatedProfile
            });
        }
    };

    const handleProfileDataUpdate = (data: Partial<ProfileData>) => {
        if (profileData) {
            setProfileData({ ...profileData, ...data });
        }
    };

    const getTabIcon = (tab: TabKey) => {
        const iconProps = { size: 16, className: 'text-current' };
        switch (tab) {
            case 'overview': return <Home {...iconProps} />;
            case 'portfolio': return <Briefcase {...iconProps} />;
            case 'insights': return <BarChart3 {...iconProps} />;
            case 'watchlist': return <Bookmark {...iconProps} />;
            case 'alerts': return <Bell {...iconProps} />;
            case 'documents': return <FileText {...iconProps} />;
            case 'verification': return <Shield {...iconProps} />;
            case 'preferences': return <SettingsIcon {...iconProps} />;
            case 'notifications': return <Bell {...iconProps} />;
            case 'security': return <Shield {...iconProps} />;
            case 'referrals': return <Gift {...iconProps} />;
            case 'settings': return <User {...iconProps} />;
            case 'subscription': return <Crown {...iconProps} />;
            case 'sports': return <Trophy {...iconProps} />;
            default: return null;
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-400">
                <Header />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold mb-4 text-white">Please sign in to view your profile</h1>
                </div>
            </div>
        );
    }

    if (loading || !profileData) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const { profile, netWorth, netWorthChangePercent, preferences } = profileData;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-300 font-sans pb-12">
            <div className="fixed top-0 right-0 left-0 z-40 bg-gray-50 dark:bg-slate-900">
                <TickerTape />

                <Header />
            </div>

            {/* Scrollable Content - with top padding for fixed header */}
            <div className="pt-[112px] md:pt-[120px]">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    {/* Profile Header */}
                    <div className="mb-8">
                        <ProfileHeader
                            profile={profile}
                            netWorth={netWorth}
                            netWorthChangePercent={netWorthChangePercent}
                            onEditProfile={() => setShowSettings(true)}
                            onSettings={() => handleTabChange('preferences')}
                        />
                    </div>

                    {/* Tab Navigation */}
                    <div className="mb-8">
                        <div className="flex gap-1 overflow-x-auto no-scrollbar">
                            {([
                                'overview', 'portfolio', 'insights', 'watchlist', 'sports', 'alerts', 'activity', 'documents',
                                'referrals', 'subscription', 'verification', 'preferences', 'notifications', 'security'
                            ] as TabKey[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                        }`}
                                >
                                    {getTabIcon(tab)}
                                    <span className="capitalize">{tab}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {activeTab === 'overview' && (
                            <ProfileOverview
                                profileData={profileData}
                                onUpdate={handleProfileUpdate}
                                onUpdateData={handleProfileDataUpdate}
                            />
                        )}

                        {/* Portfolio Tab */}
                        {activeTab === 'portfolio' && (
                            <ProfilePortfolio onAddHolding={() => {
                                // Handle add holding action
                            }} />
                        )}

                        {/* Subscription Tab */}
                        {activeTab === 'subscription' && (
                            <ProfileSubscription />
                        )}

                        {/* Insights Tab */}
                        {activeTab === 'insights' && (
                            <ProfileInsights />
                        )}

                        {/* Watchlist Tab */}
                        {activeTab === 'watchlist' && (
                            <ProfileWatchlist onAddSymbol={() => {
                                // Handle add symbol action
                            }} />
                        )}

                        {/* Verification Tab */}
                        {activeTab === 'verification' && (
                            <ProfileVerification profile={profile} />
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <ProfilePreferences
                                initialPreferences={preferences}
                                onUpdate={(prefs) => {
                                    if (profileData) {
                                        setProfileData({ ...profileData, preferences: prefs });
                                    }
                                }}
                            />
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <ProfileSecurity onPasswordChange={() => {
                                // Handle password change success
                            }} />
                        )}

                        {/* Alerts Tab */}
                        {activeTab === 'alerts' && (
                            <ProfileAlerts />
                        )}

                        {/* Activity Tab */}
                        {activeTab === 'activity' && (
                            <ProfileActivity />
                        )}

                        {/* Documents Tab */}
                        {activeTab === 'documents' && (
                            <ProfileDocuments />
                        )}

                        {/* Referrals Tab */}
                        {activeTab === 'referrals' && (
                            <ProfileReferrals />
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <ProfileNotifications />
                        )}

                        {/* Sports Favorites Tab */}
                        {activeTab === 'sports' && (
                            <ProfileSportsFavorites />
                        )}

                        {/* Other tabs placeholder */}
                        {!['overview', 'portfolio', 'insights', 'watchlist', 'verification', 'preferences', 'notifications', 'security', 'alerts', 'activity', 'documents', 'referrals', 'subscription', 'sports'].includes(activeTab) && (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                                <h3 className="text-lg font-bold text-white capitalize mb-2">{activeTab}</h3>
                                <p className="text-slate-500 text-sm">Detailed {activeTab} information will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Settings Modal */}
            {showSettings && (
                <ProfileSettings
                    profile={profile}
                    onClose={() => setShowSettings(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}