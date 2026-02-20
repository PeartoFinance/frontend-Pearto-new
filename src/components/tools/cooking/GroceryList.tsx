'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { ShoppingCart, Plus, Trash2, CheckSquare, Square, DollarSign } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface GroceryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    price: number;
    checked: boolean;
}

const CATEGORIES = [
    'Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery', 'Pantry',
    'Frozen', 'Beverages', 'Snacks', 'Condiments', 'Cleaning', 'Other',
];

const UNITS = ['pcs', 'lbs', 'kg', 'oz', 'liters', 'gallons', 'bag', 'box', 'can', 'bunch', 'dozen'];

function uid() {
    return Math.random().toString(36).slice(2, 10);
}

export default function GroceryList() {
    const [items, setItems] = useState<GroceryItem[]>([
        { id: uid(), name: 'Chicken Breast', category: 'Meat & Seafood', quantity: 2, unit: 'lbs', price: 8.99, checked: false },
        { id: uid(), name: 'Broccoli', category: 'Produce', quantity: 1, unit: 'bunch', price: 2.49, checked: false },
        { id: uid(), name: 'Rice', category: 'Pantry', quantity: 1, unit: 'bag', price: 4.99, checked: false },
        { id: uid(), name: 'Eggs', category: 'Dairy & Eggs', quantity: 1, unit: 'dozen', price: 3.99, checked: false },
        { id: uid(), name: 'Olive Oil', category: 'Pantry', quantity: 1, unit: 'pcs', price: 7.49, checked: false },
    ]);

    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('Produce');
    const [newQuantity, setNewQuantity] = useState(1);
    const [newUnit, setNewUnit] = useState('pcs');
    const [newPrice, setNewPrice] = useState(0);

    const { formatPrice } = useCurrency();

    const addItem = () => {
        if (!newName.trim()) return;
        setItems(prev => [...prev, {
            id: uid(),
            name: newName.trim(),
            category: newCategory,
            quantity: newQuantity,
            unit: newUnit,
            price: newPrice,
            checked: false,
        }]);
        setNewName('');
        setNewPrice(0);
        setNewQuantity(1);
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const toggleItem = (id: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    };

    const groupedItems = useMemo(() => {
        const groups = new Map<string, GroceryItem[]>();
        items.forEach(item => {
            if (!groups.has(item.category)) groups.set(item.category, []);
            groups.get(item.category)!.push(item);
        });
        return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [items]);

    const totalCost = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
    const checkedCost = useMemo(() => items.filter(i => i.checked).reduce((s, i) => s + i.price * i.quantity, 0), [items]);
    const checkedCount = items.filter(i => i.checked).length;
    const progress = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

    return (
        <CalculatorLayout
            title="Grocery List"
            description="Organize your shopping list by category with estimated costs"
            category="Cooking & Recipes"
            insights={[
                { label: 'Items', value: `${items.length}` },
                { label: 'Checked', value: `${checkedCount}`, color: 'text-emerald-600' },
                { label: 'Est. Total', value: formatPrice(totalCost), color: 'text-blue-600' },
                { label: 'Progress', value: `${progress}%`, color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-4">
                    <div className="text-center p-5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl">
                        <ShoppingCart className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Estimated Total</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatPrice(totalCost)}</p>
                        <p className="text-sm text-slate-500 mt-1">{items.length} items &middot; {checkedCount} checked off</p>
                        <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    {groupedItems.length === 0 ? (
                        <div className="text-center p-8 text-slate-400">
                            <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Add items to your grocery list</p>
                        </div>
                    ) : (
                        groupedItems.map(([category, catItems]) => (
                            <div key={category} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{category}</span>
                                    <span className="text-[10px] text-slate-400">
                                        {formatPrice(catItems.reduce((s, i) => s + i.price * i.quantity, 0))}
                                    </span>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {catItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                                            <button onClick={() => toggleItem(item.id)}>
                                                {item.checked
                                                    ? <CheckSquare size={16} className="text-emerald-500" />
                                                    : <Square size={16} className="text-slate-300" />
                                                }
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-sm ${item.checked ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {item.name}
                                                </span>
                                                <p className="text-[10px] text-slate-400">{item.quantity} {item.unit}</p>
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">{formatPrice(item.price * item.quantity)}</span>
                                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}

                    {checkedCount > 0 && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                            <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                Checked off: {checkedCount} item{checkedCount !== 1 ? 's' : ''}
                            </span>
                            <span className="text-xs font-bold text-emerald-600">{formatPrice(checkedCost)}</span>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Item</p>

                <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Item Name</label>
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addItem()}
                        placeholder="e.g. Bananas"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Category</label>
                    <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Qty</label>
                        <input type="number" value={newQuantity} onChange={e => setNewQuantity(Math.max(1, Number(e.target.value)))}
                            min={1} className="w-full px-2 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-center" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Unit</label>
                        <select value={newUnit} onChange={e => setNewUnit(e.target.value)}
                            className="w-full px-2 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Price ($)</label>
                        <input type="number" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))}
                            min={0} step={0.01}
                            className="w-full px-2 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-center" />
                    </div>
                </div>

                <button onClick={addItem}
                    className="w-full py-2.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition flex items-center justify-center gap-1">
                    <Plus size={14} /> Add to List
                </button>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2">
                        <button onClick={() => setItems(prev => prev.map(i => ({ ...i, checked: false })))}
                            className="flex-1 py-2 text-xs text-slate-500 hover:text-blue-500 transition">
                            Uncheck All
                        </button>
                        <button onClick={() => setItems(prev => prev.filter(i => !i.checked))}
                            className="flex-1 py-2 text-xs text-slate-500 hover:text-red-500 transition">
                            Remove Checked
                        </button>
                        <button onClick={() => setItems([])}
                            className="flex-1 py-2 text-xs text-slate-500 hover:text-red-500 transition">
                            Clear All
                        </button>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
