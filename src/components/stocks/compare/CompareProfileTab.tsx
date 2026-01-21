'use client';

import type { MarketStock, PriceHistoryPoint } from '@/services/marketService';

interface CompareStock extends MarketStock {
    color: string;
    data: PriceHistoryPoint[];
}

interface CompareProfileTabProps {
    stocks: CompareStock[];
}

export default function CompareProfileTab({ stocks }: CompareProfileTabProps) {
    const profileFields = [
        { label: 'Company Name', getValue: (s: CompareStock) => s.name || '-' },
        { label: 'Symbol', getValue: (s: CompareStock) => s.symbol },
        { label: 'Exchange', getValue: (s: CompareStock) => s.exchange || '-' },
        { label: 'Sector', getValue: (s: CompareStock) => s.sector || '-' },
        { label: 'Industry', getValue: (s: CompareStock) => s.industry || '-' },
        { label: 'Country', getValue: (s: CompareStock) => s.countryCode || 'USA' },
        { label: 'Currency', getValue: (s: CompareStock) => s.currency || 'USD' },
        { label: 'Website', getValue: (s: CompareStock) => s.website || '-', isLink: true },
    ];

    return (
        <div className="space-y-5">
            {/* Company Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stocks.map((stock) => (
                    <div
                        key={stock.symbol}
                        className="bg-white dark:bg-slate-900 rounded-xl border-2 p-5"
                        style={{ borderColor: stock.color }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            {stock.logoUrl ? (
                                <img
                                    src={stock.logoUrl}
                                    alt={stock.symbol}
                                    className="w-12 h-12 rounded-lg object-contain bg-white"
                                />
                            ) : (
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                                    style={{ backgroundColor: stock.color }}
                                >
                                    {stock.symbol.slice(0, 2)}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{stock.symbol}</h3>
                                <p className="text-sm text-slate-500 truncate max-w-[180px]">{stock.name}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Sector</span>
                                <span className="font-medium text-slate-900 dark:text-white">{stock.sector || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Industry</span>
                                <span className="font-medium text-slate-900 dark:text-white text-right max-w-[150px] truncate">{stock.industry || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Exchange</span>
                                <span className="font-medium text-slate-900 dark:text-white">{stock.exchange || '-'}</span>
                            </div>
                        </div>

                        {stock.description && (
                            <p className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 line-clamp-3">
                                {stock.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Profile Comparison Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Company Profile Comparison
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-500">Field</th>
                                {stocks.map((stock) => (
                                    <th key={stock.symbol} className="text-left py-3 px-4 text-sm font-semibold" style={{ color: stock.color }}>
                                        {stock.symbol}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {profileFields.map((field) => (
                                <tr key={field.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="py-3 px-4 text-sm text-slate-500">{field.label}</td>
                                    {stocks.map((s) => {
                                        const value = field.getValue(s);
                                        return (
                                            <td key={s.symbol} className="py-3 px-4 text-sm text-slate-900 dark:text-white">
                                                {field.isLink && value !== '-' ? (
                                                    <a
                                                        href={value.startsWith('http') ? value : `https://${value}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-teal-600 hover:underline truncate block max-w-[200px]"
                                                    >
                                                        {value.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                    </a>
                                                ) : value}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Descriptions */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Company Descriptions
                    </h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stocks.map((stock) => (
                        <div key={stock.symbol} className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stock.color }} />
                                <h4 className="font-semibold text-slate-900 dark:text-white">{stock.symbol}</h4>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {stock.description || 'No description available.'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
