'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import TickerTape from '@/components/layout/TickerTape';
import Footer from '@/components/layout/Footer';
import ForexChart from '@/components/forex/ForexChart';
import CurrencyStrength from '@/components/forex/CurrencyStrength';
import ForexConverter from '@/components/forex/ForexConverter';
import ForexTable from '@/components/forex/ForexTable';
import VendorDeals from '@/components/forex/VendorDeals';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { AIWidget } from '@/components/ai';
import RelatedTools from '@/components/tools/RelatedTools';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback } from 'react';

function ForexPageContent() {
    const searchParams = useSearchParams();
    const pairParam = searchParams.get('pair');
    const [currentPair, setCurrentPair] = useState('EURUSD');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = useCallback(() => {
        setRefreshKey(k => k + 1);
        window.location.reload();
    }, []);

    useEffect(() => {
        if (pairParam) {
            setCurrentPair(pairParam.toUpperCase());
        }
    }, [pairParam]);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[120px] lg:pt-[170px] p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 min-w-0 w-full">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                                <span className="p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                    <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                                </span>
                                <span className="truncate">Global Forex Markets</span>
                            </h1>
                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 sm:mt-2">
                                Real-time exchange rates, interactive charts, and instant currency conversion.
                            </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm font-medium text-sm"
                            >
                                <RefreshCw size={16} /> Refresh Rates
                            </button>
                        </div>
                    </div>

                    {/* Main Grid: Chart + Converter */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0 w-full">
                        <div className="lg:col-span-2 min-w-0 overflow-hidden space-y-4 sm:space-y-6">
                            <ForexChart pair={currentPair} onPairChange={setCurrentPair} />
                            <CurrencyStrength />
                        </div>
                        <div className="lg:col-span-1 space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
                            <ForexConverter initialFrom={currentPair.slice(0, 3)} initialTo={currentPair.slice(3)} />
                            <VendorDeals />
                            <RelatedTools category="Utilities" title="Forex Tools &amp; Converters" />
                        </div>
                    </div>

                    {/* Rates Table */}
                    <div className="min-w-0 w-full overflow-hidden">
                        <ForexTable />
                    </div>

                    {/* Market Analysis / News Placeholder */}
                    <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-lg sm:text-2xl font-bold mb-2">Foreign Exchange Insights</h2>
                            <p className="opacity-90 mb-4 sm:mb-6 text-sm sm:text-base">
                                Get artificial intelligence powered analysis on major currency pairs. Our AI analyzes technical indicators, news sentiment, and macroeconomic data.
                            </p>
                            <button
                                onClick={() => {
                                    // Trigger the floating AI widget
                                    const aiBtn = document.querySelector('[data-ai-trigger]') as HTMLButtonElement;
                                    if (aiBtn) aiBtn.click();
                                    else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                }}
                                className="px-4 sm:px-6 py-2 bg-white text-emerald-600 rounded-lg font-bold hover:bg-emerald-50 transition shadow-lg text-sm sm:text-base"
                            >
                                Ask AI Assistant
                            </button>
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5 skew-x-12 transform translate-x-20"></div>
                    </div>
                </div>

                <Footer />
            </main>

            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="forex"
                quickPrompts={["EUR/USD analysis", "Forex forecast", "Safe haven currencies"]}
            />
        </div>
    );
}

export default function ForexPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">Loading...</div>}>
            <ForexPageContent />
        </Suspense>
    );
}
