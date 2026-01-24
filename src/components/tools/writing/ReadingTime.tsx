'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Clock, BookOpen, Mic } from 'lucide-react';

export default function ReadingTime() {
    const [text, setText] = useState('');
    const [readingSpeed, setReadingSpeed] = useState(200);
    const [speakingSpeed, setSpeakingSpeed] = useState(150);

    const stats = useMemo(() => {
        const trimmed = text.trim();
        const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;

        const readingMinutes = words / readingSpeed;
        const readingMins = Math.floor(readingMinutes);
        const readingSecs = Math.round((readingMinutes - readingMins) * 60);

        const speakingMinutes = words / speakingSpeed;
        const speakingMins = Math.floor(speakingMinutes);
        const speakingSecs = Math.round((speakingMinutes - speakingMins) * 60);

        return {
            words,
            readingMins,
            readingSecs,
            speakingMins,
            speakingSecs,
            readingTotal: readingMinutes,
            speakingTotal: speakingMinutes
        };
    }, [text, readingSpeed, speakingSpeed]);

    const formatTime = (mins: number, secs: number) => {
        if (mins === 0 && secs === 0) return '0 sec';
        if (mins === 0) return `${secs} sec`;
        if (secs === 0) return `${mins} min`;
        return `${mins} min ${secs} sec`;
    };

    return (
        <CalculatorLayout
            title="Reading Time Calculator"
            description="Estimate reading and speaking time for your text"
            category="Writing"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Word Count</p>
                        <p className="text-4xl font-bold text-emerald-600">{stats.words}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-medium text-slate-500">Reading Time</span>
                            </div>
                            <p className="text-xl font-bold text-blue-600">
                                {formatTime(stats.readingMins, stats.readingSecs)}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">@ {readingSpeed} wpm</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Mic className="w-4 h-4 text-purple-500" />
                                <span className="text-xs font-medium text-slate-500">Speaking Time</span>
                            </div>
                            <p className="text-xl font-bold text-purple-600">
                                {formatTime(stats.speakingMins, stats.speakingSecs)}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">@ {speakingSpeed} wpm</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">Perfect for:</p>
                        <div className="flex flex-wrap gap-2">
                            {stats.words < 100 && <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded">Quick Read</span>}
                            {stats.words >= 100 && stats.words < 500 && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">Blog Post Intro</span>}
                            {stats.words >= 500 && stats.words < 1500 && <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded">Article</span>}
                            {stats.words >= 1500 && <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded">Long Form</span>}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Enter your text
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your article, blog post, or script here..."
                        rows={8}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Reading Speed: {readingSpeed} wpm
                    </label>
                    <input
                        type="range"
                        min={100}
                        max={400}
                        step={10}
                        value={readingSpeed}
                        onChange={(e) => setReadingSpeed(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Slow</span>
                        <span>Average</span>
                        <span>Fast</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Speaking Speed: {speakingSpeed} wpm
                    </label>
                    <input
                        type="range"
                        min={100}
                        max={200}
                        step={10}
                        value={speakingSpeed}
                        onChange={(e) => setSpeakingSpeed(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>
            </div>
        </CalculatorLayout>
    );
}
