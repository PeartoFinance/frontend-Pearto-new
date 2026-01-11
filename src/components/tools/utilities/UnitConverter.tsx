'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Scale, ArrowRightLeft } from 'lucide-react';

const units = {
    length: {
        meter: 1,
        kilometer: 0.001,
        centimeter: 100,
        millimeter: 1000,
        mile: 0.000621371,
        yard: 1.09361,
        foot: 3.28084,
        inch: 39.3701
    },
    weight: {
        kilogram: 1,
        gram: 1000,
        milligram: 1000000,
        pound: 2.20462,
        ounce: 35.274,
        ton: 0.001
    },
    temperature: {
        celsius: 'c',
        fahrenheit: 'f',
        kelvin: 'k'
    },
    volume: {
        liter: 1,
        milliliter: 1000,
        gallon: 0.264172,
        quart: 1.05669,
        pint: 2.11338
    }
};

type UnitCategory = 'length' | 'weight' | 'volume';

export default function UnitConverter() {
    const [category, setCategory] = useState<UnitCategory>('length');
    const [fromUnit, setFromUnit] = useState('meter');
    const [toUnit, setToUnit] = useState('foot');
    const [value, setValue] = useState(1);

    const result = useMemo(() => {
        const categoryUnits = units[category] as Record<string, number>;
        const fromFactor = categoryUnits[fromUnit] || 1;
        const toFactor = categoryUnits[toUnit] || 1;

        // Convert to base unit then to target
        const baseValue = value / fromFactor;
        const convertedValue = baseValue * toFactor;

        return Math.round(convertedValue * 10000) / 10000;
    }, [category, fromUnit, toUnit, value]);

    const categoryOptions = Object.keys(units[category]).filter(u => u !== fromUnit);

    return (
        <CalculatorLayout
            title="Unit Converter"
            description="Convert between different units of measurement"
            category="Utilities"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-2">
                            {value} {fromUnit} =
                        </p>
                        <p className="text-4xl font-bold text-emerald-600">{result}</p>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">{toUnit}</p>
                    </div>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['length', 'weight', 'volume'] as UnitCategory[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setCategory(cat);
                                const unitKeys = Object.keys(units[cat]);
                                setFromUnit(unitKeys[0]);
                                setToUnit(unitKeys[1]);
                            }}
                            className={`py-2 px-3 rounded-lg font-medium text-sm ${category === cat ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Value</label>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">From</label>
                    <select
                        value={fromUnit}
                        onChange={(e) => setFromUnit(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    >
                        {Object.keys(units[category]).map((unit) => (
                            <option key={unit} value={unit}>{unit}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">To</label>
                    <select
                        value={toUnit}
                        onChange={(e) => setToUnit(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    >
                        {Object.keys(units[category]).map((unit) => (
                            <option key={unit} value={unit}>{unit}</option>
                        ))}
                    </select>
                </div>
            </div>
        </CalculatorLayout>
    );
}
