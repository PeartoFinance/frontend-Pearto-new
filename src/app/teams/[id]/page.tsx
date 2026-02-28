'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail, Linkedin, Twitter, Globe, Briefcase, Calendar, MapPin } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface TeamMember {
    id: number;
    name: string;
    title: string;
    bio: string | null;
    photo_url: string | null;
    email: string | null;
    linkedin: string | null;
    twitter: string | null;
    is_active: boolean;
    sort_order: number;
    country_code: string;
}

export default function TeamMemberPage() {
    const { id } = useParams();
    const router = useRouter();
    const [member, setMember] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';

    useEffect(() => {
        if (!id) return;

        const fetchMember = async () => {
            try {
                const res = await fetch(`${API_URL}/content/teams/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMember(data);
                } else {
                    router.push('/teams');
                }
            } catch (error) {
                console.error('Failed to fetch team member:', error);
                router.push('/teams');
            } finally {
                setLoading(false);
            }
        };

        fetchMember();
    }, [id, API_URL, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                    </div>
                </main>
            </div>
        );
    }

    if (!member) return null; // Managed by router.push in useEffect

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-slate-50 dark:bg-slate-900 transition-colors border-b border-slate-200 dark:border-slate-800">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    {/* Hero Header Strip */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-12 md:py-20 relative overflow-hidden">
                        {/* Abstract Background Patterns */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
                            <div className="absolute bottom-[-50px] left-20 w-80 h-80 bg-emerald-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
                        </div>

                        <div className="max-w-4xl mx-auto px-4 lg:px-6 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            {/* Profile Image Avatar overlaying header */}
                            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-8 border-white dark:border-slate-800 shadow-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 z-20 md:-mb-32">
                                {member.photo_url ? (
                                    <img
                                        src={member.photo_url}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-6xl font-bold text-slate-400 dark:text-slate-500 uppercase">{member.name.charAt(0)}</span>
                                )}
                            </div>

                            {/* Name & Title Summary Drop Title */}
                            <div className="text-center md:text-left text-white mt-4 md:mt-0">
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                                    {member.name}
                                </h1>
                                <p className="text-emerald-100 text-xl font-medium flex items-center justify-center md:justify-start gap-2">
                                    <Briefcase size={20} />
                                    {member.title}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Profiler Body */}
                    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-12 md:py-24">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* Left Column: Quick Contact & Details */}
                            <div className="md:col-span-1 space-y-8 mt-4 md:mt-0">
                                <Link
                                    href="/teams"
                                    className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 mb-4 transition-colors font-medium border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                                >
                                    <ArrowLeft size={16} /> Back to Team
                                </Link>

                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Contact & Links</h3>

                                    <div className="space-y-4">
                                        {member.email && (
                                            <a href={`mailto:${member.email}`} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors group">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 text-slate-400 group-hover:text-amber-500">
                                                    <Mail size={18} />
                                                </div>
                                                <span className="truncate">{member.email}</span>
                                            </a>
                                        )}
                                        {member.linkedin && (
                                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors group">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 text-slate-400 group-hover:text-blue-600">
                                                    <Linkedin size={18} />
                                                </div>
                                                <span className="truncate whitespace-nowrap text-ellipsis overflow-hidden">LinkedIn Profile</span>
                                            </a>
                                        )}
                                        {member.twitter && (
                                            <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors group">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 text-slate-400 group-hover:text-sky-500">
                                                    <Twitter size={18} />
                                                </div>
                                                <span>@Twitter</span>
                                            </a>
                                        )}

                                        {(!member.email && !member.linkedin && !member.twitter) && (
                                            <p className="text-sm text-slate-500 italic">No public contact info available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Bio */}
                            <div className="md:col-span-2 space-y-8">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                                        About {member.name.split(' ')[0]}
                                    </h2>

                                    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4">
                                        {member.bio ? (
                                            member.bio.split('\\n').map((paragraph, idx) => (
                                                <p key={idx}>{paragraph}</p>
                                            ))
                                        ) : (
                                            <p className="italic text-slate-500">Biography coming soon.</p>
                                        )}
                                    </div>
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
