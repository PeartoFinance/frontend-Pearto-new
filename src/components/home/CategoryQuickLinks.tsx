'use client';

import Link from 'next/link';

const categories = [
    { icon: '💻', label: 'Technology', href: '/technology', color: 'blue' },
    { icon: '💼', label: 'Business', href: '/business', color: 'emerald' },
    { icon: '🌍', label: 'World News', href: '/world', color: 'purple' },
    { icon: '📊', label: 'Market Data', href: '/markets', color: 'orange' },
    { icon: '🏦', label: 'Forex', href: '/tools/fx-rates', color: 'rose' },
    { icon: '📚', label: 'Education', href: '/learn', color: 'indigo' },
];

const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 hover:border-blue-200 hover:bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
    purple: 'bg-purple-100 text-purple-600 hover:border-purple-200 hover:bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 hover:border-orange-200 hover:bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400',
    rose: 'bg-rose-100 text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400',
    indigo: 'bg-indigo-100 text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400',
};

export default function CategoryQuickLinks() {
    return (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
                <Link
                    key={cat.label}
                    href={cat.href}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all cursor-pointer group bg-white dark:bg-slate-800/80 hover:shadow-md hover:-translate-y-0.5"
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${colorMap[cat.color]}`}>
                        <span className="text-lg">{cat.icon}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat.label}</span>
                </Link>
            ))}
        </section>
    );
}
