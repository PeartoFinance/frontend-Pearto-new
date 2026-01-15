'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
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
    ChevronLeft,
    Radio,
    Tv,
    Zap,
    BookOpen,
    Calculator,
    Wallet,
    Globe,
    LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
    { href: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard', label: 'Dashboard' },
    { href: '/markets', icon: TrendingUp, labelKey: 'nav.markets', label: 'Markets' },
    { href: '/news', icon: Newspaper, labelKey: 'nav.news', label: 'News' },
    { href: '/learn', icon: GraduationCap, labelKey: 'nav.learn', label: 'Learn' },
    { href: '/portfolio', icon: Briefcase, labelKey: 'nav.portfolio', label: 'Portfolio' },
];

// Items that only show when authenticated
const authNavItems = [
    { href: '/my-courses', icon: BookOpen, labelKey: 'nav.myCourses', label: 'My Courses' },
];

const mediaItems = [
    { href: '/tv', icon: Tv, label: 'Live TV' },
    { href: '/radio', icon: Radio, label: 'Radio' },
    { href: '/sports', icon: Zap, label: 'Live Sports' },
];

const toolItems = [
    { href: '/tools/sip', label: 'SIP Calculator' },
    { href: '/tools/emi', label: 'EMI Calculator' },
    { href: '/tools/compound', label: 'Compound Interest' },
];

interface SidebarProps {
    collapsible?: boolean;
}

export default function Sidebar({ collapsible = true }: SidebarProps) {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();


    return (
        <aside className={`hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 h-screen sticky top-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-[68px]' : 'w-64'}`}>
            {/* Logo */}
            <div className="p-4 pb-2 flex items-center justify-between">
                <Link href="/" className={`flex items-center gap-3 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                            Pearto
                        </span>
                    )}
                </Link>
                {collapsible && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                )}
            </div>

            {/* Main Menu */}
            <div className="px-3 py-4">
                {!isCollapsed && (
                    <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Main Menu
                    </p>
                )}
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={isCollapsed ? item.label : undefined}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-800'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Icon size={20} className={isActive ? 'text-emerald-500' : ''} />
                                {!isCollapsed && <span>{t(item.labelKey, item.label)}</span>}
                            </Link>
                        );
                    })}
                    {/* My Courses - only when authenticated */}
                    {isAuthenticated && authNavItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={isCollapsed ? item.label : undefined}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-800'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Icon size={20} className={isActive ? 'text-emerald-500' : ''} />
                                {!isCollapsed && <span>{t(item.labelKey, item.label)}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Media Section */}
            <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-800">
                {!isCollapsed && (
                    <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Media
                    </p>
                )}
                <nav className="space-y-1">
                    {mediaItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={isCollapsed ? item.label : undefined}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Icon size={18} className={isActive ? 'text-emerald-500' : ''} />
                                {!isCollapsed && <span className="text-sm">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Tools Section */}
            <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-800">
                {!isCollapsed && (
                    <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Tools
                    </p>
                )}
                <nav className="space-y-1">
                    {toolItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.label : undefined}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <Wrench size={16} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                    {!isCollapsed && (
                        <Link
                            href="/tools"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                            All Tools <ChevronRight size={14} />
                        </Link>
                    )}
                </nav>
            </div>

            {/* User Section */}
            <div className="mt-auto p-3 border-t border-slate-200 dark:border-slate-800">
                <Link
                    href="/settings"
                    title={isCollapsed ? 'Settings' : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <Settings size={20} />
                    {!isCollapsed && <span>{t('nav.settings', 'Settings')}</span>}
                </Link>

                {isAuthenticated && user ? (
                    <div className={`flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`}>
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="h-9 w-9 rounded-full object-cover flex-shrink-0 border-2 border-emerald-500"
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {user.name || 'User'}
                                </p>
                                <button
                                    onClick={() => logout()}
                                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                                >
                                    <LogOut size={12} />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <User size={16} className="text-white" />
                        </div>
                        {!isCollapsed && (
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
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
