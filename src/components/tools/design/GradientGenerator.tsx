'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Paintbrush, Copy, Check } from 'lucide-react';

export default function GradientGenerator() {
    const [color1, setColor1] = useState('#10b981');
    const [color2, setColor2] = useState('#3b82f6');
    const [angle, setAngle] = useState(90);
    const [type, setType] = useState<'linear' | 'radial'>('linear');
    const [copied, setCopied] = useState(false);

    const gradient = useMemo(() => {
        if (type === 'linear') {
            return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
        }
        return `radial-gradient(circle, ${color1}, ${color2})`;
    }, [color1, color2, angle, type]);

    const cssCode = `background: ${gradient};`;

    const copyCSS = async () => {
        await navigator.clipboard.writeText(cssCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <CalculatorLayout
            title="Gradient Generator"
            description="Create beautiful CSS gradients"
            category="Design"
            results={
                <div className="space-y-4">
                    {/* Preview */}
                    <div
                        className="h-40 rounded-xl shadow-inner"
                        style={{ background: gradient }}
                    />

                    {/* CSS Code */}
                    <div className="p-4 bg-slate-900 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-400">CSS</span>
                            <button
                                onClick={copyCSS}
                                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded transition"
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <code className="text-sm text-emerald-400 font-mono">{cssCode}</code>
                    </div>

                    {/* Angle visualizer */}
                    {type === 'linear' && (
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <div
                                className="w-16 h-16 mx-auto rounded-full border-4 border-slate-200 dark:border-slate-600 relative"
                                style={{ background: gradient }}
                            >
                                <div
                                    className="absolute top-1/2 left-1/2 w-1 h-6 bg-white rounded origin-bottom"
                                    style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }}
                                />
                            </div>
                            <p className="text-sm text-slate-500 mt-2">{angle}°</p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                {/* Gradient Type */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setType('linear')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${type === 'linear'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                        >
                            Linear
                        </button>
                        <button
                            onClick={() => setType('radial')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${type === 'radial'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                        >
                            Radial
                        </button>
                    </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Color 1
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={color1}
                                onChange={(e) => setColor1(e.target.value)}
                                className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={color1}
                                onChange={(e) => setColor1(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono uppercase"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Color 2
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={color2}
                                onChange={(e) => setColor2(e.target.value)}
                                className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={color2}
                                onChange={(e) => setColor2(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono uppercase"
                            />
                        </div>
                    </div>
                </div>

                {/* Angle (for linear only) */}
                {type === 'linear' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Angle: {angle}°
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            value={angle}
                            onChange={(e) => setAngle(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between mt-1">
                            {[0, 45, 90, 135, 180].map((a) => (
                                <button
                                    key={a}
                                    onClick={() => setAngle(a)}
                                    className="text-xs text-slate-500 hover:text-emerald-600"
                                >
                                    {a}°
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Presets */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Presets
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            ['#10b981', '#3b82f6'],
                            ['#f59e0b', '#ef4444'],
                            ['#8b5cf6', '#ec4899'],
                            ['#06b6d4', '#10b981'],
                        ].map(([c1, c2], i) => (
                            <button
                                key={i}
                                onClick={() => { setColor1(c1); setColor2(c2); }}
                                className="h-8 rounded-lg"
                                style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
