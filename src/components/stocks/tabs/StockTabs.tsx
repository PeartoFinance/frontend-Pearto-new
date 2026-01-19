'use client';

import { LucideIcon, LayoutGrid, BarChart3, LineChart, Wallet, TrendingUp, Building2, Newspaper } from 'lucide-react';

export type TabId = 'overview' | 'financials' | 'history' | 'dividends' | 'forecast' | 'profile' | 'news';

interface Tab {
    id: TabId;
    label: string;
    icon: LucideIcon;
}

export const stockTabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'financials', label: 'Financials', icon: BarChart3 },
    { id: 'history', label: 'History', icon: LineChart },
    { id: 'dividends', label: 'Dividends', icon: Wallet },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: Building2 },
    { id: 'news', label: 'News', icon: Newspaper },
];

interface StockTabsProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export default function StockTabs({ activeTab, onTabChange }: StockTabsProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide">
                {stockTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${isActive
                                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
