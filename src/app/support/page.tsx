'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, MessageSquare, Mail, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';

const supportCategories = [
    {
        title: 'Getting Started',
        icon: HelpCircle,
        color: 'from-blue-500 to-indigo-500',
        articles: [
            { title: 'How to create an account', href: '/faq' },
            { title: 'Setting up your profile', href: '/faq' },
            { title: 'Navigating the dashboard', href: '/faq' },
        ]
    },
    {
        title: 'Account & Billing',
        icon: FileText,
        color: 'from-emerald-500 to-teal-500',
        articles: [
            { title: 'Managing your subscription', href: '/faq' },
            { title: 'Payment methods', href: '/faq' },
            { title: 'Refund policy', href: '/faq' },
        ]
    },
    {
        title: 'Trading & Investing',
        icon: MessageSquare,
        color: 'from-purple-500 to-pink-500',
        articles: [
            { title: 'Understanding market data', href: '/faq' },
            { title: 'Using the portfolio tracker', href: '/faq' },
            { title: 'Financial calculators guide', href: '/tools' },
        ]
    },
];

const contactMethods = [
    {
        title: 'Email Support',
        description: 'Get help via email within 24 hours',
        icon: Mail,
        action: 'support@pearto.com',
        href: 'mailto:support@pearto.com',
    },
    {
        title: 'FAQ',
        description: 'Find answers to common questions',
        icon: HelpCircle,
        action: 'Browse FAQ',
        href: '/faq',
    },
];

export default function SupportPage() {
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
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <HelpCircle className="w-8 h-8 text-amber-500" />
                                Help & Support
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Find answers, guides, and get in touch with our team
                            </p>
                        </div>

                        {/* Contact Methods */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {contactMethods.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <Link
                                        key={method.title}
                                        href={method.href}
                                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                                <Icon size={24} className="text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{method.title}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{method.description}</p>
                                                <span className="inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 font-medium mt-2 group-hover:underline">
                                                    {method.action} <ExternalLink size={14} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Help Categories */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Browse Help Topics</h2>

                            {supportCategories.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <div key={category.title} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                                                <Icon size={18} className="text-white" />
                                            </div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{category.title}</h3>
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {category.articles.map((article) => (
                                                <Link
                                                    key={article.title}
                                                    href={article.href}
                                                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                                                >
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">{article.title}</span>
                                                    <ChevronRight size={16} className="text-slate-400" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
