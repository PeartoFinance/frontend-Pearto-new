'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Square, Circle, RectangleHorizontal, ArrowRight, Info } from 'lucide-react';

type PanShape = 'round' | 'square' | 'rectangle';

function calculateVolume(shape: PanShape, dim1: number, dim2: number, dim3: number, depth: number): number {
    switch (shape) {
        case 'round':
            return Math.PI * (dim1 / 2) * (dim1 / 2) * depth;
        case 'square':
            return dim1 * dim1 * depth;
        case 'rectangle':
            return dim1 * dim2 * depth;
        default:
            return 0;
    }
}

function getLabelForDim(shape: PanShape, dimIndex: number): string {
    if (shape === 'round') return dimIndex === 0 ? 'Diameter' : '';
    if (shape === 'square') return dimIndex === 0 ? 'Side Length' : '';
    if (shape === 'rectangle') return dimIndex === 0 ? 'Length' : 'Width';
    return '';
}

const SHAPE_ICONS = {
    round: Circle,
    square: Square,
    rectangle: RectangleHorizontal,
};

export default function BakingPanConverter() {
    const [fromShape, setFromShape] = useState<PanShape>('round');
    const [fromDim1, setFromDim1] = useState(9);
    const [fromDim2, setFromDim2] = useState(13);
    const [fromDepth, setFromDepth] = useState(2);

    const [toShape, setToShape] = useState<PanShape>('square');
    const [toDim1, setToDim1] = useState(8);
    const [toDim2, setToDim2] = useState(11);
    const [toDepth, setToDepth] = useState(2);

    const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

    const results = useMemo(() => {
        const fromVol = calculateVolume(fromShape, fromDim1, fromDim2, fromDim2, fromDepth);
        const toVol = calculateVolume(toShape, toDim1, toDim2, toDim2, toDepth);

        if (fromVol <= 0 || toVol <= 0) return null;

        const scalingFactor = toVol / fromVol;

        const fromVolCubicInches = fromVol;
        const toVolCubicInches = toVol;

        // Convert to cups (1 cup ≈ 14.44 cubic inches)
        const cupConversion = unit === 'inches' ? 14.44 : 237; // cm³ per cup
        const fromCups = fromVolCubicInches / cupConversion;
        const toCups = toVolCubicInches / cupConversion;

        return {
            fromVol,
            toVol,
            scalingFactor,
            fromCups,
            toCups,
        };
    }, [fromShape, fromDim1, fromDim2, fromDepth, toShape, toDim1, toDim2, toDepth, unit]);

    const renderPanInputs = (
        prefix: string,
        shape: PanShape,
        setShape: (s: PanShape) => void,
        dim1: number,
        setDim1: (n: number) => void,
        dim2: number,
        setDim2: (n: number) => void,
        depth: number,
        setDepth: (n: number) => void
    ) => (
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {prefix} Shape
                    <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                        {shape}
                    </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {(['round', 'square', 'rectangle'] as const).map(s => {
                        const Icon = SHAPE_ICONS[s];
                        return (
                            <button key={s} onClick={() => setShape(s)}
                                className={`py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${shape === s
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                    }`}>
                                <Icon size={12} />
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        {getLabelForDim(shape, 0)} ({unit})
                    </label>
                    <input type="number" value={dim1} onChange={e => setDim1(Number(e.target.value))} min={1} step={0.5}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                </div>
                {shape === 'rectangle' && (
                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            {getLabelForDim(shape, 1)} ({unit})
                        </label>
                        <input type="number" value={dim2} onChange={e => setDim2(Number(e.target.value))} min={1} step={0.5}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                )}
                <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Depth ({unit})
                    </label>
                    <input type="number" value={depth} onChange={e => setDepth(Number(e.target.value))} min={0.5} step={0.5}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                </div>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            title="Baking Pan Converter"
            description="Convert recipes between different pan shapes and sizes"
            category="Cooking & Recipes"
            insights={[
                { label: 'From', value: `${fromShape} ${fromDim1}${unit === 'inches' ? '"' : 'cm'}` },
                { label: 'To', value: `${toShape} ${toDim1}${unit === 'inches' ? '"' : 'cm'}`, color: 'text-blue-600' },
                { label: 'Scale Factor', value: results ? `${results.scalingFactor.toFixed(2)}×` : '-', color: 'text-emerald-600' },
                { label: 'Volume Ratio', value: results ? `${Math.round((results.toVol / results.fromVol) * 100)}%` : '-', color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-4">
                    {!results ? (
                        <div className="text-center p-8 text-slate-400">
                            <Square className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Enter valid pan dimensions</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    {(() => { const FromIcon = SHAPE_ICONS[fromShape]; return <FromIcon className="w-6 h-6 text-purple-400" />; })()}
                                    <ArrowRight className="w-5 h-5 text-purple-400" />
                                    {(() => { const ToIcon = SHAPE_ICONS[toShape]; return <ToIcon className="w-6 h-6 text-purple-400" />; })()}
                                </div>
                                <p className="text-sm text-slate-500">Recipe Scaling Factor</p>
                                <p className="text-4xl font-bold text-purple-600">{results.scalingFactor.toFixed(2)}×</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    {results.scalingFactor > 1 ? 'Increase' : results.scalingFactor < 1 ? 'Decrease' : 'No change to'} recipe quantities
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 mb-1">Original Pan</p>
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                        {results.fromVol.toFixed(0)} {unit === 'inches' ? 'in³' : 'cm³'}
                                    </p>
                                    <p className="text-xs text-slate-400">≈ {results.fromCups.toFixed(1)} cups</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 mb-1">Target Pan</p>
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                        {results.toVol.toFixed(0)} {unit === 'inches' ? 'in³' : 'cm³'}
                                    </p>
                                    <p className="text-xs text-slate-400">≈ {results.toCups.toFixed(1)} cups</p>
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">How to Use</p>
                                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                                    <li>• Multiply all ingredient amounts by <strong>{results.scalingFactor.toFixed(2)}</strong></li>
                                    {results.scalingFactor !== 1 && (
                                        <li>• Adjust baking time: {results.scalingFactor > 1 ? 'may need slightly longer' : 'check earlier'}</li>
                                    )}
                                    <li>• Keep oven temperature the same</li>
                                    <li>• Watch for doneness — insert a toothpick to test</li>
                                </ul>
                            </div>

                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400">
                                        This calculates volume-based scaling. Batter depth affects baking time — deeper pans need lower temperature and longer time.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Unit
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {unit}
                        </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['inches', 'cm'] as const).map(u => (
                            <button key={u} onClick={() => setUnit(u)}
                                className={`py-2 rounded-lg text-xs font-medium transition ${unit === u
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                    }`}>
                                {u}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Original Pan</p>
                    {renderPanInputs('Original', fromShape, setFromShape, fromDim1, setFromDim1, fromDim2, setFromDim2, fromDepth, setFromDepth)}
                </div>

                <div className="flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Pan</p>
                    {renderPanInputs('Target', toShape, setToShape, toDim1, setToDim1, toDim2, setToDim2, toDepth, setToDepth)}
                </div>
            </div>
        </CalculatorLayout>
    );
}
