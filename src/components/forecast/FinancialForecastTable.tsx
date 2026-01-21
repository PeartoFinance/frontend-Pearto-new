'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

interface EarningsEstimate {
    fiscalYear: string;
    revenueEstimate?: number | null;
    revenueLow?: number | null;
    revenueHigh?: number | null;
    revenueAvg?: number | null;
    revenueGrowth?: number | null;
    epsEstimate?: number | null;
    epsLow?: number | null;
    epsHigh?: number | null;
    epsAvg?: number | null;
    epsGrowth?: number | null;
}

interface FinancialForecastTableProps {
    annual: EarningsEstimate[];
    quarterly: EarningsEstimate[];
}

type PeriodType = 'annual' | 'quarterly';

export function FinancialForecastTable({ annual, quarterly }: FinancialForecastTableProps) {
    const [periodType, setPeriodType] = useState<PeriodType>('annual');

    const data = periodType === 'annual' ? annual : quarterly;

    const formatLargeNumber = (num: number | null | undefined): string => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toLocaleString();
    };

    const formatGrowth = (growth: number | null | undefined): { value: string; isPositive: boolean } => {
        if (growth == null) return { value: '-', isPositive: true };
        const percent = (growth * 100).toFixed(2);
        return {
            value: `${growth >= 0 ? '+' : ''}${percent}%`,
            isPositive: growth >= 0,
        };
    };

    const formatEps = (eps: number | null | undefined): string => {
        if (eps == null) return '-';
        return eps.toFixed(2);
    };

    // Get the first two years and show "Pro" lock for rest
    const visibleData = data.slice(0, 6);
    const hasMore = data.length > 2;

    const rows = [
        {
            label: 'Revenue',
            icon: null,
            getValue: (e: EarningsEstimate) => formatLargeNumber(e.revenueAvg || e.revenueEstimate),
        },
        {
            label: 'Revenue Growth',
            icon: null,
            getValue: (e: EarningsEstimate) => e.revenueGrowth,
            isGrowth: true,
        },
        {
            label: 'EPS',
            icon: null,
            getValue: (e: EarningsEstimate) => formatEps(e.epsAvg || e.epsEstimate),
        },
        {
            label: 'EPS Growth',
            icon: null,
            getValue: (e: EarningsEstimate) => e.epsGrowth,
            isGrowth: true,
        },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Financial Forecast
                </h3>

                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setPeriodType('annual')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${periodType === 'annual'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Annual
                        </button>
                        <button
                            onClick={() => setPeriodType('quarterly')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${periodType === 'quarterly'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Quarterly
                        </button>
                    </div>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                    No earnings estimates available
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                                    Fiscal Year
                                </th>
                                {visibleData.map((e, idx) => (
                                    <th
                                        key={e.fiscalYear}
                                        className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400"
                                    >
                                        {e.fiscalYear}
                                        {idx >= 2 && (
                                            <Lock size={12} className="inline ml-1 text-amber-500" />
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {rows.map((row) => (
                                <tr key={row.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                                        {row.label}
                                    </td>
                                    {visibleData.map((e, idx) => {
                                        const value = row.getValue(e);
                                        if (row.isGrowth) {
                                            const growth = formatGrowth(value as number | null);
                                            return (
                                                <td
                                                    key={e.fiscalYear}
                                                    className={`px-4 py-3 text-right font-medium ${growth.isPositive
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                        }`}
                                                >
                                                    {idx >= 2 ? (
                                                        <span className="text-slate-400 flex items-center justify-end gap-1">
                                                            Pro <Lock size={12} />
                                                        </span>
                                                    ) : growth.value}
                                                </td>
                                            );
                                        }
                                        return (
                                            <td
                                                key={e.fiscalYear}
                                                className="px-4 py-3 text-right text-slate-700 dark:text-slate-300"
                                            >
                                                {idx >= 2 ? (
                                                    <span className="text-slate-400 flex items-center justify-end gap-1">
                                                        Pro <Lock size={12} />
                                                    </span>
                                                ) : value}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default FinancialForecastTable;
