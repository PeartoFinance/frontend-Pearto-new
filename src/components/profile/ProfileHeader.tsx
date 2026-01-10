'use client';

import { useState } from 'react';
import { Edit, Settings, Share2, MapPin, Calendar, Briefcase, ExternalLink, Star } from 'lucide-react';
import { UserProfile } from '@/services/userService';

interface ProfileHeaderProps {
    profile: UserProfile;
    onEditProfile: () => void;
    onSettings: () => void;
}

export default function ProfileHeader({ profile, onEditProfile, onSettings }: ProfileHeaderProps) {
    const [coverUrl] = useState<string>(''); // Placeholder for actual cover logic
    
    const userName = profile.name || 'User';
    const userHandle = profile.email?.split('@')[0] || 'user';
    const initials = userName.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            // Add your toast notification here
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#111314] shadow-xl">
            {/* 1. Cover Image Section */}
            <div className="group/cover h-48 sm:h-60 bg-gradient-to-r from-emerald-900 via-slate-900 to-cyan-900 relative">
                {coverUrl && (
                    <img src={coverUrl} alt="Profile cover" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Cover Controls */}
                <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200">
                    <button 
                        onClick={onEditProfile}
                        className="px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs backdrop-blur-md hover:bg-black/80 border border-white/10 transition-all"
                    >
                        Change Cover
                    </button>
                    <button 
                        onClick={handleShare}
                        className="p-2 rounded-lg bg-black/60 text-white backdrop-blur-md hover:bg-black/80 border border-white/10 transition-all"
                    >
                        <Share2 size={14} />
                    </button>
                </div>
            </div>

            {/* 2. Profile Info Section */}
            <div className="px-6 pb-6">
                <div className="relative flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-16 mb-6 gap-4">
                    {/* Avatar & Basic Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                        <div className="relative">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-1 shadow-2xl">
                                <div className="w-full h-full rounded-[14px] bg-[#111314] flex items-center justify-center overflow-hidden border-4 border-[#111314]">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400">
                                            {initials}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1 sm:pb-2">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{userName}</h1>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                    PRO
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-sm">
                                <span className="font-medium text-emerald-500/90">@{userHandle}</span>
                                <span className="flex items-center gap-1"><Briefcase size={14} /> Senior Analyst</span>
                                <span className="flex items-center gap-1"><MapPin size={14} /> Global</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 sm:pb-2">
                        <button 
                            onClick={onEditProfile}
                            className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0a0a0a] font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Edit size={16} />
                            Edit Profile
                        </button>
                        <button 
                            onClick={onSettings}
                            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-all active:scale-95"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                {/* 3. Stats / Chips Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/50 pt-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Member Since</p>
                            <p className="text-sm font-semibold text-white tracking-wide">March 2023</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                            <Star size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Rewards</p>
                            <p className="text-sm font-semibold text-white tracking-wide">
                                {profile.totalRewardPoints?.toLocaleString() || '125,450'} pts
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <ExternalLink size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Growth</p>
                            <p className="text-sm font-semibold text-emerald-400">+12.5% this month</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}