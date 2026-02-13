'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Percent, Tag, ShoppingCart, Calculator } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function DiscountCalculator() {
    const [originalPrice, setOriginalPrice] = useState(100);
    const [discountPercent, setDiscountPercent] = useState(25);
    const [quantity, setQuantity] = useState(1);
    const [taxRate, setTaxRate] = useState(8);

    const results = useMemo(() => {
        const discountAmount = originalPrice * (discountPercent / 100);
        const salePrice = originalPrice - discountAmount;
        const subtotal = salePrice * quantity;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;
        const totalSavings = discountAmount * quantity;

        return {
            discountAmount,
            salePrice,
            subtotal,
            taxAmount,
            total,
            totalSavings
        };
    }, [originalPrice, discountPercent, quantity, taxRate]);

    const { formatPrice: formatCurrency } = useCurrency();

    // Common discount presets
    const discountPresets = [10, 15, 20, 25, 30, 40, 50, 75];

    return (
        <CalculatorLayout
            title="Discount Calculator"
            description="Calculate sale prices and savings"
            category="E-commerce"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
                        <Tag className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Sale Price</p>
                        <p className="text-4xl font-bold text-red-600">{formatCurrency(results.salePrice)}</p>
                        <p className="text-sm text-slate-500 mt-1">
                            <span className="line-through text-slate-400">{formatCurrency(originalPrice)}</span>
                            <span className="ml-2 text-red-500">-{discountPercent}%</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">You Save</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(results.discountAmount)}
                            </p>
                            <p className="text-xs text-slate-400">per item</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Savings</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(results.totalSavings)}
                            </p>
                            <p className="text-xs text-slate-400">{quantity} items</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Order Summary
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Original ({quantity}x {formatCurrency(originalPrice)})</span>
                                <span className="text-slate-700 dark:text-slate-300 line-through">
                                    {formatCurrency(originalPrice * quantity)}
                                </span>
                            </div>
                            <div className="flex justify-between text-red-500">
                                <span>Discount ({discountPercent}%)</span>
                                <span>-{formatCurrency(results.totalSavings)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(results.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tax ({taxRate}%)</span>
                                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(results.taxAmount)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Total</span>
                                <span className="font-bold text-lg text-emerald-600">{formatCurrency(results.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Original Price ($)
                    </label>
                    <input
                        type="number"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(Number(e.target.value))}
                        step={0.01}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Discount: {discountPercent}%
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={90}
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        className="w-full accent-red-500"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {discountPresets.map(preset => (
                            <button
                                key={preset}
                                onClick={() => setDiscountPercent(preset)}
                                className={`px-3 py-1 text-xs rounded-full transition ${discountPercent === preset
                                        ? 'bg-red-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-100'
                                    }`}
                            >
                                {preset}%
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Quantity
                        </label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                            min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tax Rate (%)
                        </label>
                        <input
                            type="number"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                            step={0.1}
                            min={0}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
