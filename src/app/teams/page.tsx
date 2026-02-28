'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users, Loader2, Mail, Linkedin, Twitter, ExternalLink } from 'lucide-react';
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

export default function TeamsPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const userCountry = localStorage.getItem('userCountry') || 'US';
                const res = await fetch(`${API_URL}/content/teams`, {
                    headers: { 'X-User-Country': userCountry }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMembers(data);
                }
            } catch (error) {
                console.error('Failed to fetch team data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [API_URL]);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-slate-50 dark:bg-slate-900 transition-colors">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
                        {/* Back Link */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 mb-8 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>

                        {/* Page Header */}
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-full mb-6">
                                <Users size={16} /> Our Team
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                                Meet the Innovators Behind Pearto
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                                We're a diverse group of financial experts, technologists, and designers committed to empowering your financial journey.
                            </p>
                        </div>

                        {/* Team Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                                <span className="text-slate-500 dark:text-slate-400 text-lg">Loading team members...</span>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="text-center py-24 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No team members found</h3>
                                <p className="text-slate-500 dark:text-slate-400">Check back later as we grow our team.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {members.map((member) => (
                                    <Link key={member.id} href={`/teams/${member.id}`} className="group relative block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700">

                                        <div className="aspect-square relative flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 p-6 overflow-hidden">
                                            {member.photo_url ? (
                                                <img
                                                    src={member.photo_url}
                                                    alt={member.name}
                                                    className="w-40 h-40 object-cover rounded-full border-4 border-white dark:border-slate-800 shadow-lg group-hover:scale-105 transition-transform duration-500"
                                                    width={160}
                                                    height={160}
                                                />
                                            ) : (
                                                <div className="w-40 h-40 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-4 border-white dark:border-slate-800 shadow-lg group-hover:scale-105 transition-transform duration-500 text-5xl font-bold uppercase">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}

                                            {/* Hover Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        </div>

                                        <div className="p-6">
                                            <div className="text-center mb-4">
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                                                    {member.name}
                                                </h3>
                                                <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mt-1">
                                                    {member.title}
                                                </p>
                                            </div>

                                            {/* Social Links Mini-bar */}
                                            <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                                {member.email && (
                                                    <span className="p-2 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:text-amber-500 transition-colors">
                                                        <Mail size={16} />
                                                    </span>
                                                )}
                                                {member.linkedin && (
                                                    <span className="p-2 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:text-blue-600 transition-colors">
                                                        <Linkedin size={16} />
                                                    </span>
                                                )}
                                                {member.twitter && (
                                                    <span className="p-2 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:text-sky-500 transition-colors">
                                                        <Twitter size={16} />
                                                    </span>
                                                )}
                                                {/* Fallback to show interactivity works */}
                                                {(!member.email && !member.linkedin && !member.twitter) && (
                                                    <span className="p-2 rounded-full bg-slate-50 dark:bg-slate-900 text-transparent">
                                                        <ExternalLink size={16} />
                                                    </span>
                                                )}
                                            </div>

                                            <div className="absolute top-4 right-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                                <ExternalLink size={20} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
}
