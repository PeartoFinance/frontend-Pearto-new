'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getStockFinancials, type CompanyFinancial } from '@/services/marketService';
import type { MarketStock, PriceHistoryPoint } from '@/services/marketService';

interface CompareStock extends MarketStock {
    color: string;
    data: PriceHistoryPoint[];
}

interface CompareFinancialsTabProps {
    stocks: CompareStock[];
}

interface StockFinancials {
    symbol: string;
    color: string;
    financials: CompanyFinancial[];
}

export default function CompareFinancialsTab({ stocks }: CompareFinancialsTabProps) {
    const [stockFinancials, setStockFinancials] = useState<StockFinancials[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'annual' | 'quarterly'>('annual');

    useEffect(() => {
        const fetchFinancials = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    stocks.map(async (stock) => {
                        const financials = await getStockFinancials(stock.symbol, period);
                        return { symbol: stock.symbol, color: stock.color, financials };
                    })
                );
                setStockFinancials(results);
            } catch (err) {
                console.error('Failed to load financials:', err);
            } finally {
                setLoading(false);
            }
        };

        if (stocks.length > 0) {
            fetchFinancials();
        }
    }, [stocks, period]);

    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        return num.toLocaleString();
    };

    const formatPercent = (num: number | null | undefined) => {
        if (num == null) return '-';
        return `${(num * 100).toFixed(2)}%`;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    // Get metrics to compare - using actual API field names
    const metrics = [
        { label: 'Revenue', key: 'revenue' },
        { label: 'Gross Profit', key: 'grossProfit' },
        { label: 'Operating Income', key: 'operatingIncome' },
        { label: 'Net Income', key: 'netIncome' },
        { label: 'EBITDA', key: 'ebitda' },
        { label: 'Total Assets', key: 'totalAssets' },
        { label: 'Total Liabilities', key: 'totalLiabilities' },
        { label: 'Total Equity', key: 'totalEquity' },
        { label: 'Operating Cash Flow', key: 'operatingCashFlow' },
        { label: 'Free Cash Flow', key: 'freeCashFlow' },
    ];

    return (
        <div className="space-y-5">
            {/* Period Toggle */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-500">Period:</span>
                    <div className="flex gap-1">
                        {(['annual', 'quarterly'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${period === p
                                    ? 'bg-teal-600 text-white'
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Financial Comparison (Latest {period === 'annual' ? 'Year' : 'Quarter'})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-500">Metric</th>
                                {stockFinancials.map((sf) => (
                                    <th key={sf.symbol} className="text-right py-3 px-4 text-sm font-semibold" style={{ color: sf.color }}>
                                        {sf.symbol}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {metrics.map((metric) => (
                                <tr key={metric.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="py-3 px-4 text-sm text-slate-500">{metric.label}</td>
                                    {stockFinancials.map((sf) => {
                                        const latestFinancial = sf.financials[0];
                                        const value = latestFinancial?.[metric.key];
                                        return (
                                            <td key={sf.symbol} className="py-3 px-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                                                {formatLargeNumber(value as number | null | undefined)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Margins Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Margins Comparison
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-500">Margin</th>
                                {stockFinancials.map((sf) => (
                                    <th key={sf.symbol} className="text-right py-3 px-4 text-sm font-semibold" style={{ color: sf.color }}>
                                        {sf.symbol}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { label: 'Gross Margin', getMargin: (f: CompanyFinancial) => f.grossProfit && f.revenue ? (f.grossProfit as number) / (f.revenue as number) : null },
                                { label: 'Operating Margin', getMargin: (f: CompanyFinancial) => f.operatingIncome && f.revenue ? (f.operatingIncome as number) / (f.revenue as number) : null },
                                { label: 'Net Margin', getMargin: (f: CompanyFinancial) => f.netIncome && f.revenue ? (f.netIncome as number) / (f.revenue as number) : null },
                            ].map(({ label, getMargin }) => (
                                <tr key={label} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="py-3 px-4 text-sm text-slate-500">{label}</td>
                                    {stockFinancials.map((sf) => {
                                        const latestFinancial = sf.financials[0];
                                        const margin = latestFinancial ? getMargin(latestFinancial) : null;
                                        return (
                                            <td
                                                key={sf.symbol}
                                                className={`py-3 px-4 text-right text-sm font-medium ${margin && margin > 0 ? 'text-teal-600' : 'text-slate-900 dark:text-white'}`}
                                            >
                                                {formatPercent(margin)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
