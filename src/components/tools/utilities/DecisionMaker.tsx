'use client';

import { useState } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Shuffle, RefreshCw } from 'lucide-react';

export default function DecisionMaker() {
    const [options, setOptions] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const makeDecision = () => {
        const optionList = options
            .split('\n')
            .map(o => o.trim())
            .filter(Boolean);

        if (optionList.length < 2) return;

        setIsSpinning(true);
        setResult(null);

        // Simulate spinning through options
        let spins = 0;
        const maxSpins = 15;
        const interval = setInterval(() => {
            const randomOption = optionList[Math.floor(Math.random() * optionList.length)];
            setResult(randomOption);
            spins++;

            if (spins >= maxSpins) {
                clearInterval(interval);
                setIsSpinning(false);
                // Final random selection
                const finalChoice = optionList[Math.floor(Math.random() * optionList.length)];
                setResult(finalChoice);
            }
        }, 100);
    };

    const reset = () => {
        setOptions('');
        setResult(null);
    };

    const loadExample = () => {
        setOptions(`Pizza
Sushi
Tacos
Burger
Pasta`);
    };

    const optionsList = options.split('\n').map(o => o.trim()).filter(Boolean);

    return (
        <CalculatorLayout
            title="Decision Maker"
            description="Let the wheel decide for you!"
            category="Utilities"
            results={
                <div className="space-y-4">
                    {result ? (
                        <div className={`text-center p-8 bg-white dark:bg-slate-800 rounded-xl ${isSpinning ? 'animate-pulse' : ''}`}>
                            <div className={`text-6xl mb-4 ${isSpinning ? 'animate-bounce' : ''}`}>
                                {isSpinning ? '🎲' : '🎯'}
                            </div>
                            <p className="text-sm text-slate-500 mb-2">
                                {isSpinning ? 'Choosing...' : 'The answer is:'}
                            </p>
                            <p className={`text-2xl font-bold ${isSpinning ? 'text-slate-400' : 'text-emerald-600'}`}>
                                {result}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Shuffle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">Enter options and click decide!</p>
                        </div>
                    )}

                    {optionsList.length > 0 && (
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 mb-2">Your options ({optionsList.length}):</p>
                            <div className="flex flex-wrap gap-2">
                                {optionsList.map((opt, i) => (
                                    <span
                                        key={i}
                                        className={`px-2 py-1 text-xs rounded-full ${result === opt && !isSpinning
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        {opt}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Enter Options (one per line)
                        </label>
                        <button
                            onClick={loadExample}
                            className="text-xs text-emerald-600 hover:text-emerald-700"
                        >
                            Load Example
                        </button>
                    </div>
                    <textarea
                        value={options}
                        onChange={(e) => setOptions(e.target.value)}
                        placeholder="Option 1\nOption 2\nOption 3"
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={makeDecision}
                        disabled={optionsList.length < 2 || isSpinning}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-medium rounded-lg transition"
                    >
                        <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                        {isSpinning ? 'Deciding...' : 'Decide!'}
                    </button>
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reset
                    </button>
                </div>

                <p className="text-xs text-slate-400 text-center">
                    Add at least 2 options to make a decision
                </p>
            </div>
        </CalculatorLayout>
    );
}
