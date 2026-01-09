'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
    compact?: boolean;
    className?: string;
}

export function MarkdownRenderer({ content, compact = false, className = '' }: MarkdownRendererProps) {
    return (
        <div className={`${compact ? 'text-xs' : 'text-sm'} leading-relaxed ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Headers
                    h1: ({ children }) => (
                        <h1 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-4 mb-3 pb-2 border-b-2 border-emerald-200 dark:border-emerald-800">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-5 mb-2 pb-1 border-b border-emerald-100 dark:border-emerald-900">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">
                            {children}
                        </h3>
                    ),
                    // Paragraphs
                    p: ({ children }) => (
                        <p className="my-3 leading-relaxed text-slate-700 dark:text-slate-300">
                            {children}
                        </p>
                    ),
                    // Lists
                    ul: ({ children }) => (
                        <ul className="my-3 ml-1 space-y-2">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-3 ml-1 space-y-2 list-decimal list-inside">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <span className="text-emerald-500 mt-1.5 text-xs">●</span>
                            <span className="flex-1">{children}</span>
                        </li>
                    ),
                    // Bold text
                    strong: ({ children }) => (
                        <strong className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {children}
                        </strong>
                    ),
                    // Italic text
                    em: ({ children }) => (
                        <em className="italic text-slate-600 dark:text-slate-400">
                            {children}
                        </em>
                    ),
                    // Tables
                    table: ({ children }) => (
                        <div className="my-4 overflow-x-auto rounded-lg border border-slate-700">
                            <table className="w-full text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-emerald-900/40">
                            {children}
                        </thead>
                    ),
                    th: ({ children }) => (
                        <th className="px-3 py-2 text-left font-semibold text-emerald-300 border-b border-slate-700">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-3 py-2 border-b border-slate-800">
                            {children}
                        </td>
                    ),
                    // Horizontal rule
                    hr: () => (
                        <hr className="my-4 border-t-2 border-slate-700" />
                    ),
                    // Code
                    code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                            <code className="px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300 text-xs font-mono">
                                {children}
                            </code>
                        ) : (
                            <code className="block p-3 rounded-lg bg-slate-800 text-xs font-mono overflow-x-auto">
                                {children}
                            </code>
                        );
                    },
                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="my-3 pl-4 border-l-4 border-emerald-700 bg-emerald-900/20 py-2 italic text-slate-400">
                            {children}
                        </blockquote>
                    ),
                    // Links
                    a: ({ href, children }) => (
                        <a href={href} className="text-emerald-400 hover:text-emerald-300 underline" target="_blank" rel="noopener noreferrer">
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default MarkdownRenderer;
