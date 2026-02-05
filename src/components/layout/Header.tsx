'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
    Search, Moon, Sun, Bell, Menu, X, ChevronDown, Layers, Wrench,
    BookOpen, Sparkles, User, LogOut, Settings, Wallet, TrendingUp,
    Bitcoin, DollarSign, BarChart3, Calculator, PiggyBank, Landmark,
    GraduationCap, FileText, HelpCircle, Tv, Radio, Newspaper, LucideIcon,
    LayoutDashboard, Briefcase, Star, Zap, Home, Mail, Phone, Globe,
    Shield, Lock, Key, Heart, Filter, List, Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import SearchModal from './SearchModal';
import { fetchNavigation, NavigationItem } from '@/services/navigationService';

// Icon mapping for dynamic icons
const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard, TrendingUp, Newspaper, GraduationCap, Briefcase, Wrench,
    Settings, User, ChevronRight: ChevronDown, Radio, Tv, Zap, BookOpen,
    Calculator, Wallet, Globe, LogOut, Star, Bitcoin, DollarSign, BarChart3,
    PiggyBank, Landmark, FileText, HelpCircle, Sparkles, Home, Mail, Phone,
    Shield, Lock, Key, Bell, Heart, Search, Filter, List, Layers, Menu, X
};

// Fallback navigation data
const fallbackPillarsItems = [
    { href: '/stocks', label: 'Stocks', icon: 'TrendingUp' },
    { href: '/crypto', label: 'Crypto', icon: 'Bitcoin' },
    { href: '/forex', label: 'Forex', icon: 'DollarSign' },
    { href: '/commodities', label: 'Commodities', icon: 'BarChart3' },
];

const fallbackToolsItems = [
    { href: '/tools/sip', label: 'SIP Calculator', icon: 'Calculator' },
    { href: '/tools/emi', label: 'EMI Calculator', icon: 'Calculator' },
    { href: '/tools/compound', label: 'Compound Interest', icon: 'PiggyBank' },
    { href: '/tools/retirement', label: 'Retirement Planner', icon: 'Landmark' },
];

const fallbackResourcesItems = [
    { href: '/learn', label: 'Learn', icon: 'GraduationCap' },
    { href: '/news', label: 'News', icon: 'Newspaper' },
    { href: '/tv', label: 'Live TV', icon: 'Tv' },
    { href: '/radio', label: 'Radio', icon: 'Radio' },
    { href: '/blog', label: 'Blog', icon: 'FileText' },
    { href: '/help', label: 'Help Center', icon: 'HelpCircle' },
];

const fallbackFeaturedItems = [
    { href: '/markets', label: 'Markets', css_class: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600' },
    { href: '/booyah', label: 'Booyah', css_class: 'bg-gradient-to-br from-green-500 via-emerald-500 to-green-600' },
];

interface DropdownItem {
    href: string;
    label: string;
    icon: string;
}

interface DropdownMenuProps {
    label: string;
    icon: React.ReactNode;
    items: DropdownItem[];
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

function DropdownMenu({ label, icon, items, isOpen, onToggle, onClose }: DropdownMenuProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={onToggle}
                className={`inline-flex items-center gap-2 h-9 px-3 rounded-full border transition text-sm font-medium text-slate-700 dark:text-slate-200 ${isOpen
                    ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
            >
                {icon}
                <span>{label}</span>
                <ChevronDown size={14} className={`opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-[60] animate-in fade-in-0 slide-in-from-top-2 duration-200">
                    {items.map((item) => {
                        const Icon = iconMap[item.icon] || LayoutDashboard;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            >
                                <Icon size={16} className="text-slate-500 dark:text-slate-400" />
                                {item.label}
                            </Link>
                        );
                    })}
                    {label === 'Tools' && (
                        <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                            <Link
                                href="/tools"
                                onClick={onClose}
                                className="flex items-center justify-between px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <span>View All Tools</span>
                                <span className="text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full">20+</span>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface FeaturedItem {
    href: string;
    label: string;
    css_class?: string;
}

export default function Header({ isFixed = false, customBg }: { isFixed?: boolean; customBg?: string }) {
    const { t } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const { planName, isPro, status } = useSubscription();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);

    // Market status state
    const [marketStatus, setMarketStatus] = useState<{
        isOpen: boolean;
        message: string;
        shortMessage?: string;
        exchangeCode: string;
    } | null>(null);

    // Dynamic navigation state
    const [pillarsItems, setPillarsItems] = useState<DropdownItem[]>(fallbackPillarsItems);
    const [toolsItems, setToolsItems] = useState<DropdownItem[]>(fallbackToolsItems);
    const [resourcesItems, setResourcesItems] = useState<DropdownItem[]>(fallbackResourcesItems);
    const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>(fallbackFeaturedItems);

    // Load dynamic navigation
    useEffect(() => {
        const loadNavigation = async () => {
            try {
                const nav = await fetchNavigation();
                if (nav.items.length > 0) {
                    const pillars = nav.navigation['header_pillars'];
                    const tools = nav.navigation['header_tools'];
                    const resources = nav.navigation['header_resources'];
                    const featured = nav.navigation['header_featured'];

                    if (pillars?.length) setPillarsItems(pillars.map(i => ({ href: i.url, label: i.label, icon: i.icon })));
                    if (tools?.length) setToolsItems(tools.map(i => ({ href: i.url, label: i.label, icon: i.icon })));
                    if (resources?.length) setResourcesItems(resources.map(i => ({ href: i.url, label: i.label, icon: i.icon })));
                    if (featured?.length) setFeaturedItems(featured.map(i => ({ href: i.url, label: i.label, css_class: i.css_class || undefined })));
                }

                // Also fetch custom pages for header and resources
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.pearto.com/api';
                const userCountry = localStorage.getItem('userCountry') || 'US';
                const [headerPagesRes, resourcesPagesRes] = await Promise.all([
                    fetch(`${API_BASE}/pages?placement=header&status=published`, {
                        headers: { 'X-User-Country': userCountry }
                    }),
                    fetch(`${API_BASE}/pages?placement=resources&status=published`, {
                        headers: { 'X-User-Country': userCountry }
                    })
                ]);

                // Track added page IDs to avoid duplicates
                const addedPageIds = new Set<string>();

                if (headerPagesRes.ok) {
                    const headerData = await headerPagesRes.json();
                    if (headerData.pages?.length) {
                        setFeaturedItems(prev => [
                            ...prev,
                            ...headerData.pages.map((p: { id: string; slug: string; title: string }) => {
                                addedPageIds.add(p.id);
                                return {
                                    href: `/p/${p.slug}`,
                                    label: p.title,
                                    css_class: 'bg-gradient-to-br from-slate-600 to-slate-700'
                                };
                            })
                        ]);
                    }
                }

                if (resourcesPagesRes.ok) {
                    const resourcesData = await resourcesPagesRes.json();
                    if (resourcesData.pages?.length) {
                        // Filter out pages already added to header
                        const newPages = resourcesData.pages.filter((p: { id: string }) => !addedPageIds.has(p.id));
                        if (newPages.length) {
                            setResourcesItems(prev => [
                                ...prev,
                                ...newPages.map((p: { slug: string; title: string }) => ({
                                    href: `/p/${p.slug}`,
                                    label: p.title,
                                    icon: 'FileText'
                                }))
                            ]);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load navigation:', error);
            }
        };
        loadNavigation();
    }, []);




    // Load market status
    useEffect(() => {
        const fetchMarketStatus = async () => {
            try {
                // Try to get user's country from localStorage or default to US
                const userCountry = localStorage.getItem('userCountry') || 'US';
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.pearto.com/api';
                const res = await fetch(`${API_BASE}/market/status`, {
                    headers: { 'X-User-Country': userCountry }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMarketStatus({
                        isOpen: data.status?.isOpen ?? false,
                        message: data.status?.message || 'Unknown',
                        shortMessage: data.status?.shortMessage,
                        exchangeCode: data.exchange?.exchangeCode || 'NYSE'
                    });
                }
            } catch (err) {
                console.error('Failed to load market status:', err);
            }
        };
        fetchMarketStatus();
        // Refresh every 5 minutes
        const interval = setInterval(fetchMarketStatus, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Handle scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDropdownToggle = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const closeDropdown = () => setOpenDropdown(null);

    return (
        <>
            {/* PRIMARY NAVBAR */}
            <header className={`${isFixed ? 'fixed top-0 left-0 right-0 z-50' : ''} ${customBg || 'bg-white dark:bg-slate-900'} border-b border-slate-200 dark:border-slate-800`}>
                <div className="px-4 lg:px-6">
                    <div className="flex items-center justify-between h-14 gap-4">
                        {/* Left: Hamburger Menu + Logo (mobile only) */}
                        <div className="flex items-center gap-1 lg:hidden">
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Menu size={22} className="text-slate-600 dark:text-slate-300" />
                            </button>
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">P</span>
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500">
                                    Pearto
                                </span>
                            </Link>
                        </div>

                        {/* Center: Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-sm ml-4">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="w-full flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-slate-500 dark:text-slate-400 transition"
                            >
                                <Search size={16} />
                                <span className="flex-1 text-left truncate">Search stocks, crypto...</span>
                                <kbd className="hidden lg:inline-flex px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-[10px]">/</kbd>
                            </button>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 lg:gap-3">
                            <button onClick={() => setSearchOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <Search size={20} className="text-slate-600 dark:text-slate-300" />
                            </button>

                            {/* Market Status Badge */}
                            {marketStatus && (
                                <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${marketStatus.isOpen
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                    }`} title={marketStatus.message}>
                                    <span className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className="font-semibold">{marketStatus.exchangeCode}</span>
                                    <span className="hidden lg:inline">
                                        {marketStatus.isOpen ? 'Open' : 'Closed'}
                                    </span>
                                    <span className="hidden xl:inline text-[10px] opacity-80">
                                        · {marketStatus.shortMessage || marketStatus.message}
                                    </span>
                                </div>
                            )}

                            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
                                <Sun size={14} className="text-amber-500" />
                                <span>7°C</span>
                                <span className="text-slate-400 ml-1">Kathmandu</span>
                            </div>



                            <Link href="/ai" className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 shadow hover:shadow-md transition">
                                <Sparkles size={16} />
                                AI
                            </Link>

                            <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <Bell size={20} className="text-slate-600 dark:text-white" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                            </button>

                            {/* Auth buttons - Desktop */}
                            <div className="hidden lg:flex items-center gap-2">
                                {isAuthenticated ? (
                                    <div className="flex items-center gap-3">
                                        {/* Plan Badge */}
                                        <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${isPro
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                                            : status === 'trialing'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            {status === 'trialing' ? 'Trial' : isPro ? 'Pro' : 'Free'}
                                        </div>

                                        <div className="relative">
                                            <button
                                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                            >
                                                {user?.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                                        <span className="text-white text-sm font-bold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-slate-700 dark:text-white">{user?.name?.split(' ')[0]}</span>
                                                <ChevronDown size={14} className="text-slate-500" />
                                            </button>
                                            {userMenuOpen && (
                                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-[60]">
                                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                                    </div>
                                                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setUserMenuOpen(false)}>
                                                        <User size={16} /> My Profile
                                                    </Link>
                                                    <Link href="/portfolio" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setUserMenuOpen(false)}>
                                                        <Wallet size={16} /> Portfolio
                                                    </Link>
                                                    <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setUserMenuOpen(false)}>
                                                        <Settings size={16} /> Settings
                                                    </Link>
                                                    <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                                                        <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                            <LogOut size={16} /> Sign Out
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Sign in</Link>
                                        <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg shadow hover:shadow-md transition">Sign up</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* SECONDARY NAVBAR */}
            <div className={`hidden lg:block ${isFixed ? 'fixed top-14 left-0 right-0 z-40' : ''} bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 py-2.5`}>
                <div className="px-4 lg:px-6">
                    <div className="flex items-center justify-center gap-3">
                        {/* Pillars dropdown */}
                        <DropdownMenu
                            label="Pillars"
                            icon={<Layers size={14} className="opacity-70" />}
                            items={pillarsItems}
                            isOpen={openDropdown === 'pillars'}
                            onToggle={() => handleDropdownToggle('pillars')}
                            onClose={closeDropdown}
                        />

                        {/* Featured buttons (dynamic) */}
                        {featuredItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm text-white shadow hover:shadow-md transition ${item.css_class || 'bg-gradient-to-br from-emerald-500 to-cyan-500'}`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* Tools dropdown */}
                        <DropdownMenu
                            label="Tools"
                            icon={<Wrench size={14} className="opacity-70" />}
                            items={toolsItems}
                            isOpen={openDropdown === 'tools'}
                            onToggle={() => handleDropdownToggle('tools')}
                            onClose={closeDropdown}
                        />

                        {/* Resources dropdown */}
                        <DropdownMenu
                            label="Resources"
                            icon={<BookOpen size={14} className="opacity-70" />}
                            items={resourcesItems}
                            isOpen={openDropdown === 'resources'}
                            onToggle={() => handleDropdownToggle('resources')}
                            onClose={closeDropdown}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
                    <div className="lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] z-50 bg-white dark:bg-slate-900 overflow-auto shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">P</span>
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500">
                                    Pearto
                                </span>
                            </Link>
                            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X size={20} className="text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <button className="w-full flex items-center gap-3 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                <Search size={18} />
                                <span>Search stocks, crypto...</span>
                            </button>

                            <Link href="/ai" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 shadow">
                                <Sparkles size={18} />
                                AI Assistant
                            </Link>

                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-2">
                                        <Layers size={14} /> Pillars
                                    </div>
                                    <div className="space-y-1">
                                        {pillarsItems.map((item) => {
                                            const Icon = iconMap[item.icon] || TrendingUp;
                                            return (
                                                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-200">
                                                    <Icon size={16} className="text-slate-500 dark:text-slate-400" />
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dynamic featured buttons */}
                                {featuredItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center justify-center w-full py-3 rounded-xl font-bold text-white shadow ${item.css_class || 'bg-gradient-to-br from-emerald-500 to-cyan-500'}`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}

                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-2">
                                        <Wrench size={14} /> Tools
                                    </div>
                                    <div className="space-y-1">
                                        {toolsItems.map((item) => {
                                            const Icon = iconMap[item.icon] || Calculator;
                                            return (
                                                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm text-slate-700 dark:text-slate-200">
                                                    <Icon size={16} className="text-slate-500 dark:text-slate-400" />
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                        <Link href="/tools" onClick={() => setMobileOpen(false)} className="text-sm text-emerald-600 dark:text-emerald-400 px-3 py-2 hover:underline">
                                            View All Tools →
                                        </Link>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-2">
                                        <BookOpen size={14} /> Resources
                                    </div>
                                    <div className="space-y-1">
                                        {resourcesItems.map((item) => {
                                            const Icon = iconMap[item.icon] || BookOpen;
                                            return (
                                                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm text-slate-700 dark:text-slate-200">
                                                    <Icon size={16} className="text-slate-500 dark:text-slate-400" />
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                {isAuthenticated ? (
                                    <>
                                        <div className="flex items-center gap-3 px-2">
                                            {user?.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                                    <span className="text-white font-bold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium">
                                                <User size={16} /> Profile
                                            </Link>
                                            <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium">
                                                <Settings size={16} /> Settings
                                            </Link>
                                        </div>
                                        <button
                                            onClick={() => { logout(); setMobileOpen(false); }}
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 font-medium"
                                        >
                                            <LogOut size={18} /> Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex gap-3">
                                        <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 py-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 font-medium">Sign in</Link>
                                        <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 py-3 text-center rounded-xl text-white bg-gradient-to-r from-emerald-500 to-cyan-500 font-medium">Sign up</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Search Modal */}
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
