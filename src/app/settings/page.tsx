'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Bell, Globe, Palette, Shield, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/layout/Footer';

const settingsSections = [
    {
        title: 'Account',
        items: [
            { name: 'Profile', description: 'Update your personal information', icon: User, href: '/profile?tab=overview' },
            { name: 'Notifications', description: 'Manage your notification preferences', icon: Bell, href: '/profile?tab=notifications' },
            { name: 'Security', description: 'Password and authentication', icon: Shield, href: '/profile?tab=security' },
        ]
    },
    {
        title: 'Preferences',
        items: [
            { name: 'Language & Region', description: 'Set your language and timezone', icon: Globe, href: '/profile?tab=preferences' },
            { name: 'Appearance', description: 'Theme and display settings', icon: Palette, href: '/profile?tab=preferences' },
        ]
    },
    {
        title: 'Billing',
        items: [
            { name: 'Subscription', description: 'Manage your subscription plan', icon: CreditCard, href: '/profile?tab=subscription' }, // Updated to profile tab
        ]
    },
];

export default function SettingsPage() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] p-4 lg:p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-2 transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Manage your account settings and preferences
                            </p>
                        </div>

                        {/* Settings Sections */}
                        {settingsSections.map((section) => (
                            <div key={section.title} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                    <h2 className="font-semibold text-slate-900 dark:text-white">{section.title}</h2>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {section.items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                                        <Icon size={20} className="text-slate-600 dark:text-slate-300" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={20} className="text-slate-400" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Sign Out Button */}
                        {isAuthenticated && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <button
                                    onClick={() => logout()}
                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                            <LogOut size={20} className="text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-red-600 dark:text-red-400">Sign Out</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Sign out of your account</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
              <Footer />
      </main>
        </div>
    );
}
