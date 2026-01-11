'use client';

import Link from 'next/link';

interface FeatureCard {
    title: string;
    subtitle: string;
    detail: string;
    icon: string;
    href: string;
    gradient: string;
    isNew?: boolean;
}

const featureCards: FeatureCard[] = [
    { title: 'Technology', subtitle: 'Tech news & innovation', detail: 'AI, startups, crypto', gradient: 'from-blue-500 to-purple-600', icon: '💻', href: '/technology', isNew: true },
    { title: 'Business', subtitle: 'Corporate & markets', detail: 'Earnings, stocks', gradient: 'from-emerald-500 to-teal-600', icon: '💼', href: '/business' },
    { title: 'World News', subtitle: 'Global coverage', detail: 'International affairs', gradient: 'from-slate-500 to-gray-600', icon: '🌍', href: '/world' },
    { title: 'Latest News', subtitle: 'Verified RSS feeds', detail: 'Real-time updates', gradient: 'from-fuchsia-500 to-pink-600', icon: '📰', href: '/news' },
    { title: 'Market Dashboard', subtitle: 'GLOBAL MARKETS', detail: 'Indices, crypto & commodities', gradient: 'from-emerald-500 to-cyan-600', icon: '📊', href: '/markets' },
    { title: 'Economic Calendar', subtitle: 'KEY EVENTS', detail: 'CPI, Fed & Jobs reports', gradient: 'from-indigo-500 to-violet-600', icon: '📅', href: '/calendar' },
    { title: 'Gold & Silver', subtitle: 'Bullion live spot prices', detail: 'Track precious metals', gradient: 'from-amber-400 to-orange-500', icon: '✨', href: '/markets/metals' },
    { title: 'Foreign FX Rates', subtitle: 'Global currency crosses', detail: 'Real-time exchange', gradient: 'from-sky-500 to-blue-600', icon: '🏦', href: '/tools/fx-rates' },
    { title: 'TV Hub', subtitle: 'Global TV channels', detail: 'Live markets & factual', gradient: 'from-emerald-500 to-teal-600', icon: '📺', href: '/tvs' },
    { title: 'Radio Hub', subtitle: '600+ stations streaming', detail: 'Nepali / Intl FM', gradient: 'from-red-500 to-rose-600', icon: '📻', href: '/radios' },
];

export default function FeatureQuickGrid() {
    return (
        <section aria-label="Feature navigation" className="my-8">
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                {featureCards.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className="group relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-700"
                    >
                        {/* Icon container with gradient */}
                        <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${card.gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-lg" aria-hidden="true">{card.icon}</span>
                        </div>

                        {/* New badge */}
                        {card.isNew && (
                            <span className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500 text-white shadow-sm">
                                NEW
                            </span>
                        )}

                        {/* Content */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight">
                                {card.title}
                            </h3>
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                {card.subtitle}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                                {card.detail}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
