'use client';

interface RecommendationTrend {
    periodLabel: string;
    periodDate: string;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
}

interface RecommendationTrendsProps {
    trends: RecommendationTrend[];
}

export function RecommendationTrends({ trends }: RecommendationTrendsProps) {
    if (trends.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Recommendation Trends
                </h3>
                <p className="text-slate-500 text-center py-8">No recommendation history available</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Recommendation Trends
            </h3>

            {/* Stacked bar chart - green themed */}
            <div className="space-y-3">
                <div className="flex items-end justify-between h-40 gap-2 px-2">
                    {trends.map((trend) => {
                        const total = trend.strongBuy + trend.buy + trend.hold + trend.sell + trend.strongSell;
                        if (total === 0) return null;

                        const heights = {
                            strongBuy: (trend.strongBuy / total) * 100,
                            buy: (trend.buy / total) * 100,
                            hold: (trend.hold / total) * 100,
                            sell: (trend.sell / total) * 100,
                            strongSell: (trend.strongSell / total) * 100,
                        };

                        return (
                            <div key={trend.periodDate} className="flex-1 flex flex-col items-center">
                                <div className="w-full flex flex-col h-32 rounded-t overflow-hidden">
                                    {heights.strongBuy > 0 && (
                                        <div
                                            className="bg-teal-600"
                                            style={{ height: `${heights.strongBuy}%` }}
                                            title={`Strong Buy: ${trend.strongBuy}`}
                                        />
                                    )}
                                    {heights.buy > 0 && (
                                        <div
                                            className="bg-teal-500"
                                            style={{ height: `${heights.buy}%` }}
                                            title={`Buy: ${trend.buy}`}
                                        />
                                    )}
                                    {heights.hold > 0 && (
                                        <div
                                            className="bg-slate-400"
                                            style={{ height: `${heights.hold}%` }}
                                            title={`Hold: ${trend.hold}`}
                                        />
                                    )}
                                    {heights.sell > 0 && (
                                        <div
                                            className="bg-red-400"
                                            style={{ height: `${heights.sell}%` }}
                                            title={`Sell: ${trend.sell}`}
                                        />
                                    )}
                                    {heights.strongSell > 0 && (
                                        <div
                                            className="bg-red-500"
                                            style={{ height: `${heights.strongSell}%` }}
                                            title={`Strong Sell: ${trend.strongSell}`}
                                        />
                                    )}
                                </div>
                                <span className="text-xs text-slate-500 mt-2 whitespace-nowrap">
                                    {trend.periodLabel}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Legend - green themed */}
                <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-teal-600" /> Strong Buy
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-teal-500" /> Buy
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-slate-400" /> Hold
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-red-400" /> Sell
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-red-500" /> Strong Sell
                    </span>
                </div>
            </div>

            {/* Table below */}
            {trends.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-t border-slate-100 dark:border-slate-800">
                                <th className="text-left py-2 text-slate-500 font-medium">Rating</th>
                                {trends.slice(-6).map(t => (
                                    <th key={t.periodDate} className="text-center py-2 text-slate-500 font-medium">
                                        {t.periodLabel}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Strong Buy', key: 'strongBuy' as const },
                                { label: 'Buy', key: 'buy' as const },
                                { label: 'Hold', key: 'hold' as const },
                                { label: 'Sell', key: 'sell' as const },
                            ].map(({ label, key }) => (
                                <tr key={key} className="border-t border-slate-100 dark:border-slate-800">
                                    <td className="py-2 text-slate-700 dark:text-slate-300">{label}</td>
                                    {trends.slice(-6).map(t => (
                                        <td key={t.periodDate} className="text-center py-2 text-slate-600 dark:text-slate-400">
                                            {t[key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default RecommendationTrends;
