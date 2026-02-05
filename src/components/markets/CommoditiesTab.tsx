'use client';

import { Commodity } from '@/services/marketService';
import { Loader2, Zap, Hammer, Wheat, Beef, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface CommoditiesTabProps {
    commodities: Commodity[];
    isLoading?: boolean;
}

export default function CommoditiesTab({ commodities = [], isLoading }: CommoditiesTabProps) {
    const getCategoryIcon = (category: string | undefined) => {
        switch (category?.toLowerCase()) {
            case 'energy': return <Zap className="text-yellow-500" size={18} />;
            case 'metals': return <Hammer className="text-slate-400" size={18} />;
            case 'agriculture': return <Wheat className="text-amber-500" size={18} />;
            case 'livestock': return <Beef className="text-red-400" size={18} />;
            default: return <Info className="text-blue-400" size={18} />;
        }
    };

    const categories = ['Energy', 'Metals', 'Agriculture', 'Livestock', 'Other'];

    // Group commodities by category logic
    const groupedCommodities: Record<string, Commodity[]> = {};

    // Initialize groups
    categories.forEach(c => groupedCommodities[c.toLowerCase()] = []);
    groupedCommodities['other'] = [];

    commodities.forEach((comm: any) => {
        // Try to determine category: use provided one, or infer from name
        let cat = comm.category?.toLowerCase();

        // If category is missing or 'other', try to infer
        if (!cat || cat === 'other') {
            if (['Gold', 'Silver', 'Copper', 'Platinum', 'Palladium'].some(n => comm.name.includes(n))) cat = 'metals';
            else if (['Oil', 'Gas', 'Brent', 'Gasoline'].some(n => comm.name.includes(n))) cat = 'energy';
            else if (['Corn', 'Wheat', 'Soy', 'Coffee', 'Sugar', 'Cotton', 'Cocoa'].some(n => comm.name.includes(n))) cat = 'agriculture';
            else if (['Cattle', 'Hog'].some(n => comm.name.includes(n))) cat = 'livestock';
            else cat = 'other';
        }

        if (groupedCommodities[cat]) {
            groupedCommodities[cat].push(comm);
        } else {
            groupedCommodities['other'].push(comm);
        }
    });

    const renderCommodityRow = (item: Commodity) => {
        const isPositive = item.change >= 0;
        return (
            <div key={item.symbol} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                        {item.symbol.substring(0, 2)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-lg">{item.name}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{item.symbol}</span>
                            {item.unit && <span>Per {item.unit}</span>}
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {item.currency === 'USD' ? '$' : ''}{(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </div>
                    <div className={`flex items-center justify-end gap-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{isPositive ? '+' : ''}{(item.change || 0).toFixed(2)}</span>
                        <span>({isPositive ? '+' : ''}{(item.changePercent || 0).toFixed(2)}%)</span>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading && commodities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 size={32} className="animate-spin mb-4" />
                <p>Loading commodities...</p>
            </div>
        );
    }

    if (!isLoading && commodities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Info size={32} className="mb-4 text-slate-300 dark:text-slate-600" />
                <p>No commodities available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {categories.map(category => {
                const items = groupedCommodities[category.toLowerCase()];
                if (!items || items.length === 0) return null;

                return (
                    <div key={category}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                            {getCategoryIcon(category)} {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map(renderCommodityRow)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
