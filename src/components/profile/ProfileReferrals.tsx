'use client';

import { useState, useEffect } from 'react';
import { Gift, Users, Copy, Check, Share2, Award, Loader2 } from 'lucide-react';
import { get } from '@/services/api';

interface Referral {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    status: string;
}

interface ReferralData {
    referralCode: string;
    totalReferrals: number;
    totalRewardPoints: number;
    referrals: Referral[];
}

export default function ProfileReferrals() {
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://pearto.com';

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            const result = await get<ReferralData>('/user/referrals');
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch referrals');
        } finally {
            setLoading(false);
        }
    };

    const copyReferralLink = () => {
        if (data?.referralCode) {
            const link = `${APP_URL}/signup?ref=${data.referralCode}`;
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareReferralLink = async () => {
        if (data?.referralCode && navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Pearto Finance',
                    text: 'Sign up with my referral link and we both earn rewards!',
                    url: `${APP_URL}/signup?ref=${data.referralCode}`
                });
            } catch {
                copyReferralLink();
            }
        } else {
            copyReferralLink();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400 text-center">
                <p>{error}</p>
                <button
                    onClick={fetchReferrals}
                    className="mt-4 px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Referral Code Card */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm mb-2">Your Referral Code</p>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white font-mono">
                            {data?.referralCode || 'N/A'}
                        </span>
                        <button
                            onClick={copyReferralLink}
                            className="p-2 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30 transition"
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <Copy className="w-5 h-5 text-emerald-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Total Referrals */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm mb-2">Total Referrals</p>
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-400" />
                        <span className="text-3xl font-bold text-white">
                            {data?.totalReferrals || 0}
                        </span>
                    </div>
                </div>

                {/* Reward Points */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm mb-2">Reward Points</p>
                    <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-yellow-400" />
                        <span className="text-3xl font-bold text-white">
                            {data?.totalRewardPoints || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Share Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Share Your Link</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 font-mono text-sm text-slate-300 overflow-hidden">
                        <span className="truncate block">
                            {`${APP_URL}/signup?ref=${data?.referralCode || ''}`}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={copyReferralLink}
                            className="flex-1 sm:flex-none px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center justify-center gap-2 transition"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                            onClick={shareReferralLink}
                            className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-xl flex items-center justify-center gap-2 transition"
                        >
                            <Share2 size={18} />
                            Share
                        </button>
                    </div>
                </div>
            </div>

            {/* Referred Users Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white">People You Referred</h2>
                </div>

                {data?.referrals && data.referrals.length > 0 ? (
                    <div className="divide-y divide-slate-700">
                        {data.referrals.map((referral) => (
                            <div key={referral.id} className="p-4 hover:bg-slate-700/30 transition flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {referral.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{referral.name}</p>
                                        <p className="text-slate-400 text-sm">{referral.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${referral.status === 'active'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-slate-600/50 text-slate-400'
                                        }`}>
                                        {referral.status}
                                    </span>
                                    <p className="text-slate-500 text-xs mt-1">
                                        {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 mb-2">No referrals yet</p>
                        <p className="text-slate-500 text-sm">
                            Share your link with friends to start earning rewards!
                        </p>
                    </div>
                )}
            </div>

            {/* How It Works */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 font-bold shrink-0">1</div>
                        <div>
                            <p className="text-white font-medium">Share Your Link</p>
                            <p className="text-slate-400 text-sm">Copy and share your unique referral link with friends</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 font-bold shrink-0">2</div>
                        <div>
                            <p className="text-white font-medium">Friend Signs Up</p>
                            <p className="text-slate-400 text-sm">When they create an account using your link</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 font-bold shrink-0">3</div>
                        <div>
                            <p className="text-white font-medium">Earn Rewards</p>
                            <p className="text-slate-400 text-sm">Both you and your friend earn reward points</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
