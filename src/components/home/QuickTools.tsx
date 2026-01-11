'use client';

import Link from 'next/link';
import { Calculator, Calendar, BookOpen, HelpCircle } from 'lucide-react';

const tools = [
    {
        name: 'Calculators',
        description: 'SIP, EMI, Compound',
        icon: Calculator,
        href: '/tools',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        name: 'Calendar',
        description: 'Economic events',
        icon: Calendar,
        href: '/calendar',
        color: 'from-blue-500 to-indigo-500',
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Quick Tools
            </h3>

            <div className="grid grid-cols-2 gap-3">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <Link
                            key={tool.name}
                            href={tool.href}
                            className="group flex flex-col items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                            <div className={`p-3 rounded-xl bg-linear-to-br ${tool.color} mb-2 group-hover:scale-110 transition-transform`}>
                                <Icon size={20} className="text-white" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white text-center">
                                {tool.name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                {tool.description}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
