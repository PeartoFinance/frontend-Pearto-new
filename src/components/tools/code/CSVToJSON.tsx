'use client';

import { useState } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { FileSpreadsheet, Copy, Check, ArrowRightLeft } from 'lucide-react';

export default function CSVToJSON() {
    const [csvInput, setCsvInput] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
    const [hasHeaders, setHasHeaders] = useState(true);
    const [delimiter, setDelimiter] = useState(',');
    const [copied, setCopied] = useState(false);

    const convert = () => {
        try {
            const rows = csvInput.trim().split('\n').map(row =>
                row.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''))
            );

            if (rows.length === 0) {
                setJsonOutput('[]');
                return;
            }

            let result: Record<string, string>[] | string[][];

            if (hasHeaders && rows.length > 1) {
                const headers = rows[0];
                result = rows.slice(1).map(row => {
                    const obj: Record<string, string> = {};
                    headers.forEach((header, i) => {
                        obj[header || `col${i + 1}`] = row[i] || '';
                    });
                    return obj;
                });
            } else {
                result = rows;
            }

            setJsonOutput(JSON.stringify(result, null, 2));
        } catch (e) {
            setJsonOutput('Error parsing CSV');
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(jsonOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadSample = () => {
        setCsvInput(`name,age,city,occupation
John Doe,28,New York,Engineer
Jane Smith,32,Los Angeles,Designer
Bob Johnson,45,Chicago,Manager
Alice Brown,29,Seattle,Developer`);
    };

    return (
        <CalculatorLayout
            title="CSV to JSON Converter"
            description="Convert CSV data to JSON format"
            category="Data & Code"
            results={
                <div className="space-y-4">
                    {jsonOutput ? (
                        <>
                            <div className="flex justify-end">
                                <button
                                    onClick={copyToClipboard}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy JSON'}
                                </button>
                            </div>
                            <div className="p-4 bg-slate-900 rounded-xl max-h-80 overflow-auto">
                                <pre className="text-sm text-emerald-400 font-mono whitespace-pre-wrap">{jsonOutput}</pre>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">Paste CSV data and click Convert</p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            CSV Input
                        </label>
                        <button
                            onClick={loadSample}
                            className="text-xs text-emerald-600 hover:text-emerald-700"
                        >
                            Load Sample
                        </button>
                    </div>
                    <textarea
                        value={csvInput}
                        onChange={(e) => setCsvInput(e.target.value)}
                        placeholder="name,age,city\nJohn,25,NYC"
                        rows={8}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono text-sm resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Delimiter
                        </label>
                        <select
                            value={delimiter}
                            onChange={(e) => setDelimiter(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value=",">Comma (,)</option>
                            <option value=";">Semicolon (;)</option>
                            <option value="\t">Tab</option>
                            <option value="|">Pipe (|)</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hasHeaders}
                                onChange={(e) => setHasHeaders(e.target.checked)}
                                className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                First row is header
                            </span>
                        </label>
                    </div>
                </div>

                <button
                    onClick={convert}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    Convert to JSON
                </button>
            </div>
        </CalculatorLayout>
    );
}
