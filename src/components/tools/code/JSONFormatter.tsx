'use client';

import { useState } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Code, Copy, Check, AlertCircle, CheckCircle } from 'lucide-react';

export default function JSONFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [indentSize, setIndentSize] = useState(2);

    const format = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, indentSize));
            setError(null);
        } catch (e) {
            setError((e as Error).message);
            setOutput('');
        }
    };

    const minify = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError(null);
        } catch (e) {
            setError((e as Error).message);
            setOutput('');
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadSample = () => {
        setInput('{"name":"John Doe","age":30,"email":"john@example.com","address":{"street":"123 Main St","city":"New York","zip":"10001"},"hobbies":["reading","gaming","cooking"],"active":true}');
    };

    return (
        <CalculatorLayout
            title="JSON Formatter"
            description="Validate, format, and minify JSON data"
            category="Data & Code"
            results={
                <div className="space-y-4">
                    {error ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-red-700 dark:text-red-400">Invalid JSON</span>
                            </div>
                            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    ) : output ? (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Valid JSON</span>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl max-h-80 overflow-auto border border-slate-200 dark:border-slate-800">
                                <pre className="text-sm text-emerald-700 dark:text-emerald-400 font-mono whitespace-pre-wrap">{output}</pre>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <Code className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">Paste JSON and click Format or Minify</p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            JSON Input
                        </label>
                        <button
                            onClick={loadSample}
                            className="text-xs text-emerald-600 hover:text-emerald-700"
                        >
                            Load Sample
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder='{"key": "value"}'
                        rows={10}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono text-sm resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Indent Size: {indentSize} spaces
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={8}
                        value={indentSize}
                        onChange={(e) => setIndentSize(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={format}
                        className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                    >
                        Format (Beautify)
                    </button>
                    <button
                        onClick={minify}
                        className="px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition"
                    >
                        Minify
                    </button>
                </div>
            </div>
        </CalculatorLayout>
    );
}
