'use client';

import Link from 'next/link';
import { Calculator, Calendar, BookOpen, HelpCircle, TrendingUp, Bitcoin, DollarSign, Trophy } from 'lucide-react';

const tools = [
    {
        name: 'Calculators',
        description: 'SIP, EMI, Compound',
        icon: Calculator,
        href: '/tools',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        name: 'Stocks',
        description: 'Screener & analysis',
        icon: TrendingUp,
        href: '/stocks',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        name: 'Crypto',
        description: 'Live coin prices',
        icon: Bitcoin,
        href: '/crypto',
        color: 'from-orange-500 to-amber-500',
    },
    {
        name: 'Forex',
        description: 'Currency converter',
        icon: DollarSign,
        href: '/forex',
        color: 'from-sky-500 to-blue-500',
    },
    {
        name: 'Calendar',
        description: 'Economic events',
        icon: Calendar,
        href: '/calendar',
        color: 'from-indigo-500 to-violet-500',
    },
    {
        name: 'Sports',
        description: 'Live scores',
        icon: Trophy,
        href: '/sports',
        color: 'from-rose-500 to-pink-500',
    },
    {
        name: 'Glossary',
        description: 'Financial terms',
        icon: BookOpen,
        href: '/glossary',
        color: 'from-purple-500 to-pink-500',
    },
    {
        name: 'Support',
        description: 'Help center',
        icon: HelpCircle,
        href: '/support',
        color: 'from-amber-500 to-orange-500',
    },
];

export default function QuickTools() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Quick Tools
            </h3>

            <div className="grid grid-cols-2 gap-2 flex-1">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <Link
                            key={tool.name}
                            href={tool.href}
                            className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                                <Icon size={16} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white block truncate">
                                    {tool.name}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                                    {tool.description}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
