'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    TrendingUp,
    Newspaper,
    GraduationCap,
    Briefcase,
    Wrench,
    Settings,
    User,
    ChevronRight,
} from 'lucide-react';

const navItems = [
    { href: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
    { href: '/markets', icon: TrendingUp, labelKey: 'nav.markets' },
    { href: '/news', icon: Newspaper, labelKey: 'nav.news' },
    { href: '/learn', icon: GraduationCap, labelKey: 'nav.learn' },
    { href: '/portfolio', icon: Briefcase, labelKey: 'nav.portfolio' },
];

const toolItems = [
    { href: '/tools/sip-calculator', label: 'SIP Calculator' },
    { href: '/tools/emi-calculator', label: 'EMI Calculator' },
    { href: '/tools/compound', label: 'Compound Interest' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { t } = useTranslation();

    return (
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 pb-2">
                <Link href="/" className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        Pearto
                    </span>
                </Link>
            </div>

            {/* Main Menu */}
            <div className="px-4 py-6">
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Main Menu
                </p>
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-800'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-emerald-500' : ''} />
                                <span>{t(item.labelKey)}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Tools Section */}
            <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t('nav.tools')}
                </p>
                <nav className="space-y-1">
                    {toolItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            <Wrench size={16} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <Link
                        href="/tools"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                        All Tools <ChevronRight size={14} />
                    </Link>
                </nav>
            </div>

            {/* User Section */}
            <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                    <Settings size={20} />
                    <span>{t('nav.settings')}</span>
                </Link>
                <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <User size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            Guest User
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            <Link href="/login" className="hover:text-emerald-500">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
