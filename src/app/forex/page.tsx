'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import TickerTape from '@/components/layout/TickerTape';
import ForexChart from '@/components/forex/ForexChart';
import ForexConverter from '@/components/forex/ForexConverter';
import ForexTable from '@/components/forex/ForexTable';
import VendorDeals from '@/components/forex/VendorDeals';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { AIWidget } from '@/components/ai';

export default function ForexPage() {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[200px] md:pt-[220px] p-4 lg:p-6 space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <span className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp size={24} />
                                </span>
                                Global Forex Markets
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">
                                Real-time exchange rates, interactive charts, and instant currency conversion.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm font-medium">
                                <RefreshCw size={16} /> Refresh Rates
                            </button>
                        </div>
                    </div>

                    {/* Main Grid: Chart + Converter */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <ForexChart />
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <ForexConverter />
                            <VendorDeals />
                        </div>
                    </div>

                    {/* Rates Table */}
                    <ForexTable />

                    {/* Market Analysis / News Placeholder - can act as footer or upsell */}
                    <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-2xl font-bold mb-2">Foreign Exchange Insights</h2>
                            <p className="opacity-90 mb-6">
                                Get artificial intelligence powered analysis on major currency pairs. Our AI analyzes technical indicators, news sentiment, and macroeconomic data.
                            </p>
                            <button className="px-6 py-2 bg-white text-emerald-600 rounded-lg font-bold hover:bg-emerald-50 transition shadow-lg">
                                Ask AI Assistant
                            </button>
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5 skew-x-12 transform translate-x-20"></div>
                    </div>
                </div>
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
