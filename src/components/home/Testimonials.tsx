'use client';

import { useEffect, useState } from 'react';
import { Quote, Star, Loader2 } from 'lucide-react';

interface Testimonial {
    id: number;
    name: string;
    title: string;
    company: string;
    avatarUrl: string;
    content: string;
    rating: number;
    createdAt: string;
}

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                // Fetch all active testimonials, not just featured ones
                const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/content/testimonials?limit=6`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setTestimonials(data);
                }
            } catch (err) {
                console.error('Failed to fetch testimonials', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    if (!loading && testimonials.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Quote size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Success Stories</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">See what others are saying</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-emerald-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((item) => (
                        <div key={item.id} className="bg-gray-50 dark:bg-slate-700/50 p-5 rounded-xl border border-gray-100 dark:border-slate-600/50 hover:shadow-md transition-shadow">
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className={i < item.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}
                                    />
                                ))}
                            </div>

                            <p className="text-gray-700 dark:text-gray-300 text-sm italic mb-6 line-clamp-4">
                                "{item.content}"
                            </p>

                            <div className="flex items-center gap-3 mt-auto">
                                <img
                                    src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-600"
                                />
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
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
