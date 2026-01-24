'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Tag, Copy, Check, Eye, Search } from 'lucide-react';

export default function MetaTagGenerator() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [author, setAuthor] = useState('');
    const [url, setUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [copied, setCopied] = useState(false);

    const metaTags = useMemo(() => {
        const tags: string[] = [];

        if (title) {
            tags.push(`<title>${title}</title>`);
            tags.push(`<meta property="og:title" content="${title}" />`);
            tags.push(`<meta name="twitter:title" content="${title}" />`);
        }

        if (description) {
            tags.push(`<meta name="description" content="${description}" />`);
            tags.push(`<meta property="og:description" content="${description}" />`);
            tags.push(`<meta name="twitter:description" content="${description}" />`);
        }

        if (keywords) {
            tags.push(`<meta name="keywords" content="${keywords}" />`);
        }

        if (author) {
            tags.push(`<meta name="author" content="${author}" />`);
        }

        if (url) {
            tags.push(`<meta property="og:url" content="${url}" />`);
            tags.push(`<link rel="canonical" href="${url}" />`);
        }

        if (imageUrl) {
            tags.push(`<meta property="og:image" content="${imageUrl}" />`);
            tags.push(`<meta name="twitter:image" content="${imageUrl}" />`);
            tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
        }

        tags.push(`<meta property="og:type" content="website" />`);
        tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1" />`);

        return tags;
    }, [title, description, keywords, author, url, imageUrl]);

    const metaString = metaTags.join('\n');

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(metaString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <CalculatorLayout
            title="Meta Tag Generator"
            description="Generate SEO-friendly meta tags for your website"
            category="SEO"
            results={
                <div className="space-y-4">
                    {/* SERP Preview */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-500">Google Preview</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <p className="text-blue-600 dark:text-blue-400 text-lg font-medium truncate mb-1">
                                {title || 'Your Page Title'}
                            </p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-500 truncate mb-1">
                                {url || 'https://example.com/page'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {description || 'Your meta description will appear here. Make it compelling to increase click-through rates.'}
                            </p>
                        </div>
                    </div>

                    {/* Character Counts */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-slate-500">Title Length</p>
                            <p className={`text-lg font-bold ${title.length > 60 ? 'text-red-500' : title.length > 50 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                {title.length}/60
                            </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-slate-500">Description Length</p>
                            <p className={`text-lg font-bold ${description.length > 160 ? 'text-red-500' : description.length > 140 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                {description.length}/160
                            </p>
                        </div>
                    </div>

                    {/* Generated Code */}
                    {metaTags.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-500">Generated Meta Tags</span>
                                <button
                                    onClick={copyToClipboard}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="p-4 bg-slate-900 rounded-xl max-h-60 overflow-auto">
                                <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{metaString}</pre>
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Page Title <span className="text-slate-400">(50-60 chars)</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="My Awesome Page | Brand Name"
                        maxLength={70}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Meta Description <span className="text-slate-400">(150-160 chars)</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A compelling description of your page that encourages users to click..."
                        rows={3}
                        maxLength={170}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Keywords <span className="text-slate-400">(comma separated)</span>
                    </label>
                    <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="seo, marketing, tools"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Author
                        </label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Page URL
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        OG Image URL
                    </label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/og-image.jpg"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>
        </CalculatorLayout>
    );
}
