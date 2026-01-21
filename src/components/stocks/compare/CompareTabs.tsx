'use client';

import { LucideIcon, LayoutGrid, BarChart3, CandlestickChart, TrendingUp, Building2 } from 'lucide-react';

export type CompareTabId = 'overview' | 'chart' | 'financials' | 'forecast' | 'profile';

interface Tab {
    id: CompareTabId;
    label: string;
    icon: LucideIcon;
}

export const compareTabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'chart', label: 'Chart', icon: CandlestickChart },
    { id: 'financials', label: 'Financials', icon: BarChart3 },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: Building2 },
];

interface CompareTabsProps {
    activeTab: CompareTabId;
    onTabChange: (tab: CompareTabId) => void;
}

export default function CompareTabs({ activeTab, onTabChange }: CompareTabsProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide">
                {compareTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${isActive
                                ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20'
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
