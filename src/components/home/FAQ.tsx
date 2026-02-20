'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useFAQ } from '@/hooks/useContentData';

export default function FAQ() {
    const { data: faqs = [], isLoading: loading } = useFAQ(true);
    const [openId, setOpenId] = useState<string | null>(null);

    const toggleFAQ = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    if (!loading && faqs.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <HelpCircle size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Answers</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Frequently Asked Questions</p>
                    </div>
                </div>
                <Link
                    href="/faq"
                    className="flex items-center gap-1 text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
                >
                    View All <ArrowRight size={14} />
                </Link>
            </div>

            <div className="space-y-3">
                {faqs.slice(0, 5).map((faq) => (
                    <div
                        key={faq.id}
                        className={`rounded-xl border transition-all duration-200 overflow-hidden ${openId === faq.id
                            ? 'bg-slate-50 dark:bg-slate-700/50 border-emerald-500 dark:border-emerald-500'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-600'
                            }`}
                    >
                        <button
                            onClick={() => toggleFAQ(faq.id)}
                            className="w-full flex items-center justify-between p-4 text-left"
                        >
                            <span className="font-medium text-slate-900 dark:text-white text-sm pr-4">{faq.question}</span>
                            {openId === faq.id ? (
                                <ChevronUp className="text-emerald-500 shrink-0" size={18} />
                            ) : (
                                <ChevronDown className="text-slate-400 shrink-0" size={18} />
                            )}
                        </button>

                        <div
                            className={`grid transition-all duration-300 ease-in-out ${openId === faq.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                }`}
                        >
                            <div className="overflow-hidden">
                                <div className="p-4 pt-0 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-200 dark:border-slate-700 mt-1">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
