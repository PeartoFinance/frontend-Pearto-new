'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Search, Globe, FileText, BarChart2 } from 'lucide-react';

export default function KeywordDensityChecker() {
    const [text, setText] = useState(
        `SEO optimization is crucial for website success. 
This SEO tool helps you analyze keyword density. 
Good SEO practices include proper keyword usage without keyword stuffing.
Search engines like Google prefer natural content with balanced SEO.`
    );
    const [targetKeyword, setTargetKeyword] = useState('SEO');

    const results = useMemo(() => {
        const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
        const totalWords = words.length;

        // Count target keyword occurrences
        const keywordLower = targetKeyword.toLowerCase();
        const keywordCount = words.filter(w => w === keywordLower).length;
        const keywordDensity = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;

        // Find all word frequencies
        const wordFreq: Record<string, number> = {};
        words.forEach(word => {
            if (word.length > 2) { // Skip small words
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        // Get top keywords
        const topKeywords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({
                word,
                count,
                density: ((count / totalWords) * 100).toFixed(1)
            }));

        // Check density health
        let densityStatus: 'low' | 'optimal' | 'high';
        if (keywordDensity < 0.5) densityStatus = 'low';
        else if (keywordDensity > 3) densityStatus = 'high';
        else densityStatus = 'optimal';

        return {
            totalWords,
            keywordCount,
            keywordDensity,
            densityStatus,
            topKeywords
        };
    }, [text, targetKeyword]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'optimal': return 'text-emerald-600 bg-emerald-50';
            case 'low': return 'text-amber-600 bg-amber-50';
            case 'high': return 'text-red-600 bg-red-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    return (
        <CalculatorLayout
            title="Keyword Density Checker"
            description="Analyze keyword usage and SEO optimization"
            category="SEO"
            results={
                <div className="space-y-4">
                    <div className={`text-center p-6 rounded-xl ${getStatusColor(results.densityStatus)}`}>
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-80" />
                        <p className="text-sm opacity-80">"{targetKeyword}" Density</p>
                        <p className="text-4xl font-bold">{results.keywordDensity.toFixed(2)}%</p>
                        <p className="text-sm mt-1 capitalize">{results.densityStatus} density</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Keyword Count</p>
                            <p className="text-2xl font-bold text-blue-600">{results.keywordCount}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Words</p>
                            <p className="text-2xl font-bold text-purple-600">{results.totalWords}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Top Keywords
                        </p>
                        <div className="space-y-2">
                            {results.topKeywords.map((kw, i) => (
                                <div key={kw.word} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {kw.word}
                                    </span>
                                    <span className="text-xs text-slate-500">{kw.count}x</span>
                                    <span className="text-xs font-medium text-emerald-600">
                                        {kw.density}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">Recommended Density:</p>
                        <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">{'<0.5% Low'}</span>
                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">0.5-3% Optimal</span>
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">{'>3% Stuffing'}</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Target Keyword
                    </label>
                    <input
                        type="text"
                        value={targetKeyword}
                        onChange={(e) => setTargetKeyword(e.target.value)}
                        placeholder="Enter keyword to analyze"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Content to Analyze
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your content here..."
                        rows={8}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none"
                    />
                </div>
            </div>
        </CalculatorLayout>
    );
}
