'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Type, Copy, Check } from 'lucide-react';

export default function CaseConverter() {
    const [text, setText] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    const conversions = useMemo(() => {
        const titleCase = text.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
        );

        const sentenceCase = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

        const camelCase = text.toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
            .replace(/^[A-Z]/, (c) => c.toLowerCase());

        const pascalCase = text.toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
            .replace(/^[a-z]/, (c) => c.toUpperCase());

        const snakeCase = text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        const kebabCase = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        return {
            uppercase: text.toUpperCase(),
            lowercase: text.toLowerCase(),
            titleCase,
            sentenceCase,
            camelCase,
            pascalCase,
            snakeCase,
            kebabCase,
            reversed: text.split('').reverse().join('')
        };
    }, [text]);

    const copyToClipboard = async (value: string, key: string) => {
        await navigator.clipboard.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const CaseResult = ({ label, value, caseKey }: { label: string; value: string; caseKey: string }) => (
        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-slate-500">{label}</span>
                <button
                    onClick={() => copyToClipboard(value, caseKey)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
                >
                    {copied === caseKey ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                </button>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{value || '—'}</p>
        </div>
    );

    return (
        <CalculatorLayout
            title="Case Converter"
            description="Transform text between different case formats"
            category="Writing"
            results={
                <div className="space-y-3">
                    <CaseResult label="UPPERCASE" value={conversions.uppercase} caseKey="upper" />
                    <CaseResult label="lowercase" value={conversions.lowercase} caseKey="lower" />
                    <CaseResult label="Title Case" value={conversions.titleCase} caseKey="title" />
                    <CaseResult label="Sentence case" value={conversions.sentenceCase} caseKey="sentence" />
                    <CaseResult label="camelCase" value={conversions.camelCase} caseKey="camel" />
                    <CaseResult label="PascalCase" value={conversions.pascalCase} caseKey="pascal" />
                    <CaseResult label="snake_case" value={conversions.snakeCase} caseKey="snake" />
                    <CaseResult label="kebab-case" value={conversions.kebabCase} caseKey="kebab" />
                    <CaseResult label="desreveR" value={conversions.reversed} caseKey="reversed" />
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Enter text to convert
                </label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste your text here..."
                    rows={8}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 resize-none"
                />
            </div>
        </CalculatorLayout>
    );
}
