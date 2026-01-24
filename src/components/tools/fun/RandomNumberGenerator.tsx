'use client';

import { useState } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Dices, Shuffle, Hash, RefreshCw } from 'lucide-react';

export default function RandomNumberGenerator() {
    const [min, setMin] = useState(1);
    const [max, setMax] = useState(100);
    const [count, setCount] = useState(1);
    const [allowDuplicates, setAllowDuplicates] = useState(true);
    const [results, setResults] = useState<number[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    const generate = () => {
        setIsAnimating(true);

        // Animation effect
        let animationCount = 0;
        const maxAnimations = 10;

        const animate = setInterval(() => {
            const tempResults = [];
            for (let i = 0; i < count; i++) {
                tempResults.push(Math.floor(Math.random() * (max - min + 1)) + min);
            }
            setResults(tempResults);
            animationCount++;

            if (animationCount >= maxAnimations) {
                clearInterval(animate);

                // Final generation
                if (allowDuplicates) {
                    const finalResults = [];
                    for (let i = 0; i < count; i++) {
                        finalResults.push(Math.floor(Math.random() * (max - min + 1)) + min);
                    }
                    setResults(finalResults);
                } else {
                    const range = max - min + 1;
                    const actualCount = Math.min(count, range);
                    const numbers: number[] = [];
                    while (numbers.length < actualCount) {
                        const num = Math.floor(Math.random() * range) + min;
                        if (!numbers.includes(num)) {
                            numbers.push(num);
                        }
                    }
                    setResults(numbers);
                }
                setIsAnimating(false);
            }
        }, 50);
    };

    const copyResults = () => {
        navigator.clipboard.writeText(results.join(', '));
    };

    return (
        <CalculatorLayout
            title="Random Number Generator"
            description="Generate random numbers within a range"
            category="Fun & Entertainment"
            results={
                <div className="space-y-4">
                    {results.length > 0 ? (
                        <>
                            <div className={`text-center p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl ${isAnimating ? 'animate-pulse' : ''}`}>
                                <Dices className={`w-10 h-10 text-purple-500 mx-auto mb-4 ${isAnimating ? 'animate-spin' : ''}`} />
                                <div className="flex flex-wrap justify-center gap-3">
                                    {results.map((num, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center justify-center w-16 h-16 text-2xl font-bold text-purple-600 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
                                        >
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={copyResults}
                                className="w-full py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                                Copy: {results.join(', ')}
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Dices className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">Click Generate to get random numbers</p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Minimum
                        </label>
                        <input
                            type="number"
                            value={min}
                            onChange={(e) => setMin(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Maximum
                        </label>
                        <input
                            type="number"
                            value={max}
                            onChange={(e) => setMax(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        How Many Numbers: {count}
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={10}
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full accent-purple-500"
                    />
                </div>

                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer">
                    <input
                        type="checkbox"
                        checked={allowDuplicates}
                        onChange={(e) => setAllowDuplicates(e.target.checked)}
                        className="w-4 h-4 text-purple-500 rounded"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Allow duplicates</span>
                </label>

                <button
                    onClick={generate}
                    disabled={isAnimating || min >= max}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white font-medium rounded-lg transition"
                >
                    {isAnimating ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Shuffle className="w-5 h-5" />
                            Generate
                        </>
                    )}
                </button>

                {/* Quick presets */}
                <div>
                    <p className="text-xs text-slate-500 mb-2">Quick Presets:</p>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => { setMin(1); setMax(6); setCount(1); }}
                            className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-purple-100"
                        >
                            🎲 Dice (1-6)
                        </button>
                        <button
                            onClick={() => { setMin(1); setMax(100); setCount(1); }}
                            className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-purple-100"
                        >
                            📊 1-100
                        </button>
                        <button
                            onClick={() => { setMin(1); setMax(50); setCount(6); setAllowDuplicates(false); }}
                            className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-purple-100"
                        >
                            🎰 Lottery (6 of 50)
                        </button>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
