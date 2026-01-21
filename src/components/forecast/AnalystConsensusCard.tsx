'use client';

interface AnalystConsensusCardProps {
    consensus: string;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
    total: number;
}

// Use green-themed colors
const RATING_COLORS: Record<string, string> = {
    'Strong Buy': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    'Buy': 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    'Hold': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    'Sell': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    'N/A': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

// Green-themed bar colors
const BAR_COLORS: Record<string, string> = {
    'Strong Buy': 'bg-teal-600',
    'Buy': 'bg-teal-500',
    'Hold': 'bg-slate-400',
    'Sell': 'bg-red-400',
    'Strong Sell': 'bg-red-500',
};

export function AnalystConsensusCard({
    consensus,
    strongBuy,
    buy,
    hold,
    sell,
    strongSell,
    total,
}: AnalystConsensusCardProps) {
    const ratings = [
        { label: 'Strong Buy', count: strongBuy },
        { label: 'Buy', count: buy },
        { label: 'Hold', count: hold },
        { label: 'Sell', count: sell },
        { label: 'Strong Sell', count: strongSell },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
                Analyst Consensus
            </h3>

            <div className="text-center mb-4">
                <span className={`inline-block px-4 py-2 rounded-lg text-lg font-bold border ${RATING_COLORS[consensus] || RATING_COLORS['N/A']}`}>
                    {consensus}
                </span>
                <p className="text-sm text-slate-500 mt-2">{total} analysts</p>
            </div>

            <div className="space-y-2">
                {ratings.map(({ label, count }) => (
                    <div key={label} className="flex items-center gap-2">
                        <span className="w-20 text-xs text-slate-500">{label}</span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${BAR_COLORS[label]}`}
                                style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                            />
                        </div>
                        <span className="w-6 text-xs text-slate-600 dark:text-slate-300 text-right font-medium">
                            {count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AnalystConsensusCard;
