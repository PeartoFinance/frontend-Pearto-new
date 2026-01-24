'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { FileText, Clock, Hash, AlignLeft } from 'lucide-react';

export default function WordCounter() {
    const [text, setText] = useState('');

    const stats = useMemo(() => {
        const trimmed = text.trim();
        const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length : 0;
        const paragraphs = trimmed ? trimmed.split(/\n\n+/).filter(Boolean).length : 0;
        const readingTimeMin = Math.ceil(words / 200); // avg 200 wpm
        const speakingTimeMin = Math.ceil(words / 150); // avg 150 wpm

        return {
            words,
            characters,
            charactersNoSpaces,
            sentences,
            paragraphs,
            readingTimeMin,
            speakingTimeMin
        };
    }, [text]);

    return (
        <CalculatorLayout
            title="Word Counter"
            description="Count words, characters, sentences, and paragraphs"
            category="Writing"
            results={
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <Hash className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-emerald-600">{stats.words}</p>
                            <p className="text-xs text-slate-500">Words</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <FileText className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-600">{stats.characters}</p>
                            <p className="text-xs text-slate-500">Characters</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg text-center">
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{stats.charactersNoSpaces}</p>
                            <p className="text-xs text-slate-500">No Spaces</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg text-center">
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{stats.sentences}</p>
                            <p className="text-xs text-slate-500">Sentences</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg text-center">
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{stats.paragraphs}</p>
                            <p className="text-xs text-slate-500">Paragraphs</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Reading Time</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Reading (~200 wpm)</span>
                            <span className="font-medium text-emerald-600">{stats.readingTimeMin} min</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-slate-500">Speaking (~150 wpm)</span>
                            <span className="font-medium text-blue-600">{stats.speakingTimeMin} min</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Enter or paste your text
                </label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start typing or paste your text here..."
                    rows={12}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 resize-none"
                />
            </div>
        </CalculatorLayout>
    );
}
