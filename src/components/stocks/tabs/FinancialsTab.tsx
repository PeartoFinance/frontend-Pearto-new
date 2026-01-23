'use client';

import { useState, useEffect } from 'react';
import { Loader2, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface FinancialsTabProps {
    symbol: string;
}

type StatementType = 'income' | 'balance' | 'cash_flow' | 'ratios' | 'kpis';
type PeriodType = 'annual' | 'quarterly';

interface FinancialData {
    statementType: string;
    period: string;
    periods: string[];
    data: Record<string, (number | string | null)[]>;
    symbol?: string;
    currency?: string;
    error?: string;
}

interface RatiosData {
    statementType: string;
    data: Record<string, Record<string, number | string | null>>;
    error?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.71:5000/api';

export default function FinancialsTab({ symbol }: FinancialsTabProps) {
    const [data, setData] = useState<FinancialData | RatiosData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statementType, setStatementType] = useState<StatementType>('income');
    const [period, setPeriod] = useState<PeriodType>('annual');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${API_BASE}/stocks/financials/${symbol}/statements?statement_type=${statementType}&period=${period}`
                );
                if (!res.ok) throw new Error('Failed to fetch financial data');
                const json = await res.json();
                if (json.error) throw new Error(json.error);
                setData(json);
            } catch (e) {
                console.error('FinancialsTab error:', e);
                setError(e instanceof Error ? e.message : 'Failed to load financial data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [symbol, statementType, period]);

    const formatLargeNumber = (num: number | null): string => {
        if (num == null) return '-';
        const absNum = Math.abs(num);
        if (absNum >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (absNum >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (absNum >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (absNum >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    const formatValue = (val: number | string | null, label: string): string => {
        if (val == null) return '-';
        if (typeof val === 'string') return val; // Already formatted (like percentages)

        // EPS fields
        if (label.includes('EPS')) {
            return `$${val.toFixed(2)}`;
        }
        // Large numbers
        return formatLargeNumber(val);
    };

    const isGrowthValue = (label: string): boolean => {
        const growthLabels = ['Growth', 'Margin', 'Ratio', '%'];
        return growthLabels.some(g => label.includes(g));
    };

    const statementTabs: { key: StatementType; label: string }[] = [
        { key: 'income', label: 'Income' },
        { key: 'balance', label: 'Balance Sheet' },
        { key: 'cash_flow', label: 'Cash Flow' },
        { key: 'ratios', label: 'Ratios' },
        { key: 'kpis', label: 'KPIs' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Statement Type Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {statementTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setStatementType(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statementType === tab.key
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Period Toggle (not for ratios - they are real-time data) */}
            {statementType !== 'ratios' && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPeriod('annual')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === 'annual'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            Annual
                        </button>
                        <button
                            onClick={() => setPeriod('quarterly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === 'quarterly'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            Quarterly
                        </button>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        Financials in millions USD
                    </div>
                </div>
            )}

            {/* Financial Data Display */}
            {statementType === 'ratios' ? (
                <CategorizedRatiosDisplay data={data as RatiosData} formatLargeNumber={formatLargeNumber} />
            ) : (
                <StatementsTable data={data as FinancialData} formatValue={formatValue} isGrowthValue={isGrowthValue} />
            )}
        </div>
    );
}

// Multi-year statements table component
function StatementsTable({ data, formatValue, isGrowthValue }: {
    data: FinancialData | null;
    formatValue: (val: number | string | null, label: string) => string;
    isGrowthValue: (label: string) => boolean;
}) {
    if (!data || !data.periods || data.periods.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">No financial data available for this stock.</p>
            </div>
        );
    }

    const { periods, data: rowData } = data;
    const rows = Object.entries(rowData);

    // Group rows by category for better organization
    const incomeOrder = [
        'Revenue', 'Revenue Growth (YoY)', 'Cost of Revenue', 'Gross Profit', 'Gross Margin',
        'Selling, General & Admin', 'Research & Development', 'Operating Expenses', 'Operating Income', 'Operating Margin',
        'Interest Expense', 'Interest Income', 'Other Non-Operating Income', 'Pretax Income', 'Income Tax',
        'Net Income', 'Net Income to Common', 'Profit Margin',
        'EPS (Basic)', 'EPS (Diluted)', 'Shares Outstanding (Basic)', 'Shares Outstanding (Diluted)',
        'EBITDA', 'EBIT', 'Depreciation & Amortization'
    ];

    // Sort rows if income statement
    const sortedRows = data.statementType === 'income'
        ? rows.sort((a, b) => {
            const aIdx = incomeOrder.indexOf(a[0]);
            const bIdx = incomeOrder.indexOf(b[0]);
            if (aIdx === -1 && bIdx === -1) return 0;
            if (aIdx === -1) return 1;
            if (bIdx === -1) return -1;
            return aIdx - bIdx;
        })
        : rows;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-900 min-w-[200px]">
                                Metric
                            </th>
                            {periods.map((p, i) => (
                                <th key={i} className={`text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider min-w-[100px] ${p === 'TTM' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {p}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {sortedRows.map(([label, values]) => {
                            const isGrowth = isGrowthValue(label);
                            const isImportant = ['Revenue', 'Net Income', 'Operating Income', 'EBITDA', 'Free Cash Flow', 'Total Assets', "Shareholders' Equity"].includes(label);

                            return (
                                <tr key={label} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isImportant ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}>
                                    <td className={`px-4 py-2.5 text-sm sticky left-0 bg-white dark:bg-slate-800 ${isImportant ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {label}
                                    </td>
                                    {(values as (number | string | null)[]).map((val, i) => {
                                        const isTTM = periods[i] === 'TTM';
                                        const isNegative = typeof val === 'number' && val < 0;
                                        const isPositiveGrowth = typeof val === 'string' && val.includes('%') && !val.startsWith('-');
                                        const isNegativeGrowth = typeof val === 'string' && val.includes('%') && val.startsWith('-');

                                        return (
                                            <td
                                                key={i}
                                                className={`px-4 py-2.5 text-sm text-right font-mono ${isTTM ? 'bg-emerald-50/50 dark:bg-emerald-900/10 font-medium' : ''
                                                    } ${isNegative || isNegativeGrowth
                                                        ? 'text-red-500'
                                                        : isPositiveGrowth && isGrowth
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-slate-700 dark:text-slate-300'
                                                    }`}
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    {formatValue(val, label)}
                                                    {isGrowth && isPositiveGrowth && typeof val === 'string' && (
                                                        <ArrowUpRight className="w-3 h-3" />
                                                    )}
                                                    {isGrowth && isNegativeGrowth && typeof val === 'string' && (
                                                        <ArrowDownRight className="w-3 h-3" />
                                                    )}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Categorized ratios display (for both Ratios and KPIs)
function CategorizedRatiosDisplay({ data, formatLargeNumber }: {
    data: RatiosData | null;
    formatLargeNumber: (num: number | null) => string;
}) {
    if (!data || !data.data) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">No data available.</p>
            </div>
        );
    }

    const categories = Object.entries(data.data);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(([category, items]) => (
                <div key={category} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {category}
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {Object.entries(items as Record<string, number | string | null>).map(([item, value]) => {
                            if (value === null || value === undefined) return null;

                            const isLargeNum = ['Market Cap', 'Enterprise Value', 'Total Debt', 'Total Cash', 'Shares Outstanding', 'Float Shares', 'Float'].includes(item);
                            const displayValue = typeof value === 'number' && isLargeNum
                                ? formatLargeNumber(value)
                                : typeof value === 'number'
                                    ? value.toFixed(2)
                                    : value;

                            const isNegative = typeof value === 'string' && value.startsWith('-');
                            const isPositive = typeof value === 'string' && !value.startsWith('-') && value.includes('%');

                            return (
                                <div key={item} className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                                    <span className={`text-sm font-medium font-mono ${isNegative ? 'text-red-500' :
                                        isPositive ? 'text-emerald-600 dark:text-emerald-400' :
                                            'text-slate-900 dark:text-white'
                                        }`}>
                                        {displayValue}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
