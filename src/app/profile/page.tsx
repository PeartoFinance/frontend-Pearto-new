'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getFullProfile, type ProfileData, type UserProfile } from '@/services/userService';
import { getWatchlist, type WatchlistItem } from '@/services/portfolioService';
import Header from '@/components/layout/Header';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSettings from '@/components/profile/ProfileSettings';
import ProfileVerification from '@/components/profile/ProfileVerification';
import ProfilePreferences from '@/components/profile/ProfilePreferences';
import ProfileSecurity from '@/components/profile/ProfileSecurity';
import ProfilePortfolio from '@/components/profile/ProfilePortfolio';
import ProfileWatchlist from '@/components/profile/ProfileWatchlist';
import { 
    CheckCircle2, GraduationCap, Info, Mail, Phone, Calendar as CalendarIcon,
    FileText, ChevronLeft, ChevronRight, Save, Bold, Italic, List, 
    Home, Briefcase, BarChart3, Bookmark, Target, Bell, Shield, User, Settings as SettingsIcon
} from 'lucide-react';
import Calendar from './Calendar';

type TabKey = 'overview' | 'portfolio' | 'insights' | 'watchlist' | 'alerts' | 'documents' | 'verification' | 'preferences' | 'security' | 'settings';

export default function ProfilePage() {
    const { user: authUser, isAuthenticated } = useAuth();
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [showSettings, setShowSettings] = useState(false);
    const [noteDraft, setNoteDraft] = useState('');
    const [notes, setNotes] = useState<Array<{ id: string; text: string; at: string }>>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [savingNote, setSavingNote] = useState(false);

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
                
                const savedNotes = localStorage.getItem('profile_notes');
                if (savedNotes) setNotes(JSON.parse(savedNotes));
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, authUser]);

    const handleSaveNote = async () => {
        if (!noteDraft.trim()) return;
        setSavingNote(true);
        const newNote = { id: Date.now().toString(), text: noteDraft.trim(), at: new Date().toISOString() };
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        setNoteDraft('');
        try {
            localStorage.setItem('profile_notes', JSON.stringify(updatedNotes));
        } finally {
            setSavingNote(false);
        }
    };

    const handleProfileUpdate = (updatedProfile: UserProfile) => {
        if (profileData) {
            setProfileData({
                ...profileData,
                profile: updatedProfile
            });
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
            case 'security': return <Shield {...iconProps} />;
            case 'settings': return <User {...iconProps} />;
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

    const { profile, specializations = [], certifications = [], hourlyRate, netWorth, netWorthChangePercent, memberSince, preferences } = profileData;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-300 font-sans pb-12">
            <Header isFixed={true} />
            
            <div className="container mx-auto px-4 py-8 max-w-7xl pt-27">
                {/* Profile Header */}
                <div className="mb-8">
                    <ProfileHeader 
                        profile={profile}
                        onEditProfile={() => setShowSettings(true)}
                        onSettings={() => setActiveTab('preferences')}
                    />
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        {([
                            'overview', 'portfolio', 'insights', 'watchlist', 'alerts', 'documents',
                            'verification', 'preferences', 'security'
                        ] as TabKey[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab 
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Specializations */}
                            <Card title="Specializations" icon={<CheckCircle2 size={18} className="text-emerald-500" />}>
                                <div className="flex flex-wrap gap-2">
                                    {specializations.map((spec) => (
                                        <span key={spec.id} className={`px-4 py-2 rounded-xl text-[11px] font-bold border uppercase tracking-tighter ${
                                            spec.selected ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                                        }`}>
                                            {spec.name}
                                        </span>
                                    ))}
                                </div>
                            </Card>

                            {/* Certifications */}
                            <Card title="Certifications" icon={<GraduationCap size={18} className="text-emerald-500" />}>
                                <div className="flex flex-wrap gap-2">
                                    {certifications.map((cert) => (
                                        <div key={cert.id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-4 py-2 rounded-xl">
                                            <div className={`w-1.5 h-1.5 rounded-full ${cert.level ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-600'}`} />
                                            <span className="text-xs font-semibold text-slate-300">{cert.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* General */}
                            <Card title="General" icon={<Info size={18} className="text-emerald-500" />}>
                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Hourly Rate</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-white font-bold">${hourlyRate}/h</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Member since</span>
                                        <span className="text-white font-medium">{memberSince ? new Date(memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Net Worth</span>
                                        <span className="text-white font-bold">${netWorth?.toLocaleString() || '0'}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Contacts */}
                            <Card title="Contacts" icon={<Mail size={18} className="text-emerald-500" />}>
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-emerald-500/10 transition"><Phone size={14} className="text-slate-400 group-hover:text-emerald-500" /></div>
                                            <span className="text-sm text-slate-400">Phone</span>
                                        </div>
                                        <span className="text-sm text-white font-medium">{profile.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-emerald-500/10 transition"><Mail size={14} className="text-slate-400 group-hover:text-emerald-500" /></div>
                                            <span className="text-sm text-slate-400">E-mail</span>
                                        </div>
                                        <span className="text-sm text-emerald-400 font-medium truncate ml-4">{profile.email}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Calendar */}
                            <Card 
                                title={currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                icon={<CalendarIcon size={18} className="text-emerald-500" />}
                                actions={
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 rounded hover:bg-slate-800 text-slate-400"><ChevronLeft size={16} /></button>
                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 rounded hover:bg-slate-800 text-slate-400"><ChevronRight size={16} /></button>
                                    </div>
                                }
                            >
                                <Calendar month={currentMonth} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                                <div className="mt-6 pt-6 border-t border-slate-800">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upcoming</span>
                                        <button className="text-[10px] text-emerald-500 font-bold hover:underline">View All</button>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-xl border border-slate-300 dark:border-slate-600 flex items-center gap-4">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg"><CalendarIcon size={16} className="text-emerald-500" /></div>
                                        <div>
                                            <p className="text-xs font-bold text-white">Q1 Earnings Call</p>
                                            <p className="text-[10px] text-slate-500">10:00 AM - 11:30 AM</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Private Notes */}
                            <Card title="Private Notes" icon={<FileText size={18} className="text-emerald-500" />}>
                                <div className="relative">
                                    <textarea
                                        value={noteDraft}
                                        onChange={(e) => setNoteDraft(e.target.value)}
                                        placeholder="Draft your strategy..."
                                        className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 h-40 focus:outline-none focus:border-emerald-500/50 transition resize-none"
                                    />
                                    {notes.length > 0 && (
                                        <div className="absolute top-3 right-3">
                                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">Saved</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex gap-1 text-slate-500">
                                        <button className="p-2 hover:bg-slate-800 rounded-lg"><Bold size={14}/></button>
                                        <button className="p-2 hover:bg-slate-800 rounded-lg"><Italic size={14}/></button>
                                        <button className="p-2 hover:bg-slate-800 rounded-lg"><List size={14}/></button>
                                    </div>
                                    <button
                                        onClick={handleSaveNote}
                                        disabled={!noteDraft.trim() || savingNote}
                                        className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition"
                                    >
                                        <Save size={14} /> Save Note
                                    </button>
                                </div>
                                {notes.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-600 space-y-3 max-h-32 overflow-y-auto custom-scrollbar">
                                        {notes.map((note) => (
                                            <div key={note.id} className="text-[11px] bg-slate-100 dark:bg-slate-700 p-2 rounded-lg border border-slate-300/50 dark:border-slate-600/50">
                                                <div className="text-slate-500 mb-1">{new Date(note.at).toLocaleDateString()}</div>
                                                <div className="text-slate-300 italic">"{note.text}"</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* Portfolio Tab */}
                    {activeTab === 'portfolio' && (
                        <ProfilePortfolio onAddHolding={() => {
                            // Handle add holding action
                        }} />
                    )}

                    {/* Insights Tab */}
                    {activeTab === 'insights' && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                             <h3 className="text-lg font-bold text-white capitalize mb-2">Analytics & Insights</h3>
                             <p className="text-slate-500 text-sm">Advanced portfolio analytics and market insights coming soon.</p>
                        </div>
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

                    {/* Other tabs placeholder */}
                    {!['overview', 'portfolio', 'insights', 'watchlist', 'verification', 'preferences', 'security'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                             <h3 className="text-lg font-bold text-white capitalize mb-2">{activeTab}</h3>
                             <p className="text-slate-500 text-sm">Detailed {activeTab} information will appear here.</p>
                        </div>
                    )}
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

// Custom Styled Card Component
function Card({ title, icon, children, actions }: { title: string; icon?: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                        {icon}
                    </div>
                    <h3 className="font-bold text-white text-sm tracking-wide">{title}</h3>
                </div>
                {actions}
            </div>
            {children}
        </div>
    );
}