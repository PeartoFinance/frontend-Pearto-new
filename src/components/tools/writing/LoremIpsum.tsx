'use client';

import { useState } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { FileText, Copy, Check, RefreshCw } from 'lucide-react';

const LOREM_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

export default function LoremIpsum() {
    const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
    const [count, setCount] = useState(3);
    const [startWithLorem, setStartWithLorem] = useState(true);
    const [copied, setCopied] = useState(false);
    const [output, setOutput] = useState('');

    const generateWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

    const generateSentence = (startWithLorem: boolean = false) => {
        const length = Math.floor(Math.random() * 10) + 5;
        const words = [];

        if (startWithLorem) {
            words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
        }

        while (words.length < length) {
            words.push(generateWord());
        }

        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        return words.join(' ') + '.';
    };

    const generateParagraph = (startWithLorem: boolean = false) => {
        const sentenceCount = Math.floor(Math.random() * 4) + 3;
        const sentences = [];

        for (let i = 0; i < sentenceCount; i++) {
            sentences.push(generateSentence(i === 0 && startWithLorem));
        }

        return sentences.join(' ');
    };

    const generate = () => {
        let result = '';

        switch (type) {
            case 'paragraphs':
                const paragraphs = [];
                for (let i = 0; i < count; i++) {
                    paragraphs.push(generateParagraph(i === 0 && startWithLorem));
                }
                result = paragraphs.join('\n\n');
                break;
            case 'sentences':
                const sentences = [];
                for (let i = 0; i < count; i++) {
                    sentences.push(generateSentence(i === 0 && startWithLorem));
                }
                result = sentences.join(' ');
                break;
            case 'words':
                const words = [];
                if (startWithLorem) {
                    words.push('Lorem', 'ipsum');
                }
                while (words.length < count) {
                    words.push(generateWord());
                }
                result = words.slice(0, count).join(' ');
                break;
        }

        setOutput(result);
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <CalculatorLayout
            title="Lorem Ipsum Generator"
            description="Generate placeholder text for design and development"
            category="Writing"
            results={
                <div className="space-y-4">
                    {output ? (
                        <>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl max-h-80 overflow-y-auto">
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {output}
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                                {output.split(/\s+/).length} words • {output.length} characters
                            </p>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">Click "Generate" to create placeholder text</p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Generate
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['paragraphs', 'sentences', 'words'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${type === t
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Count: {count}
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={type === 'words' ? 500 : type === 'sentences' ? 20 : 10}
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={startWithLorem}
                        onChange={(e) => setStartWithLorem(e.target.checked)}
                        className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                        Start with "Lorem ipsum..."
                    </span>
                </label>

                <button
                    onClick={generate}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                >
                    <RefreshCw className="w-4 h-4" />
                    Generate
                </button>
            </div>
        </CalculatorLayout>
    );
}
