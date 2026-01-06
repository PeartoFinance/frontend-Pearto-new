'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BulkTransactions from '@/components/widgets/BulkTransactions';
import ProposedDividends from '@/components/widgets/ProposedDividends';
import PublicOfferings from '@/components/widgets/PublicOfferings';
import MarketOverview from '@/components/widgets/MarketOverview';
import { BarChart2, TrendingUp, Activity, DollarSign } from 'lucide-react';

export default function MarketPage() {
    return (
        <div className="flex h-screen bg-white dark:bg-black overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                {/* Market Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
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
                                <p className="text-sm font-medium">Just now</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-4 flex gap-2 overflow-x-auto">
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
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-neutral-950">
                    <div className="max-w-7xl mx-auto space-y-6">
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
                </main>
            </div>
        </div>
    );
}
