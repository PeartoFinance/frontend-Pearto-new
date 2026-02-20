'use client';

import { Quote, Star, Loader2 } from 'lucide-react';
import { useTestimonials } from '@/hooks/useContentData';

export default function Testimonials() {
    const { data: testimonials = [], isLoading: loading } = useTestimonials(6);

    if (!loading && testimonials.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/50">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Quote size={18} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Success Stories</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">See what others are saying</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-emerald-500" />
                </div>
            ) : (
                <div className="space-y-3">
                    {testimonials.slice(0, 3).map((item) => (
                        <div key={item.id} className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-100 dark:border-slate-600/30">
                            <div className="flex gap-0.5 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} className={i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'} />
                                ))}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm italic line-clamp-3 mb-3">
                                &ldquo;{item.content}&rdquo;
                            </p>
                            <div className="flex items-center gap-2.5">
                                <img
                                    src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`}
                                    alt={item.name}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-600"
                                />
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</div>
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                        {item.title}{item.company && <span> at {item.company}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
