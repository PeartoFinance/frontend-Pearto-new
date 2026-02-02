'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    ChevronUp,
} from 'lucide-react';

interface FooterLink {
    href: string;
    label: string;
    external?: boolean;
}

interface FooterSection {
    title: string;
    links: FooterLink[];
}

interface SocialLink {
    icon: React.ElementType;
    href: string;
    label: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.pearto.com/api';

export default function Footer() {
    const { t } = useTranslation();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [customPages, setCustomPages] = useState<FooterLink[]>([]);

    // Fetch footer pages from API
    useEffect(() => {
        const fetchFooterPages = async () => {
            try {
                const userCountry = typeof window !== 'undefined' ? localStorage.getItem('userCountry') || 'US' : 'US';
                const res = await fetch(`${API_BASE}/pages?placement=footer&status=published`, {
                    headers: { 'X-User-Country': userCountry }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.pages) {
                        setCustomPages(data.pages.map((p: { slug: string; title: string }) => ({
                            href: `/p/${p.slug}`,
                            label: p.title
                        })));
                    }
                }
            } catch {
                // Fallback to static pages
            }
        };
        fetchFooterPages();
    }, []);

    // Handle scroll to top button visibility
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const socialLinks: SocialLink[] = [
        { icon: Facebook, href: 'https://facebook.com/peartofinance', label: 'Facebook' },
        { icon: Twitter, href: 'https://twitter.com/peartofinance', label: 'Twitter' },
        { icon: Instagram, href: 'https://instagram.com/peartofinance', label: 'Instagram' },
        { icon: Linkedin, href: 'https://linkedin.com/company/peartofinance', label: 'LinkedIn' },
        { icon: Youtube, href: 'https://youtube.com/@peartofinance', label: 'YouTube' },
    ];

    const sections: FooterSection[] = [
        {
            title: 'Markets',
            links: [
                { href: '/stocks', label: 'Stocks' },
                { href: '/crypto', label: 'Cryptocurrency' },
                { href: '/forex', label: 'Forex' },
                { href: '/markets', label: 'Market Overview' },
            ],
        },
        {
            title: 'Resources',
            links: [
                { href: '/tools', label: 'Financial Tools' },
                { href: '/learn', label: 'Learn Investing' },
                { href: '/news', label: 'Market News' },
                { href: '/glossary', label: 'Glossary' },
            ],
        },
        {
            title: 'Company',
            links: [
                { href: '/p/about', label: 'About Us' },
                { href: '/p/contact', label: 'Contact' },
                { href: '/p/careers', label: 'Careers' },
                { href: '/p/press', label: 'Press' },
                ...customPages,
            ],
        },
        {
            title: 'Legal',
            links: [
                { href: '/p/privacy', label: 'Privacy Policy' },
                { href: '/p/terms', label: 'Terms of Service' },
                { href: '/p/disclaimer', label: 'Disclaimer' },
                { href: '/p/cookies', label: 'Cookie Policy' },
            ],
        },
    ];

    return (
        <footer className="bg-slate-900 text-white relative">
            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-20 right-6 z-50 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1"
                    aria-label="Scroll to top"
                >
                    <ChevronUp size={24} />
                </button>
            )}

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                Pearto
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Your premier destination for real-time market data, investment tools, and financial insights.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3 pt-2">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-lg transition-colors"
                                        aria-label={social.label}
                                    >
                                        <Icon size={18} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Link Sections */}
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h3 className="font-semibold text-white mb-4">{section.title}</h3>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.href + link.label}>
                                        {link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-400 hover:text-emerald-400 text-sm flex items-center gap-1 transition-colors"
                                            >
                                                {link.label}
                                                <ExternalLink size={12} />
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-slate-400 hover:text-emerald-400 text-sm transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Contact Info */}
                <div className="mt-12 pt-8 border-t border-slate-800">
                    <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                        <a href="mailto:support@pearto.com" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                            <Mail size={16} />
                            support@pearto.com
                        </a>
                        <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                            <Phone size={16} />
                            +1 (234) 567-890
                        </a>
                        <span className="flex items-center gap-2">
                            <MapPin size={16} />
                            New York, NY
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} Pearto Finance. All rights reserved.
                    </p>
                    <div className="flex gap-4 text-sm text-slate-500">
                        <Link href="/p/privacy" className="hover:text-emerald-400 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/p/terms" className="hover:text-emerald-400 transition-colors">
                            Terms
                        </Link>
                        <Link href="/sitemap.xml" className="hover:text-emerald-400 transition-colors">
                            Sitemap
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
