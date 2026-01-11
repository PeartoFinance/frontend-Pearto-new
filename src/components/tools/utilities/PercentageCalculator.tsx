'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Percent, DollarSign, TrendingUp } from 'lucide-react';

export default function PercentageCalculator() {
    const [mode, setMode] = useState<'whatIs' | 'whatPercent' | 'change'>('whatIs');
    const [value1, setValue1] = useState(100);
    const [value2, setValue2] = useState(25);

    const result = useMemo(() => {
        switch (mode) {
            case 'whatIs':
                // What is X% of Y?
                return { answer: (value1 / 100) * value2, label: `${value1}% of ${value2}` };
            case 'whatPercent':
                // X is what % of Y?
                return { answer: (value1 / value2) * 100, label: `${value1} is what % of ${value2}` };
            case 'change':
                // % change from X to Y
                const change = ((value2 - value1) / value1) * 100;
                return { answer: change, label: `Change from ${value1} to ${value2}` };
            default:
                return { answer: 0, label: '' };
        }
    }, [mode, value1, value2]);

    const isPositive = result.answer >= 0;

    return (
        <CalculatorLayout
            title="Percentage Calculator"
            description="Calculate percentages, ratios, and percentage changes"
            category="Utilities"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">{result.label}</p>
                        <p className={`text-4xl font-bold ${mode === 'change' ? (isPositive ? 'text-emerald-600' : 'text-red-600') : 'text-emerald-600'}`}>
                            {mode === 'change' && isPositive ? '+' : ''}
                            {Math.round(result.answer * 100) / 100}
                            {mode !== 'whatIs' ? '%' : ''}
                        </p>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Calculation Type</label>
                <div className="space-y-2">
                    <button onClick={() => setMode('whatIs')} className={`w-full py-3 px-4 rounded-lg text-left text-sm font-medium ${mode === 'whatIs' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        What is X% of Y?
                    </button>
                    <button onClick={() => setMode('whatPercent')} className={`w-full py-3 px-4 rounded-lg text-left text-sm font-medium ${mode === 'whatPercent' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        X is what % of Y?
                    </button>
                    <button onClick={() => setMode('change')} className={`w-full py-3 px-4 rounded-lg text-left text-sm font-medium ${mode === 'change' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        % change from X to Y
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {mode === 'whatIs' ? 'Percentage' : mode === 'whatPercent' ? 'Value' : 'From'}
                    </label>
                    <input type="number" value={value1} onChange={(e) => setValue1(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {mode === 'whatIs' ? 'Of Value' : mode === 'whatPercent' ? 'Of Total' : 'To'}
                    </label>
                    <input type="number" value={value2} onChange={(e) => setValue2(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
