'use client';

import { useState, useEffect } from 'react';
import { X, Smartphone, Globe, ChevronRight, Download } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import Image from 'next/image';

interface MobileAppPromptProps {
    appName?: string;
    iosAppUrl?: string;
    androidAppUrl?: string;
    appIconUrl?: string;
}

const STORAGE_KEY = 'pearto_mobile_prompt_dismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function MobileAppPrompt({
    appName = 'Pearto Finance',
    iosAppUrl = 'https://apps.apple.com/app/pearto-finance',
    androidAppUrl = 'https://play.google.com/store/apps/details?id=com.pearto.finance',
    appIconUrl = '/logo.png'
}: MobileAppPromptProps) {
    const { isMobile, isIOS, isAndroid } = useDeviceDetection();
    const [isVisible, setIsVisible] = useState(false);
    const [showFullModal, setShowFullModal] = useState(false);

    useEffect(() => {
        // Check if user has dismissed the prompt recently
        const dismissedAt = localStorage.getItem(STORAGE_KEY);
        if (dismissedAt) {
            const dismissedTime = parseInt(dismissedAt, 10);
            if (Date.now() - dismissedTime < DISMISS_DURATION) {
                return; // Still within dismiss period
            }
        }

        // Show prompt only on mobile devices
        if (isMobile) {
            // Delay showing to let page load first
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isMobile]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
    };

    const handleContinueInWeb = () => {
        handleDismiss();
    };

    const handleOpenApp = () => {
        const appUrl = isIOS ? iosAppUrl : androidAppUrl;
        window.location.href = appUrl;
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Bottom Banner - Similar to Facebook */}
            {!showFullModal && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-full duration-500">
                    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-2xl">
                        <div className="max-w-lg mx-auto px-4 py-3">
                            <div className="flex items-center gap-3">
                                {/* App Icon */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                                    {appIconUrl ? (
                                        <img src={appIconUrl} alt={appName} className="w-10 h-10 rounded-lg" />
                                    ) : (
                                        <Smartphone className="w-6 h-6 text-white" />
                                    )}
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{appName}</p>
                                    <p className="text-xs text-slate-500">Get the best experience in our app</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleContinueInWeb}
                                        className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                                    >
                                        Not now
                                    </button>
                                    <button
                                        onClick={() => setShowFullModal(true)}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-full transition flex items-center gap-1"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Use App
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Modal */}
            {showFullModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 px-6 py-8 text-center">
                            <button
                                onClick={handleDismiss}
                                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-20 h-20 mx-auto rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4">
                                {appIconUrl ? (
                                    <img src={appIconUrl} alt={appName} className="w-16 h-16" />
                                ) : (
                                    <Smartphone className="w-10 h-10 text-emerald-600" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{appName}</h2>
                            <p className="text-sm text-white/80">Your complete financial companion</p>
                        </div>

                        {/* Features */}
                        <div className="px-6 py-6 space-y-4">
                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <span className="text-emerald-600 dark:text-emerald-400">⚡</span>
                                </div>
                                <span className="text-sm">Faster performance & smoother experience</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-400">🔔</span>
                                </div>
                                <span className="text-sm">Real-time price alerts & notifications</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <span className="text-purple-600 dark:text-purple-400">🔒</span>
                                </div>
                                <span className="text-sm">Biometric login & enhanced security</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-8 space-y-3">
                            <button
                                onClick={handleOpenApp}
                                className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition hover:opacity-90 flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download {isIOS ? 'from App Store' : isAndroid ? 'from Play Store' : 'App'}
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleContinueInWeb}
                                className="w-full py-3 text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center gap-2"
                            >
                                <Globe className="w-4 h-4" />
                                Continue in browser
                            </button>
                        </div>

                        {/* Store badges hint */}
                        <div className="pb-6 text-center">
                            <p className="text-[10px] text-slate-400">
                                Available on iOS & Android
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default MobileAppPrompt;
