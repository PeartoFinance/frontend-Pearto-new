'use client';

import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import BulkTransactions from '@/components/widgets/BulkTransactions';
import ProposedDividends from '@/components/widgets/ProposedDividends';
import PublicOfferings from '@/components/widgets/PublicOfferings';
import MarketOverview from '@/components/widgets/MarketOverview';
import { AIWidget } from '@/components/ai';

export default function MarketPage() {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Sidebar - Desktop Only */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header Section - Always visible */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                {/* Scrollable Content - with top padding for fixed header */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="p-4 lg:p-6 space-y-6 max-w-full">
                        {/* Market Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Markets</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Live market data and analytics</p>
                            </div>

                            {/* Quick Stats */}
                            <div className="hidden md:flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Market Open</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Just now</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {['Overview', 'Live Market', 'Floorsheet', 'Charts', 'Analysis'].map((tab, i) => (
                                <button
                                    key={tab}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${i === 0
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Market Overview */}
                        <MarketOverview />

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <BulkTransactions />
                            <ProposedDividends />
                        </div>

                        {/* Public Offerings - Full Width */}
                        <PublicOfferings />
                    </div>
                </div>
            </main>

            {/* Floating AI Widget */}
            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="markets"
                quickPrompts={["Top gainers today", "Market analysis"]}
            />
        </div>
    );
}
