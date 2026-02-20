'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { useCurrency } from '@/contexts/CurrencyContext';
import { FileText, Plus, Trash2, Printer, Building2 } from 'lucide-react';

interface InvoiceItem {
    id: number;
    description: string;
    qty: number;
    price: number;
}

let nextItemId = 3;

export default function InvoiceGenerator() {
    const { formatPrice } = useCurrency();
    const [businessName, setBusinessName] = useState('My Business LLC');
    const [clientName, setClientName] = useState('Client Company');
    const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [taxRate, setTaxRate] = useState(10);
    const [notes, setNotes] = useState('Payment due within 30 days. Thank you for your business!');
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: 1, description: 'Web Development Service', qty: 1, price: 2500 },
        { id: 2, description: 'UI/UX Design', qty: 2, price: 800 },
    ]);

    const addItem = () => {
        setItems([...items, { id: nextItemId++, description: '', qty: 1, price: 0 }]);
    };

    const removeItem = (id: number) => {
        if (items.length > 1) setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: number, field: keyof InvoiceItem, value: string | number) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: field === 'description' ? value : Number(value) } : i));
    };

    const result = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
        const tax = subtotal * (taxRate / 100);
        const grandTotal = subtotal + tax;
        return { subtotal, tax, grandTotal };
    }, [items, taxRate]);

    // Donut
    const taxPct = result.grandTotal > 0 ? Math.round((result.tax / result.grandTotal) * 100) : 0;
    const subtotalPct = 100 - taxPct;
    const r = 42, circ = 2 * Math.PI * r;
    const taxOffset = circ - (taxPct / 100) * circ;

    return (
        <CalculatorLayout
            title="Invoice Generator"
            description="Create professional invoices with automatic calculations"
            category="Business Operations"
            insights={[
                { label: 'Subtotal', value: formatPrice(result.subtotal) },
                { label: 'Tax', value: formatPrice(result.tax), color: 'text-amber-600' },
                { label: 'Items', value: `${items.length}` },
                { label: 'Grand Total', value: formatPrice(result.grandTotal), color: 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Invoice Preview */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Invoice header */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-5 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Building2 size={18} />
                                        <h3 className="text-lg font-bold">{businessName || 'Business Name'}</h3>
                                    </div>
                                    <p className="text-xs text-slate-400">INVOICE</p>
                                </div>
                                <div className="text-right text-xs space-y-0.5">
                                    <p className="font-semibold text-sm">{invoiceNumber}</p>
                                    <p className="text-slate-400">Date: {invoiceDate}</p>
                                    {dueDate && <p className="text-slate-400">Due: {dueDate}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Bill To</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{clientName || 'Client Name'}</p>
                        </div>

                        {/* Items table */}
                        <div className="px-5 py-3">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700">
                                        <th className="text-left py-2 font-semibold">Description</th>
                                        <th className="text-center py-2 font-semibold w-16">Qty</th>
                                        <th className="text-right py-2 font-semibold w-24">Price</th>
                                        <th className="text-right py-2 font-semibold w-24">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id} className="border-b border-slate-50 dark:border-slate-700/50">
                                            <td className="py-2.5 text-slate-700 dark:text-slate-300">{item.description || '—'}</td>
                                            <td className="py-2.5 text-center text-slate-600 dark:text-slate-400">{item.qty}</td>
                                            <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">{formatPrice(item.price)}</td>
                                            <td className="py-2.5 text-right font-medium text-slate-900 dark:text-white">{formatPrice(item.qty * item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-700/30 space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                                <span className="font-medium text-slate-900 dark:text-white">{formatPrice(result.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Tax ({taxRate}%)</span>
                                <span className="font-medium text-amber-600">{formatPrice(result.tax)}</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-600 pt-2 mt-2 flex justify-between">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Grand Total</span>
                                <span className="text-lg font-bold text-emerald-600">{formatPrice(result.grandTotal)}</span>
                            </div>
                        </div>

                        {/* Notes */}
                        {notes && (
                            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Notes</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">{notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Donut chart breakdown */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            <circle cx="50" cy="50" r={r} fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={taxOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                            <text x="50" y="54" textAnchor="middle" className="fill-slate-900 dark:fill-white text-xs font-bold">{taxPct}%</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-600 dark:text-slate-400">Subtotal</span></div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{subtotalPct}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs text-slate-600 dark:text-slate-400">Tax</span></div>
                                <span className="text-sm font-semibold text-amber-600">{taxPct}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Business & Client */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Name</label>
                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Client Name</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Invoice #</label>
                    <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date</label>
                    <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
            </div>

            {/* Line Items */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Line Items</label>
                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-lg space-y-2">
                            <div className="flex items-center gap-2">
                                <input type="text" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                                    placeholder="Description" className="flex-1 px-2 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-emerald-500" />
                                {items.length > 1 && (
                                    <button onClick={() => removeItem(item.id)} className="p-1 text-slate-400 hover:text-rose-500 transition">
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-slate-500">Qty</label>
                                    <input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} min={1}
                                        className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500">Price</label>
                                    <input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', e.target.value)} min={0}
                                        className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-emerald-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={addItem}
                    className="w-full mt-2 py-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition flex items-center justify-center gap-1.5 text-xs font-medium">
                    <Plus size={14} /> Add Item
                </button>
            </div>

            {/* Tax Rate */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax Rate</label>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{taxRate}%</span>
                </div>
                <input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} min={0} max={50} step={0.5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={30} step={0.5} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm resize-none" />
            </div>
        </CalculatorLayout>
    );
}
