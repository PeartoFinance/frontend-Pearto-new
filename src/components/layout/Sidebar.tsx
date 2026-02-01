'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard, TrendingUp, Newspaper, GraduationCap, Briefcase,
    Wrench, Settings, User, ChevronRight, ChevronLeft, Radio, Tv, Zap,
    BookOpen, Calculator, Wallet, Globe, LogOut, Star, Bitcoin, DollarSign,
    BarChart3, PiggyBank, Landmark, FileText, HelpCircle, Sparkles, Home,
    Mail, Phone, Shield, Lock, Key, Bell, Heart, Search, Filter, List,
    Users, MessageCircle, Lightbulb, Award, MessageSquare,
    LucideIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchNavigation, NavigationItem } from '@/services/navigationService';

// Icon mapping for dynamic icons
const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard, TrendingUp, Newspaper, GraduationCap, Briefcase, Wrench,
    Settings, User, ChevronRight, ChevronLeft, Radio, Tv, Zap, BookOpen,
    Calculator, Wallet, Globe, LogOut, Star, Bitcoin, DollarSign, BarChart3,
    PiggyBank, Landmark, FileText, HelpCircle, Sparkles, Home, Mail, Phone,
    Shield, Lock, Key, Bell, Heart, Search, Filter, List,
    Users, MessageCircle, Lightbulb, Award, MessageSquare
};

// Fallback navigation items (used when API not available)
const fallbackNavItems = [
    { href: '/', icon: 'LayoutDashboard', label: 'Dashboard' },
    { href: '/markets', icon: 'TrendingUp', label: 'Markets' },
    { href: '/news', icon: 'Newspaper', label: 'News' },
    { href: '/learn', icon: 'GraduationCap', label: 'Learn' },
    { href: '/vendors', icon: 'Briefcase', label: 'Partners' },
];

const fallbackAuthItems = [
    { href: '/portfolio', icon: 'Briefcase', label: 'Portfolio' },
    { href: '/watchlist', icon: 'Star', label: 'My Watchlist' },
    { href: '/my-courses', icon: 'BookOpen', label: 'My Courses' },
];

const fallbackMediaItems = [
    { href: '/tv', icon: 'Tv', label: 'Live TV' },
    { href: '/radio', icon: 'Radio', label: 'Radio' },
    { href: '/sports', icon: 'Zap', label: 'Live Sports' },
];

const fallbackToolItems = [
    { href: '/tools/sip', icon: 'Calculator', label: 'SIP Calculator' },
    { href: '/tools/emi', icon: 'Calculator', label: 'EMI Calculator' },
    { href: '/tools/compound', icon: 'Calculator', label: 'Compound Interest' },
];

const fallbackCommunityItems = [
    { href: '/ideas', icon: 'Lightbulb', label: 'Trading Ideas' },
    { href: '/groups', icon: 'Users', label: 'Discussion Groups' },
    { href: '/investors', icon: 'User', label: 'Discover Investors' },
    { href: '/badges', icon: 'Award', label: 'Badges' },
    { href: '/messages', icon: 'MessageCircle', label: 'Messages', requires_auth: true },
];

interface SidebarProps {
    collapsible?: boolean;
}

export default function Sidebar({ collapsible = true }: SidebarProps) {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();

    // Dynamic navigation state
    const [mainItems, setMainItems] = useState<NavigationItem[]>([]);
    const [authItems, setAuthItems] = useState<NavigationItem[]>([]);
    const [mediaItems, setMediaItems] = useState<NavigationItem[]>([]);
    const [toolItems, setToolItems] = useState<NavigationItem[]>([]);
    const [communityItems, setCommunityItems] = useState<NavigationItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const loadNavigation = async () => {
            try {
                const nav = await fetchNavigation();
                if (nav.items.length > 0) {
                    setMainItems(nav.navigation['sidebar_main'] || []);
                    setAuthItems(nav.navigation['sidebar_auth'] || []);
                    setMediaItems(nav.navigation['sidebar_media'] || []);
                    setToolItems(nav.navigation['sidebar_tools'] || []);
                    setCommunityItems(nav.navigation['sidebar_community'] || []);
                }
                setLoaded(true);
            } catch (error) {
                console.error('Failed to load navigation:', error);
                setLoaded(true);
            }
        };
        loadNavigation();
    }, []);

    // Use dynamic or fallback items
    const navItems = loaded && mainItems.length > 0
        ? mainItems.map(i => ({ href: i.url, icon: i.icon, label: i.label, requires_auth: i.requires_auth }))
        : fallbackNavItems;

    const authNavItems = loaded && authItems.length > 0
        ? authItems.map(i => ({ href: i.url, icon: i.icon, label: i.label }))
        : fallbackAuthItems;

    const mediaNavItems = loaded && mediaItems.length > 0
        ? mediaItems.map(i => ({ href: i.url, icon: i.icon, label: i.label }))
        : fallbackMediaItems;

    const toolNavItems = loaded && toolItems.length > 0
        ? toolItems.map(i => ({ href: i.url, icon: i.icon, label: i.label }))
        : fallbackToolItems;

    const communityNavItems = loaded && communityItems.length > 0
        ? communityItems.map(i => ({ href: i.url, icon: i.icon, label: i.label, requires_auth: i.requires_auth }))
        : fallbackCommunityItems;

    const getIcon = (iconName: string): LucideIcon => {
        return iconMap[iconName] || LayoutDashboard;
    };

    return (
        <aside className={`hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 h-screen sticky top-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-[68px]' : 'w-64'}`}>
            {/* Logo */}
            <div className="p-4 pb-2 flex items-center justify-between flex-shrink-0">
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
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
                            const Icon = getIcon(item.icon);
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
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                        {/* Auth items - only when authenticated */}
                        {isAuthenticated && authNavItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                            const Icon = getIcon(item.icon);
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
                                    {!isCollapsed && <span>{item.label}</span>}
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
                        {mediaNavItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                            const Icon = getIcon(item.icon);
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
                        {toolNavItems.map((item) => {
                            const Icon = getIcon(item.icon);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${isCollapsed ? 'justify-center' : ''}`}
                                >
                                    <Icon size={16} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
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

                {/* Community Section */}
                <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-800">
                    {!isCollapsed && (
                        <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Community
                        </p>
                    )}
                    <nav className="space-y-1">
                        {communityNavItems.map((item) => {
                            // Skip auth-required items if not authenticated
                            if (item.requires_auth && !isAuthenticated) return null;
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                            const Icon = getIcon(item.icon);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                >
                                    <Icon size={18} className={isActive ? 'text-purple-500' : ''} />
                                    {!isCollapsed && <span className="text-sm">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div> {/* End scrollable content */}

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
