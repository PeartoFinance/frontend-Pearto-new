'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';

// Financial glossary terms
const glossaryTerms = [
    { term: 'APR', definition: 'Annual Percentage Rate - The yearly interest rate charged on borrowed money or earned through investments.', category: 'Banking' },
    { term: 'APY', definition: 'Annual Percentage Yield - The real rate of return earned on an investment, taking compound interest into account.', category: 'Banking' },
    { term: 'Bear Market', definition: 'A market condition where prices are falling or expected to fall, typically by 20% or more from recent highs.', category: 'Markets' },
    { term: 'Blue Chip', definition: 'Shares of large, well-established, financially stable companies with a history of reliable growth.', category: 'Stocks' },
    { term: 'Bond', definition: 'A fixed-income instrument representing a loan made by an investor to a borrower, typically corporate or governmental.', category: 'Fixed Income' },
    { term: 'Bull Market', definition: 'A market condition where prices are rising or expected to rise, characterized by optimism and investor confidence.', category: 'Markets' },
    { term: 'Compound Interest', definition: 'Interest calculated on both the initial principal and the accumulated interest from previous periods.', category: 'Banking' },
    { term: 'Dividend', definition: 'A portion of a company\'s earnings distributed to shareholders, usually paid quarterly.', category: 'Stocks' },
    { term: 'Diversification', definition: 'A risk management strategy that mixes a variety of investments within a portfolio.', category: 'Investing' },
    { term: 'ETF', definition: 'Exchange-Traded Fund - A type of security that tracks an index, commodity, or basket of assets and trades like a stock.', category: 'Investing' },
    { term: 'Equity', definition: 'Ownership interest in a company, represented by shares of stock.', category: 'Stocks' },
    { term: 'FDIC', definition: 'Federal Deposit Insurance Corporation - A US government agency that insures deposits in banks and savings associations.', category: 'Banking' },
    { term: 'Hedge', definition: 'An investment made to reduce the risk of adverse price movements in an asset.', category: 'Investing' },
    { term: 'Index Fund', definition: 'A mutual fund or ETF designed to follow certain preset rules to track a specified basket of investments.', category: 'Investing' },
    { term: 'IPO', definition: 'Initial Public Offering - The first time a company sells shares to the public.', category: 'Stocks' },
    { term: 'Liquidity', definition: 'How quickly and easily an asset can be converted into cash without affecting its market price.', category: 'Markets' },
    { term: 'Market Cap', definition: 'Market Capitalization - The total market value of a company\'s outstanding shares of stock.', category: 'Stocks' },
    { term: 'Mutual Fund', definition: 'An investment vehicle made up of a pool of funds collected from many investors to invest in securities.', category: 'Investing' },
    { term: 'P/E Ratio', definition: 'Price-to-Earnings Ratio - A valuation measure comparing a company\'s stock price to its earnings per share.', category: 'Stocks' },
    { term: 'Portfolio', definition: 'A collection of financial investments like stocks, bonds, commodities, and cash equivalents.', category: 'Investing' },
    { term: 'ROI', definition: 'Return on Investment - A measure of the profitability of an investment.', category: 'Investing' },
    { term: 'SEC', definition: 'Securities and Exchange Commission - The US regulatory agency overseeing the securities industry.', category: 'Regulation' },
    { term: 'SIP', definition: 'Systematic Investment Plan - A method of investing a fixed amount regularly in mutual funds.', category: 'Investing' },
    { term: 'Volatility', definition: 'A measure of how much the price of an asset fluctuates over time.', category: 'Markets' },
    { term: 'Yield', definition: 'The income return on an investment, such as interest or dividends, expressed as a percentage.', category: 'Investing' },
];

export default function GlossaryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = useMemo(() => {
        const cats = new Set(glossaryTerms.map(t => t.category));
        return ['All', ...Array.from(cats).sort()];
    }, []);

    const filteredTerms = useMemo(() => {
        return glossaryTerms
            .filter(t => selectedCategory === 'All' || t.category === selectedCategory)
            .filter(t =>
                t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.definition.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => a.term.localeCompare(b.term));
    }, [searchQuery, selectedCategory]);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] p-4 lg:p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-2 transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-purple-600" />
                                Financial Glossary
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Learn common financial terms and concepts
                            </p>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search terms..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${selectedCategory === cat
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Terms List */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredTerms.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500">
                                        No terms found matching your search.
                                    </div>
                                ) : (
                                    filteredTerms.map((item) => (
                                        <div key={item.term} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">{item.term}</h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.definition}</p>
                                                </div>
                                                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full whitespace-nowrap">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
