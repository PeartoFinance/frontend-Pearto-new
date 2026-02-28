'use client';

import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import TickerTape from '@/components/layout/TickerTape';
import { Book, Code, Globe, Zap, Database, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

function ApiDocsContent() {
    const baseUrl = 'https://peartofinance.com/api/v1/public';

    const endpoints = [
        {
            title: 'Market Quotes',
            method: 'GET',
            path: '/market/quotes/{symbol}',
            description: 'Get the latest real-time or delayed quote for any supported stock or ETF symbol.',
            params: [
                { name: 'symbol', type: 'string', required: true, desc: 'The ticker symbol (e.g., AAPL, TSLA)' }
            ],
            response: `{
  "symbol": "AAPL",
  "price": 185.92,
  "change": 2.15,
  "changePercent": 1.17,
  "volume": 52145800,
  "timestamp": "2026-02-20T10:00:00Z"
}`
        },
        {
            title: 'Cryptocurrency Quotes',
            method: 'GET',
            path: '/crypto/quotes/{symbol}',
            description: 'Get the latest price, 24h change, and volume for a cryptocurrency pair.',
            params: [
                { name: 'symbol', type: 'string', required: true, desc: 'The crypto symbol (e.g., BTC, ETH)' }
            ],
            response: `{
  "symbol": "BTC",
  "price": 54320.50,
  "change24h": -1.25,
  "volume24h": 34500000000,
  "timestamp": "2026-02-20T10:00:00Z"
}`
        },
        {
            title: 'Latest Financial News',
            method: 'GET',
            path: '/news/latest',
            description: 'Fetch the 20 most recent high-impact financial news articles globally.',
            params: [],
            response: `[
  {
    "id": 796,
    "title": "Analysts Remain Bullish on Tech Giants",
    "source": "Financial Post",
    "category": "technology",
    "publishedAt": "2026-02-20T09:15:00Z",
    "relatedSymbol": "AAPL",
    "link": "https://..."
  }
]`
        },
        {
            title: 'Forex Rates',
            method: 'GET',
            path: '/forex/rates',
            description: 'Get real-time exchange rates for major and minor currency pairs.',
            params: [],
            response: `[
  {
    "pair": "EUR/USD",
    "baseCurrency": "EUR",
    "targetCurrency": "USD",
    "rate": 1.0850,
    "change": 0.0012,
    "changePercent": 0.11
  }
]`
        },
        {
            title: 'Commodity Prices',
            method: 'GET',
            path: '/commodities/latest',
            description: 'Get the latest spot prices for Gold, Silver, Oil, and other major commodities.',
            params: [],
            response: `[
  {
    "symbol": "GC=F",
    "name": "Gold",
    "price": 2045.30,
    "change": 5.10,
    "unit": "USD/oz"
  }
]`
        },
        {
            title: 'Economic Events Calendar',
            method: 'GET',
            path: '/market/economic-events',
            description: 'Retrieve a list of upcoming high-impact and medium-impact global economic events.',
            params: [],
            response: `[
  {
    "id": "event-123",
    "title": "US Nonfarm Payrolls",
    "country": "US",
    "eventDate": "2026-03-06T13:30:00Z",
    "importance": "high"
  }
]`
        },
        {
            title: 'Live Sports Events',
            method: 'GET',
            path: '/sports/events',
            description: 'Access scores, schedules, and live status of major sporting events globally.',
            params: [],
            response: `[
  {
    "id": 105,
    "name": "Lakers vs Warriors",
    "sportType": "basketball",
    "status": "scheduled",
    "eventDate": "2026-02-21T03:00:00Z"
  }
]`
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 font-sans pb-12">
            <div className="fixed top-0 right-0 left-0 z-40 bg-white dark:bg-slate-900">
                <TickerTape />
                <Header />
            </div>

            <div className="pt-[112px] md:pt-[120px]">
                <div className="container mx-auto px-4 py-8 max-w-5xl">
                    <Link href="/developers" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium mb-6 transition-colors">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>

                    <div className="mb-10">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <Book className="text-emerald-500 w-10 h-10" /> API Documentation
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
                            Integrate PeartoFinance's incredibly rich, low-latency market data, news, and alternative data straight into your applications.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <Zap className="w-8 h-8 text-emerald-500 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Fast Integration</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">RESTful JSON endpoints designed for simplicity and immediate implementation.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <Database className="w-8 h-8 text-blue-500 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Detailed Datasets</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Access quotes, historical news, economic calendars, and even live sports scores.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <Globe className="w-8 h-8 text-indigo-500 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Global Scale</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Robust backend ready to handle request volumes globally across any timezone.</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-12">
                        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Code className="text-emerald-500 w-6 h-6" /> Authentication
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                All API requests require your active API key to be passed via the HTTP <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-400">Authorization</code> header as a Bearer token.
                            </p>

                            <div className="bg-slate-900 rounded-xl p-5 overflow-x-auto border border-slate-800 shadow-inner">
                                <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
                                    {`curl -X GET "${baseUrl}/news/latest" \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE"`}
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Available Endpoints</h2>

                        {endpoints.map((ep, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold tracking-wider inline-block w-max">
                                            {ep.method}
                                        </span>
                                        <code className="text-slate-900 dark:text-white font-mono text-lg truncate">
                                            {ep.path}
                                        </code>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 mt-2">{ep.description}</p>
                                </div>

                                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Parameters</h4>
                                        {ep.params.length === 0 ? (
                                            <p className="text-slate-500 dark:text-slate-400 text-sm italic">No path or query parameters required.</p>
                                        ) : (
                                            <ul className="space-y-3">
                                                {ep.params.map((p, j) => (
                                                    <li key={j} className="flex gap-3 text-sm border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{p.name}</span>
                                                                <span className="text-slate-400 font-mono text-xs">{p.type}</span>
                                                                {p.required && <span className="text-red-500 text-[10px] font-bold uppercase">Required</span>}
                                                            </div>
                                                            <p className="text-slate-500 dark:text-slate-400">{p.desc}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Example Response</h4>
                                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-800 text-sm shadow-inner relative group">
                                            <pre className="text-emerald-400 font-mono leading-relaxed">{ep.response}</pre>
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="bg-slate-800 text-xs text-slate-400 px-2 py-1 rounded font-mono">JSON</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center pb-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Ready to start?</h3>
                        <Link href="/developers" className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1">
                            Generate Your API Key
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function ApiDocsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>}>
            <ApiDocsContent />
        </Suspense>
    );
}
