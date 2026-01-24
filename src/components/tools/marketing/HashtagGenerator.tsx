'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Hash, Copy, Check, Sparkles } from 'lucide-react';

const POPULAR_HASHTAGS: Record<string, string[]> = {
    general: ['love', 'instagood', 'photooftheday', 'beautiful', 'happy', 'picoftheday', 'instagram', 'nature', 'travel', 'style'],
    business: ['entrepreneur', 'business', 'success', 'motivation', 'money', 'marketing', 'startup', 'leadership', 'branding', 'ceo'],
    fitness: ['fitness', 'gym', 'workout', 'fitnessmotivation', 'fit', 'training', 'health', 'bodybuilding', 'exercise', 'muscle'],
    food: ['food', 'foodie', 'foodporn', 'yummy', 'delicious', 'instafood', 'dinner', 'lunch', 'cooking', 'restaurant'],
    travel: ['travel', 'travelgram', 'wanderlust', 'travelphotography', 'adventure', 'explore', 'vacation', 'trip', 'holiday', 'instatravel'],
    fashion: ['fashion', 'style', 'ootd', 'outfitoftheday', 'fashionblogger', 'streetstyle', 'fashionista', 'lookoftheday', 'instastyle', 'trendy'],
    tech: ['tech', 'technology', 'coding', 'programming', 'developer', 'software', 'ai', 'innovation', 'digital', 'startup'],
    photography: ['photography', 'photo', 'photographer', 'photooftheday', 'photoshoot', 'portrait', 'landscape', 'streetphotography', 'naturephotography', 'camera'],
};

export default function HashtagGenerator() {
    const [topic, setTopic] = useState('');
    const [category, setCategory] = useState('general');
    const [count, setCount] = useState(15);
    const [copied, setCopied] = useState(false);

    const hashtags = useMemo(() => {
        const baseHashtags = POPULAR_HASHTAGS[category] || POPULAR_HASHTAGS.general;
        const topicWords = topic.toLowerCase().split(/\s+/).filter(Boolean);

        // Generate topic-based hashtags
        const topicHashtags = topicWords.flatMap(word => [
            word,
            `${word}life`,
            `${word}lover`,
            `insta${word}`,
            `${word}daily`,
        ]).filter(h => h.length > 2 && h.length < 25);

        // Combine and dedupe
        const all = [...new Set([...topicHashtags, ...baseHashtags])];

        // Shuffle and take count
        const shuffled = all.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(h => `#${h}`);
    }, [topic, category, count]);

    const hashtagString = hashtags.join(' ');

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(hashtagString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const regenerate = () => {
        // Force re-render by updating a dependency
        setCount(c => c);
    };

    return (
        <CalculatorLayout
            title="Hashtag Generator"
            description="Generate relevant hashtags for your social media posts"
            category="Marketing"
            results={
                <div className="space-y-4">
                    {hashtags.length > 0 && (
                        <>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">{hashtags.length} hashtags</span>
                                <button
                                    onClick={copyToClipboard}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy All'}
                                </button>
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                <div className="flex flex-wrap gap-2">
                                    {hashtags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-2">Ready to paste:</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 break-all">
                                    {hashtagString}
                                </p>
                            </div>
                        </>
                    )}

                    {!topic && (
                        <div className="text-center py-8">
                            <Hash className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">Enter a topic to generate hashtags</p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Topic or Keywords
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., coffee shop, morning vibes"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                        {Object.keys(POPULAR_HASHTAGS).map((cat) => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Number of Hashtags: {count}
                    </label>
                    <input
                        type="range"
                        min={5}
                        max={30}
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">Instagram allows up to 30 hashtags</p>
                </div>

                <button
                    onClick={regenerate}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                >
                    <Sparkles className="w-4 h-4" />
                    Regenerate
                </button>
            </div>
        </CalculatorLayout>
    );
}
