'use client';

import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

interface Article {
    title: string;
    author: string;
    time: string;
    image: string;
}

const articles: Article[] = [
    {
        title: 'Technical Outlook: S&P 500 Resistance Levels',
        author: 'Sarah Jenkins',
        time: '2h ago',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=200&q=80',
    },
    {
        title: 'Is the Crypto Winter Finally Over?',
        author: 'David Chen',
        time: '4h ago',
        image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=200&q=80',
    },
];

export default function MarketAnalysis() {
    return (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" /> Market Analysis
            </h3>
            <div className="space-y-4">
                {articles.map((article) => (
                    <Link key={article.title} href="/news" className="flex gap-4 group">
                        <div
                            className="h-16 w-16 flex-shrink-0 rounded-lg bg-cover bg-center"
                            style={{ backgroundImage: `url('${article.image}')` }}
                        />
                        <div className="flex flex-col justify-center">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                {article.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">By {article.author} • {article.time}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
