'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
    const { t } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Handle dark mode - check localStorage and sync state
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Default to dark for finance website
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark) || (!savedTheme);

        setIsDarkMode(shouldBeDark);
        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Handle scroll for secondary navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
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

    return (
        <>
            {/* PRIMARY NAVBAR - Always visible */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="px-4 lg:px-6">
                    <div className="flex items-center justify-between h-14 gap-4">
                        {/* Left: Logo (mobile only, sidebar shows on desktop) */}
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
                                <span className="flex-1 text-left truncate">{t('nav.search', 'Search...')}</span>
                                <kbd className="hidden lg:inline-flex px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-[10px]">/</kbd>
                            </button>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 lg:gap-3">
                            {/* Mobile search button */}
                            <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <Search size={20} className="text-slate-600 dark:text-slate-300" />
                            </button>

                            {/* Dark mode toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? (
                                    <Sun size={20} className="text-amber-400" />
                                ) : (
                                    <Moon size={20} className="text-slate-700" />
                                )}
                            </button>

                            {/* AI Button */}
                            <Link
                                href="/ai"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 shadow hover:shadow-md transition"
                            >
                                <Sparkles size={16} />
                                AI
                            </Link>

                            {/* Notifications */}
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
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">
                                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-sm font-medium text-slate-700 dark:text-white">
                                                {user?.name?.split(' ')[0]}
                                            </span>
                                            <ChevronDown size={14} className="text-slate-500" />
                                        </button>

                                        {/* User Dropdown Menu */}
                                        {userMenuOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50">
                                                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                                </div>
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <User size={16} />
                                                    My Profile
                                                </Link>
                                                <Link
                                                    href="/portfolio"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <Wallet size={16} />
                                                    Portfolio
                                                </Link>
                                                <Link
                                                    href="/settings"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <Settings size={16} />
                                                    Settings
                                                </Link>
                                                <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                                                    <button
                                                        onClick={() => { logout(); setUserMenuOpen(false); }}
                                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <LogOut size={16} />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                        >
                                            Sign in
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg shadow hover:shadow-md transition"
                                        >
                                            Sign up
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* SECONDARY NAVBAR - Hides on scroll */}
            <div
                className={`hidden lg:block bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-all duration-300 ${scrolled ? 'max-h-0 py-0 opacity-0 overflow-hidden' : 'max-h-20 py-2.5 opacity-100'
                    }`}
            >
                <div className="px-4 lg:px-6">
                    <div className="flex items-center justify-center gap-3">
                        {/* Pillars dropdown */}
                        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition">
                            <Layers size={14} className="opacity-70" />
                            <span>Pillars</span>
                            <ChevronDown size={14} className="opacity-70" />
                        </button>

                        {/* Markets button */}
                        <Link
                            href="/markets"
                            className="px-4 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow hover:shadow-md transition"
                        >
                            Markets
                        </Link>

                        {/* Booyah button */}
                        <Link
                            href="/booyah"
                            className="px-4 py-2 rounded-lg font-bold text-sm text-white bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 shadow hover:shadow-md transition"
                        >
                            Booyah
                        </Link>

                        {/* Tools dropdown */}
                        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition">
                            <Wrench size={14} className="opacity-70" />
                            <span>Tools</span>
                            <ChevronDown size={14} className="opacity-70" />
                        </button>

                        {/* Resources dropdown */}
                        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition">
                            <BookOpen size={14} className="opacity-70" />
                            <span>Resources</span>
                            <ChevronDown size={14} className="opacity-70" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 top-14 z-40 bg-white dark:bg-slate-900 overflow-auto">
                    <div className="p-4 space-y-4">
                        {/* Mobile search */}
                        <button className="w-full flex items-center gap-3 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500">
                            <Search size={18} />
                            <span>Search stocks, crypto...</span>
                        </button>

                        {/* AI button */}
                        <Link
                            href="/ai"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 shadow"
                        >
                            <Sparkles size={18} />
                            AI Assistant
                        </Link>

                        {/* Navigation sections */}
                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                <div className="text-xs uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-2">
                                    <Layers size={14} /> Pillars
                                </div>
                                <div className="space-y-1">
                                    {['Stocks', 'Crypto', 'Forex', 'Commodities'].map((item) => (
                                        <Link
                                            key={item}
                                            href={`/${item.toLowerCase()}`}
                                            onClick={() => setMobileOpen(false)}
                                            className="block py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                        >
                                            {item}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href="/markets"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-white bg-gradient-to-br from-blue-600 to-purple-600 shadow"
                            >
                                Markets Dashboard
                            </Link>

                            <Link
                                href="/booyah"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-white bg-gradient-to-br from-green-500 to-emerald-600 shadow"
                            >
                                Booyah
                            </Link>

                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                <div className="text-xs uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-2">
                                    <Wrench size={14} /> Tools
                                </div>
                                <div className="space-y-1">
                                    {['SIP Calculator', 'EMI Calculator', 'Tax Calculator', 'Retirement Planner'].map((item) => (
                                        <Link
                                            key={item}
                                            href="/tools"
                                            onClick={() => setMobileOpen(false)}
                                            className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm"
                                        >
                                            {item}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Auth section */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                            <div className="flex gap-3">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex-1 py-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex-1 py-3 text-center rounded-xl text-white bg-gradient-to-r from-emerald-500 to-cyan-500 font-medium"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
