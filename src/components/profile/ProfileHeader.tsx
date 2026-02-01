'use client';

import { useState } from 'react';
import { Edit2, Settings, Briefcase } from 'lucide-react';
import { UserProfile } from '@/services/userService';
import PriceDisplay from '@/components/common/PriceDisplay';

interface ProfileHeaderProps {
    profile: UserProfile;
    netWorth?: number | null;
    netWorthChangePercent?: number | null;
    onEditProfile: () => void;
    onSettings: () => void;
}

export default function ProfileHeader({ profile, netWorth, netWorthChangePercent, onEditProfile, onSettings }: ProfileHeaderProps) {
    // Logic from your original code
    const userName = profile.name || 'User';
    const userHandle = profile.email?.split('@')[0] || 'user';
    const initials = userName.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

    // Formatting logic from your original code (adapted for the design)
    const formatMemberSince = (iso?: string) => {
        if (!iso) return '—';
        try {
            const d = new Date(iso);
            return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } catch {
            return '—';
        }
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 text-white p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                {/* Left Section: Avatar and Identity */}
                <div className="flex items-center gap-5">
                    <div className="relative">
                        {/* Avatar Box as seen in image */}
                        <div className="w-20 h-20 rounded-xl bg-[#142d24] border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-emerald-500">{initials}</span>
                            )}
                        </div>
                        {/* Status Dot */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#09090b] rounded-full"></div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-white">{userName}</h1>
                            <span className="px-2 py-0.5 rounded-md border border-emerald-500/40 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                                PRO
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                            <span className="hover:text-emerald-400 cursor-pointer transition-colors">@{userHandle}</span>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1.5">
                                <Briefcase size={14} className="text-emerald-500/70" />
                                {profile.role || 'Senior Analyst'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Section: Stats and Actions using original profile data */}
                <div className="flex flex-wrap items-center gap-4">

                    {/* Net Worth Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 min-w-[160px]">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Net Worth</p>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold">
                                <PriceDisplay amount={netWorth || 0} />
                            </span>
                            {(netWorthChangePercent !== undefined && netWorthChangePercent !== null && netWorth !== null && netWorth !== 0) && (
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium border ${netWorthChangePercent >= 0
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {netWorthChangePercent >= 0 ? '+' : ''}{netWorthChangePercent?.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Member Since Card (using profile.createdAt) */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 min-w-[160px]">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Member Since</p>
                        <p className="text-xl font-bold">
                            {formatMemberSince(profile.createdAt)}
                        </p>
                    </div>

                    {/* Action Group */}
                    <div className="flex items-center gap-2 lg:ml-4">
                        <button
                            onClick={onEditProfile}
                            className="h-11 px-5 rounded-xl border border-slate-700 bg-transparent hover:bg-white/5 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2"
                        >
                            <Edit2 size={16} />
                            Edit Profile
                        </button>
                        <button
                            onClick={onSettings}
                            className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-700 bg-transparent hover:bg-white/5 text-slate-400 transition-all"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}