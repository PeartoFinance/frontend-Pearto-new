'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface FeatureCard {
    title: string;
    subtitle: string;
    icon: string;
    href: string;
    accent: string;
    dotColor: string;
    isNew?: boolean;
}

const featureCards: FeatureCard[] = [
    { title: 'Technology', subtitle: 'AI, startups, crypto', accent: 'group-hover:border-blue-500/50', dotColor: 'bg-blue-500', icon: '💻', href: '/news?category=technology', isNew: true },
    { title: 'Business', subtitle: 'Earnings, stocks', accent: 'group-hover:border-emerald-500/50', dotColor: 'bg-emerald-500', icon: '💼', href: '/news?category=business' },
    { title: 'World News', subtitle: 'International affairs', accent: 'group-hover:border-slate-400/50', dotColor: 'bg-slate-400', icon: '🌍', href: '/news?category=world' },
    { title: 'Latest News', subtitle: 'Real-time updates', accent: 'group-hover:border-pink-500/50', dotColor: 'bg-pink-500', icon: '📰', href: '/news' },
    { title: 'Market Dashboard', subtitle: 'Indices, crypto & commodities', accent: 'group-hover:border-emerald-500/50', dotColor: 'bg-emerald-500', icon: '📊', href: '/markets' },
    { title: 'Economic Calendar', subtitle: 'CPI, Fed & jobs reports', accent: 'group-hover:border-violet-500/50', dotColor: 'bg-violet-500', icon: '📅', href: '/calendar' },
    { title: 'Gold & Silver', subtitle: 'Bullion live spot prices', accent: 'group-hover:border-amber-500/50', dotColor: 'bg-amber-500', icon: '✨', href: '/markets/metals' },
    { title: 'Crypto Markets', subtitle: 'Bitcoin, Ethereum & more', accent: 'group-hover:border-orange-500/50', dotColor: 'bg-orange-500', icon: '₿', href: '/crypto', isNew: true },
    { title: 'TV Hub', subtitle: 'Live markets & factual', accent: 'group-hover:border-teal-500/50', dotColor: 'bg-teal-500', icon: '📺', href: '/tv' },
    { title: 'Radio Hub', subtitle: 'Nepali / Intl FM', accent: 'group-hover:border-rose-500/50', dotColor: 'bg-rose-500', icon: '📻', href: '/radio' },
];

export default function FeatureQuickGrid() {
    return (
        <section aria-label="Feature navigation">
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                {featureCards.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className={`group relative bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${card.accent}`}
                    >
                        {/* Icon + dot indicator */}
                        <div className="flex items-start justify-between mb-3">
                            <span className="text-2xl" aria-hidden="true">{card.icon}</span>
                            {card.isNew ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500 text-white">NEW</span>
                            ) : (
                                <span className={`w-2 h-2 rounded-full ${card.dotColor} opacity-60 group-hover:opacity-100 transition-opacity`} />
                            )}
                        </div>

                        {/* Content */}
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5 leading-tight">
                            {card.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                            {card.subtitle}
                        </p>

                        {/* Arrow on hover */}
                        <ArrowUpRight size={14} className="absolute top-3 right-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </div>
        </section>
    );
}
