'use client';

import { useState, useEffect } from 'react';
import {
    Activity,
    TrendingUp,
    BarChart2,
    Waves,
    Settings2,
    Plus,
    X,
    ChevronDown,
    ChevronUp,
    Check,
    Search
} from 'lucide-react';

export interface IndicatorConfig {
    id: string;
    type: string;
    name: string;
    params: Record<string, number>;
    color: string;
    isActive: boolean;
}

interface IndicatorDefinition {
    id: string;
    name: string;
    category: 'trend' | 'momentum' | 'volatility' | 'volume';
    defaultParams: Record<string, number>;
    description: string;
}

interface IndicatorPanelProps {
    activeIndicators: IndicatorConfig[];
    onAddIndicator: (indicator: IndicatorConfig) => void;
    onRemoveIndicator: (indicatorId: string) => void;
    onUpdateIndicator: (indicatorId: string, params: Record<string, number>) => void;
    className?: string;
}

// Available indicators
const INDICATORS: IndicatorDefinition[] = [
    {
        id: 'sma',
        name: 'Simple Moving Average',
        category: 'trend',
        defaultParams: { period: 20 },
        description: 'Arithmetic mean of prices over a period'
    },
    {
        id: 'ema',
        name: 'Exponential Moving Average',
        category: 'trend',
        defaultParams: { period: 20 },
        description: 'Weighted moving average favoring recent prices'
    },
    {
        id: 'rsi',
        name: 'RSI',
        category: 'momentum',
        defaultParams: { period: 14 },
        description: 'Momentum oscillator (0-100)'
    },
    {
        id: 'macd',
        name: 'MACD',
        category: 'momentum',
        defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
        description: 'Trend-following momentum indicator'
    },
    {
        id: 'bollinger',
        name: 'Bollinger Bands',
        category: 'volatility',
        defaultParams: { period: 20, stdDev: 2 },
        description: 'Volatility bands above/below SMA'
    },
    {
        id: 'stochastic',
        name: 'Stochastic Oscillator',
        category: 'momentum',
        defaultParams: { kPeriod: 14, dPeriod: 3 },
        description: 'Compares closing price to price range'
    },
    {
        id: 'atr',
        name: 'Average True Range',
        category: 'volatility',
        defaultParams: { period: 14 },
        description: 'Volatility indicator'
    },
    {
        id: 'vwap',
        name: 'VWAP',
        category: 'volume',
        defaultParams: {},
        description: 'Volume-weighted average price'
    },
    {
        id: 'obv',
        name: 'On-Balance Volume',
        category: 'volume',
        defaultParams: {},
        description: 'Cumulative volume indicator'
    }
];

// Category icons and colors
const CATEGORY_CONFIG = {
    trend: { icon: TrendingUp, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    momentum: { icon: Activity, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    volatility: { icon: Waves, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    volume: { icon: BarChart2, color: 'text-green-400', bgColor: 'bg-green-500/10' }
};

// Indicator colors
const INDICATOR_COLORS = [
    '#2196F3', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0',
    '#00BCD4', '#CDDC39', '#FF5722', '#607D8B', '#795548'
];

export default function IndicatorPanel({
    activeIndicators,
    onAddIndicator,
    onRemoveIndicator,
    onUpdateIndicator,
    className = ''
}: IndicatorPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [editingIndicator, setEditingIndicator] = useState<string | null>(null);
    const [tempParams, setTempParams] = useState<Record<string, number>>({});

    // Filter indicators
    const filteredIndicators = INDICATORS.filter(ind => {
        const matchesSearch = ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ind.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || ind.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Handle adding indicator
    const handleAddIndicator = (definition: IndicatorDefinition) => {
        const existingCount = activeIndicators.filter(i => i.type === definition.id).length;
        const colorIndex = activeIndicators.length % INDICATOR_COLORS.length;

        const newIndicator: IndicatorConfig = {
            id: `${definition.id}-${Date.now()}`,
            type: definition.id,
            name: definition.name + (existingCount > 0 ? ` (${existingCount + 1})` : ''),
            params: { ...definition.defaultParams },
            color: INDICATOR_COLORS[colorIndex],
            isActive: true
        };

        onAddIndicator(newIndicator);
        setIsOpen(false);
    };

    // Start editing indicator
    const startEditing = (indicator: IndicatorConfig) => {
        setEditingIndicator(indicator.id);
        setTempParams({ ...indicator.params });
    };

    // Save indicator params
    const saveParams = (indicatorId: string) => {
        onUpdateIndicator(indicatorId, tempParams);
        setEditingIndicator(null);
        setTempParams({});
    };

    // Get indicator definition
    const getDefinition = (type: string) => INDICATORS.find(i => i.id === type);

    return (
        <div className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition"
            >
                <Activity size={14} />
                <span>Indicators</span>
                {activeIndicators.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {activeIndicators.length}
                    </span>
                )}
                <ChevronDown size={14} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-[100] overflow-hidden">
                    {/* Header */}
                    <div className="p-3 border-b border-slate-700">
                        <h3 className="font-semibold text-white mb-2">Technical Indicators</h3>

                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search indicators..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Category Filters */}
                        <div className="flex gap-2 mt-2">
                            {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition
                                            ${selectedCategory === cat
                                                ? `${config.bgColor} ${config.color}`
                                                : 'bg-slate-800 text-slate-400 hover:text-slate-300'}`}
                                    >
                                        <Icon size={12} />
                                        <span className="capitalize">{cat}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Indicators */}
                    {activeIndicators.length > 0 && (
                        <div className="p-3 border-b border-slate-700">
                            <h4 className="text-xs text-slate-500 uppercase font-medium mb-2">Active</h4>
                            <div className="space-y-2">
                                {activeIndicators.map(indicator => (
                                    <div
                                        key={indicator.id}
                                        className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: indicator.color }}
                                        />
                                        <span className="flex-1 text-sm text-white truncate">{indicator.name}</span>

                                        {/* Edit button */}
                                        {Object.keys(indicator.params).length > 0 && (
                                            <button
                                                onClick={() => startEditing(indicator)}
                                                className="p-1 hover:bg-slate-700 rounded transition"
                                            >
                                                <Settings2 size={12} className="text-slate-400" />
                                            </button>
                                        )}

                                        {/* Remove button */}
                                        <button
                                            onClick={() => onRemoveIndicator(indicator.id)}
                                            className="p-1 hover:bg-red-500/20 rounded transition"
                                        >
                                            <X size={12} className="text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Edit Params Modal */}
                    {editingIndicator && (
                        <div className="p-3 border-b border-slate-700 bg-slate-800/50">
                            <h4 className="text-sm font-medium text-white mb-2">
                                Edit Parameters
                            </h4>
                            <div className="space-y-2">
                                {Object.entries(tempParams).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <label className="text-xs text-slate-400 capitalize w-24">{key}:</label>
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={(e) => setTempParams({
                                                ...tempParams,
                                                [key]: parseFloat(e.target.value) || 0
                                            })}
                                            className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => setEditingIndicator(null)}
                                    className="flex-1 px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => saveParams(editingIndicator)}
                                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center justify-center gap-1"
                                >
                                    <Check size={14} />
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Available Indicators */}
                    <div className="max-h-64 overflow-y-auto p-3">
                        <h4 className="text-xs text-slate-500 uppercase font-medium mb-2">Add Indicator</h4>
                        <div className="space-y-1">
                            {filteredIndicators.map(indicator => {
                                const config = CATEGORY_CONFIG[indicator.category];
                                const Icon = config.icon;
                                const isActive = activeIndicators.some(i => i.type === indicator.id);

                                return (
                                    <button
                                        key={indicator.id}
                                        onClick={() => handleAddIndicator(indicator)}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition text-left group"
                                    >
                                        <div className={`p-1.5 rounded ${config.bgColor}`}>
                                            <Icon size={14} className={config.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-white">{indicator.name}</span>
                                                {isActive && (
                                                    <Check size={12} className="text-green-400" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">
                                                {indicator.description}
                                            </p>
                                        </div>
                                        <Plus size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-700 bg-slate-800/50">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
