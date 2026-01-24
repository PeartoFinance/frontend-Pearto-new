'use client';

import { useState, useEffect } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Globe, Monitor, Smartphone, Laptop, Copy, Check } from 'lucide-react';

interface ParsedUA {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
    isMobile: boolean;
}

export default function UserAgentParser() {
    const [userAgent, setUserAgent] = useState('');
    const [parsed, setParsed] = useState<ParsedUA | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Load current browser's UA on mount
        if (typeof navigator !== 'undefined') {
            setUserAgent(navigator.userAgent);
        }
    }, []);

    useEffect(() => {
        if (userAgent) {
            parseUA(userAgent);
        }
    }, [userAgent]);

    const parseUA = (ua: string) => {
        // Browser detection
        let browser = 'Unknown';
        let browserVersion = '';

        if (ua.includes('Firefox/')) {
            browser = 'Firefox';
            browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
        } else if (ua.includes('Edg/')) {
            browser = 'Edge';
            browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
        } else if (ua.includes('Chrome/')) {
            browser = 'Chrome';
            browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
        } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
            browser = 'Safari';
            browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || '';
        } else if (ua.includes('Opera') || ua.includes('OPR/')) {
            browser = 'Opera';
            browserVersion = ua.match(/(?:Opera|OPR)\/([\d.]+)/)?.[1] || '';
        }

        // OS detection
        let os = 'Unknown';
        let osVersion = '';

        if (ua.includes('Windows NT')) {
            os = 'Windows';
            const ntVersion = ua.match(/Windows NT ([\d.]+)/)?.[1];
            const versions: Record<string, string> = {
                '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista'
            };
            osVersion = versions[ntVersion || ''] || ntVersion || '';
        } else if (ua.includes('Mac OS X')) {
            os = 'macOS';
            osVersion = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
        } else if (ua.includes('Android')) {
            os = 'Android';
            osVersion = ua.match(/Android ([\d.]+)/)?.[1] || '';
        } else if (ua.includes('iPhone') || ua.includes('iPad')) {
            os = 'iOS';
            osVersion = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
        } else if (ua.includes('Linux')) {
            os = 'Linux';
        }

        // Device detection
        let device = 'Desktop';
        const isMobile = /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);

        if (ua.includes('iPhone')) device = 'iPhone';
        else if (ua.includes('iPad')) device = 'iPad';
        else if (ua.includes('Android') && ua.includes('Mobile')) device = 'Android Phone';
        else if (ua.includes('Android')) device = 'Android Tablet';
        else if (isMobile) device = 'Mobile';

        setParsed({ browser, browserVersion, os, osVersion, device, isMobile });
    };

    const copyUA = async () => {
        await navigator.clipboard.writeText(userAgent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const DeviceIcon = () => {
        if (!parsed) return <Globe className="w-8 h-8 text-slate-400" />;
        if (parsed.device.includes('Phone') || parsed.device === 'iPhone')
            return <Smartphone className="w-8 h-8 text-emerald-500" />;
        if (parsed.device.includes('Tablet') || parsed.device === 'iPad')
            return <Laptop className="w-8 h-8 text-blue-500" />;
        return <Monitor className="w-8 h-8 text-purple-500" />;
    };

    return (
        <CalculatorLayout
            title="User Agent Parser"
            description="Parse and analyze browser user agent strings"
            category="Data & Code"
            results={
                <div className="space-y-4">
                    {parsed ? (
                        <>
                            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                                <DeviceIcon />
                                <p className="text-lg font-bold text-slate-900 dark:text-white mt-3">
                                    {parsed.browser} {parsed.browserVersion}
                                </p>
                                <p className="text-sm text-slate-500">
                                    on {parsed.os} {parsed.osVersion}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Browser</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">{parsed.browser}</p>
                                    <p className="text-xs text-slate-400">v{parsed.browserVersion}</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Operating System</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">{parsed.os}</p>
                                    <p className="text-xs text-slate-400">{parsed.osVersion}</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Device Type</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">{parsed.device}</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Platform</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">
                                        {parsed.isMobile ? 'Mobile' : 'Desktop'}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">Enter a user agent string to parse</p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            User Agent String
                        </label>
                        <button
                            onClick={copyUA}
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <textarea
                        value={userAgent}
                        onChange={(e) => setUserAgent(e.target.value)}
                        placeholder="Paste a user agent string..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono text-xs resize-none"
                    />
                </div>

                <button
                    onClick={() => {
                        if (typeof navigator !== 'undefined') {
                            setUserAgent(navigator.userAgent);
                        }
                    }}
                    className="w-full px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition"
                >
                    Use Current Browser
                </button>
            </div>
        </CalculatorLayout>
    );
}
