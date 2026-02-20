'use client';

import Link from 'next/link';
import { Sparkles, Zap, BarChart3, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const perks = [
    { icon: Zap, text: 'Real-time market data' },
    { icon: BarChart3, text: 'Advanced charting & AI insights' },
    { icon: Shield, text: 'Unlimited watchlist & alerts' },
];

export default function UpgradePlanCTA() {
    const { isAuthenticated } = useAuth();

    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600 p-6 md:p-8">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Left content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-emerald-100 uppercase tracking-wide">Premium Plan</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                        Upgrade to Pearto Premium
                    </h3>
                    <p className="text-emerald-100 text-sm mb-4 max-w-md">
                        Get the full power of Pearto Finance with real-time data, AI analysis, and unlimited access to all tools.
                    </p>

                    {/* Perks */}
                    <div className="flex flex-wrap gap-4">
                        {perks.map((perk) => {
                            const Icon = perk.icon;
                            return (
                                <div key={perk.text} className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Icon size={12} className="text-white" />
                                    </div>
                                    <span className="text-sm text-white font-medium">{perk.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right CTA */}
                <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                        <p className="text-emerald-100 text-xs">Starting from</p>
                        <p className="text-3xl font-bold text-white">
                            $9.99<span className="text-base font-normal text-emerald-200">/mo</span>
                        </p>
                    </div>
                    <Link
                        href={isAuthenticated ? '/subscription' : '/signup'}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-emerald-600 font-bold rounded-xl transition-colors shadow-lg shadow-emerald-800/20"
                    >
                        {isAuthenticated ? 'View Plans' : 'Get Started'}
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
