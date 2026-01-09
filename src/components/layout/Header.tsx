'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
    Search,
    Moon,
    Sun,
    Bell,
    Menu,
    X,
    ChevronDown,
    Layers,
    Wrench,
    BookOpen,
    Sparkles,
    User,
    LogOut,
    Settings,
    Wallet,
    TrendingUp,
    Bitcoin,
    DollarSign,
    BarChart3,
    Calculator,
    PiggyBank,
    Landmark,
    GraduationCap,
    FileText,
    HelpCircle,
    Tv,
    Radio,
    Newspaper,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Navigation data
const pillarsItems = [
    { href: '/stocks', label: 'Stocks', icon: TrendingUp },
    { href: '/crypto', label: 'Crypto', icon: Bitcoin },
    { href: '/forex', label: 'Forex', icon: DollarSign },
    { href: '/commodities', label: 'Commodities', icon: BarChart3 },
];

const toolsItems = [
    { href: '/tools/sip', label: 'SIP Calculator', icon: Calculator },
    { href: '/tools/emi', label: 'EMI Calculator', icon: Calculator },
    { href: '/tools/compound', label: 'Compound Interest', icon: PiggyBank },
    { href: '/tools/retirement', label: 'Retirement Planner', icon: Landmark },
];

const resourcesItems = [
    { href: '/learn', label: 'Learn', icon: GraduationCap },
    { href: '/news', label: 'News', icon: Newspaper },
    { href: '/tv', label: 'Live TV', icon: Tv },
    { href: '/radio', label: 'Radio', icon: Radio },
    { href: '/blog', label: 'Blog', icon: FileText },
    { href: '/help', label: 'Help Center', icon: HelpCircle },
];

interface DropdownMenuProps {
    label: string;
    icon: React.ReactNode;
    items: { href: string; label: string; icon: typeof TrendingUp }[];
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
                className={`inline-flex items-center gap-2 h-9 px-3 rounded-full border transition text-sm font-medium ${isOpen
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
                        const Icon = item.icon;
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

export default function Header() {
    const { t } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Dropdown states
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Handle dark mode
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark) || (!savedTheme);
        setIsDarkMode(shouldBeDark);
        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Handle scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleDarkMode = () => {
        const html = document.documentElement;
        const currentlyDark = html.classList.contains('dark');
        if (currentlyDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    const handleDropdownToggle = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const closeDropdown = () => setOpenDropdown(null);

    return (
        <>
            {/* PRIMARY NAVBAR */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="px-4 lg:px-6">
                    <div className="flex items-center justify-between h-14 gap-4">
                        {/* Left: Logo (mobile only) */}
                        <Link href="/" className="flex items-center gap-2 lg:hidden">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">P</span>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500">
                                Pearto
                            </span>
                        </Link>

                        {/* Center: Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-sm ml-4">
                            <button className="w-full flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-slate-500 dark:text-slate-400 transition">
                                <Search size={16} />
                                <span className="flex-1 text-left truncate">Search...</span>
                                <kbd className="hidden lg:inline-flex px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-[10px]">/</kbd>
                            </button>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 lg:gap-3">
                            <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <Search size={20} className="text-slate-600 dark:text-slate-300" />
                            </button>

                            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-700" />}
                            </button>

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
                                ) : (
                                    <>
                                        <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Sign in</Link>
                                        <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg shadow hover:shadow-md transition">Sign up</Link>
                                    </>
                                )}
                            </div>

                            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* SECONDARY NAVBAR - With working dropdowns */}
            <div className={`hidden lg:block bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-all duration-300 ${scrolled ? 'max-h-0 py-0 opacity-0 overflow-hidden' : 'max-h-20 py-2.5 opacity-100'}`}>
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

                        {/* Markets button */}
                        <Link href="/markets" className="px-4 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow hover:shadow-md transition">
                            Markets
                        </Link>

                        {/* Booyah button */}
                        <Link href="/booyah" className="px-4 py-2 rounded-lg font-bold text-sm text-white bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 shadow hover:shadow-md transition">
                            Booyah
                        </Link>

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
                <div className="lg:hidden fixed inset-0 top-14 z-40 bg-white dark:bg-slate-900 overflow-auto">
                    <div className="p-4 space-y-4">
                        <button className="w-full flex items-center gap-3 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500">
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
                                    {pillarsItems.map((item) => (
                                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                            <item.icon size={16} className="text-slate-500" />
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <Link href="/markets" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-white bg-gradient-to-br from-blue-600 to-purple-600 shadow">
                                Markets Dashboard
                            </Link>

                            <Link href="/booyah" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-white bg-gradient-to-br from-green-500 to-emerald-600 shadow">
                                Booyah
                            </Link>

                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                <div className="text-xs uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-2">
                                    <Wrench size={14} /> Tools
                                </div>
                                <div className="space-y-1">
                                    {toolsItems.map((item) => (
                                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm">
                                            <item.icon size={16} className="text-slate-500" />
                                            {item.label}
                                        </Link>
                                    ))}
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
                                    {resourcesItems.map((item) => (
                                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm">
                                            <item.icon size={16} className="text-slate-500" />
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                            <div className="flex gap-3">
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 py-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 font-medium">Sign in</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 py-3 text-center rounded-xl text-white bg-gradient-to-r from-emerald-500 to-cyan-500 font-medium">Sign up</Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
