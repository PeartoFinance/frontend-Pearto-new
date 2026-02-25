'use client';

import React from 'react';
import {
    TrendingUp, ArrowUp, ArrowDown, Calculator, BarChart3,
    DollarSign, Cloud, GitCompare, Filter, Activity, Newspaper, PieChart
} from 'lucide-react';
import PriceDisplay from '@/components/common/PriceDisplay';

interface StockData {
    symbol?: string;
    name?: string;
    price?: number;
    changePercent?: number;
    change24h?: number;
    changePercent24h?: number;
    volume?: number;
    volume24h?: number;
    marketCap?: number;
    peRatio?: number;
    eps?: number;
    dividendYield?: number;
    sector?: string;
    beta?: number;
    weekHigh52?: number;
    weekLow52?: number;
}

interface CalculatorData {
    totalValue?: number;
    monthlyInvestment?: number;
    totalInvested?: number;
    estimatedReturns?: number;
    emi?: number;
    principal?: number;
    totalInterest?: number;
    totalPayment?: number;
    duration?: string;
    interestRate?: string;
    finalAmount?: number;
    rate?: string;
    effectiveRate?: number;
    compoundingFrequency?: string;
    yearlyBreakdown?: { year: number; value: number; interest: number }[];
    type?: string;
}

interface WeatherData {
    location?: string;
    temperature?: number;
    condition?: string;
    windSpeed?: number;
    humidity?: number;
}

interface ForexData {
    base?: string;
    rates?: Record<string, number>;
}

interface ComparisonData {
    type?: string;
    stocks?: StockData[];
    count?: number;
}

interface ScreenerData {
    type?: string;
    criteria?: Record<string, unknown>;
    results?: StockData[];
    count?: number;
}

interface SectorData {
    type?: string;
    sectors?: { sector: string; stockCount: number; avgChange: number; totalMarketCap: number }[];
}

interface TechnicalData {
    type?: string;
    symbol?: string;
    price?: number;
    signal?: string;
    rsi?: number;
    positionIn52wRange?: number;
    support?: number[];
    resistance?: number[];
    pivot?: number;
    weekHigh52?: number;
    weekLow52?: number;
    beta?: number;
}

interface NewsData {
    query?: string;
    results?: { title: string; summary?: string; source?: string; publishedAt?: string }[];
    message?: string;
}

// Stock/Crypto Card - Enhanced with more data
export function StockCard({ data }: { data: StockData }) {
    const changePercent = data.changePercent ?? data.changePercent24h ?? 0;
    const isPositive = changePercent >= 0;

    return (
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                        {(data.symbol || 'N/A').slice(0, 2)}
                    </div>
                    <div>
                        <div className="font-bold text-white">{data.symbol}</div>
                        <div className="text-xs text-slate-400">{data.name || 'Stock'}</div>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(changePercent).toFixed(2)}%
                </div>
            </div>
            <div className="text-2xl font-bold text-white mb-3">
                <PriceDisplay amount={data.price || 0} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-700/50 rounded-lg p-2">
                    <div className="text-slate-500">Volume</div>
                    <div className="text-white font-medium">{((data.volume ?? data.volume24h) || 0).toLocaleString()}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                    <div className="text-slate-500">Mkt Cap</div>
                    <div className="text-white font-medium"><PriceDisplay amount={(data.marketCap || 0) / 1e9} />B</div>
                </div>
                {data.peRatio && (
                    <div className="bg-slate-700/50 rounded-lg p-2">
                        <div className="text-slate-500">P/E Ratio</div>
                        <div className="text-white font-medium">{data.peRatio.toFixed(1)}</div>
                    </div>
                )}
                {data.dividendYield != null && data.dividendYield > 0 && (
                    <div className="bg-slate-700/50 rounded-lg p-2">
                        <div className="text-slate-500">Div Yield</div>
                        <div className="text-emerald-400 font-medium">{data.dividendYield.toFixed(2)}%</div>
                    </div>
                )}
                {data.sector && (
                    <div className="bg-slate-700/50 rounded-lg p-2 col-span-2">
                        <div className="text-slate-500">Sector</div>
                        <div className="text-white font-medium">{data.sector}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

// SIP Calculator Card
export function SIPCard({ data }: { data: CalculatorData }) {
    return (
        <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-600/30">
            <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white">SIP Returns</span>
            </div>
            <div className="bg-emerald-800/30 rounded-lg p-3 mb-3">
                <div className="text-emerald-300 text-xs mb-1">Projected Value</div>
                <div className="text-2xl font-bold text-emerald-400"><PriceDisplay amount={data.totalValue || 0} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Monthly</div>
                    <div className="text-white font-medium"><PriceDisplay amount={data.monthlyInvestment || 0} /></div>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Invested</div>
                    <div className="text-white font-medium"><PriceDisplay amount={data.totalInvested || 0} /></div>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Returns</div>
                    <div className="text-emerald-400 font-medium"><PriceDisplay amount={data.estimatedReturns || 0} /></div>
                </div>
            </div>
        </div>
    );
}

// EMI Calculator Card
export function EMICard({ data }: { data: CalculatorData }) {
    return (
        <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-600/30">
            <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white">EMI Calculator</span>
            </div>
            <div className="bg-blue-800/30 rounded-lg p-3 mb-3">
                <div className="text-blue-300 text-xs mb-1">Monthly EMI</div>
                <div className="text-2xl font-bold text-blue-400"><PriceDisplay amount={data.emi || 0} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Principal</div>
                    <div className="text-white font-medium"><PriceDisplay amount={data.principal || 0} /></div>
                </div>
                <div className="p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Total Interest</div>
                    <div className="text-amber-400 font-medium"><PriceDisplay amount={data.totalInterest || 0} /></div>
                </div>
            </div>
        </div>
    );
}

// Weather Card
export function WeatherCard({ data }: { data: WeatherData }) {
    return (
        <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-4 h-4 text-white/80" />
                <span className="text-white/90 font-medium text-sm">{data.location}</span>
            </div>
            <div className="flex items-center gap-3">
                <Cloud className="w-12 h-12 text-white" />
                <div>
                    <div className="text-3xl font-bold text-white">{data.temperature}°C</div>
                    <div className="text-white/80 text-xs">{data.condition} • Wind: {data.windSpeed} km/h</div>
                </div>
            </div>
        </div>
    );
}

// Forex Card
export function ForexCard({ data }: { data: ForexData }) {
    return (
        <div className="bg-amber-900/30 rounded-xl p-4 border border-amber-600/30">
            <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white">Exchange Rates ({data.base})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {Object.entries(data.rates || {}).slice(0, 4).map(([currency, rate]) => (
                    <div key={currency} className="flex justify-between items-center bg-slate-800/50 rounded-lg p-2 text-sm">
                        <span className="text-amber-200">{currency}</span>
                        <span className="text-white font-bold">{Number(rate).toFixed(4)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Error Card
export function ErrorCard({ message }: { message: string }) {
    return (
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
            <span className="font-medium">Error:</span> {message}
        </div>
    );
}

// Stock Comparison Card
export function ComparisonCard({ data }: { data: ComparisonData }) {
    const stocks = data.stocks || [];
    if (stocks.length === 0) return null;

    return (
        <div className="bg-slate-800/80 rounded-xl p-4 border border-violet-500/30">
            <div className="flex items-center gap-2 mb-3">
                <GitCompare className="w-5 h-5 text-violet-400" />
                <span className="font-bold text-white">Stock Comparison</span>
                <span className="text-xs text-slate-500 ml-auto">{stocks.length} stocks</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-slate-700/50">
                            <th className="text-left py-2 px-2 text-slate-400 font-medium">Symbol</th>
                            <th className="text-right py-2 px-2 text-slate-400 font-medium">Price</th>
                            <th className="text-right py-2 px-2 text-slate-400 font-medium">Change</th>
                            <th className="text-right py-2 px-2 text-slate-400 font-medium hidden sm:table-cell">P/E</th>
                            <th className="text-right py-2 px-2 text-slate-400 font-medium hidden sm:table-cell">Mkt Cap</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((s, idx) => {
                            const cp = s.changePercent ?? 0;
                            return (
                                <tr key={idx} className="border-b border-slate-800/50 last:border-0">
                                    <td className="py-2 px-2">
                                        <div className="font-bold text-white">{s.symbol}</div>
                                        <div className="text-slate-500 text-[10px]">{s.name}</div>
                                    </td>
                                    <td className="text-right py-2 px-2 text-white font-medium">
                                        <PriceDisplay amount={s.price || 0} />
                                    </td>
                                    <td className={`text-right py-2 px-2 font-bold ${cp >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {cp >= 0 ? '+' : ''}{cp.toFixed(2)}%
                                    </td>
                                    <td className="text-right py-2 px-2 text-slate-300 hidden sm:table-cell">
                                        {s.peRatio ? s.peRatio.toFixed(1) : '—'}
                                    </td>
                                    <td className="text-right py-2 px-2 text-slate-300 hidden sm:table-cell">
                                        {s.marketCap ? `$${(s.marketCap / 1e9).toFixed(1)}B` : '—'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Stock Screener Results Card
export function ScreenerCard({ data }: { data: ScreenerData }) {
    const results = data.results || [];
    if (results.length === 0) return null;

    return (
        <div className="bg-slate-800/80 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white">Screener Results</span>
                <span className="text-xs text-slate-500 ml-auto">{data.count} found</span>
            </div>
            <div className="space-y-2">
                {results.slice(0, 8).map((s, idx) => {
                    const cp = s.changePercent ?? 0;
                    return (
                        <div key={idx} className="flex items-center justify-between py-1.5 px-2 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                    {(s.symbol || '?').slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-white truncate">{s.symbol}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{s.sector || s.name}</div>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <div className="text-xs text-white font-medium"><PriceDisplay amount={s.price || 0} /></div>
                                <div className={`text-[10px] font-bold ${cp >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {cp >= 0 ? '+' : ''}{cp.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Sector Performance Card
export function SectorPerformanceCard({ data }: { data: SectorData }) {
    const sectors = data.sectors || [];
    if (sectors.length === 0) return null;

    return (
        <div className="bg-slate-800/80 rounded-xl p-4 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-3">
                <PieChart className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white">Sector Performance</span>
            </div>
            <div className="space-y-1.5">
                {sectors.slice(0, 10).map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs text-white truncate">{s.sector}</span>
                                <span className={`text-xs font-bold ${s.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {s.avgChange >= 0 ? '+' : ''}{s.avgChange.toFixed(2)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all ${s.avgChange >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(Math.abs(s.avgChange) * 10, 100)}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-500 flex-shrink-0">{s.stockCount} stocks</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Technical Analysis Card
export function TechnicalCard({ data }: { data: TechnicalData }) {
    const signalColors: Record<string, string> = {
        'Strong Bullish': 'bg-emerald-500 text-white',
        'Bullish': 'bg-emerald-500/20 text-emerald-400',
        'Neutral': 'bg-slate-500/20 text-slate-400',
        'Bearish': 'bg-red-500/20 text-red-400',
        'Strong Bearish': 'bg-red-500 text-white',
        'Overbought': 'bg-amber-500/20 text-amber-400',
        'Oversold': 'bg-blue-500/20 text-blue-400',
    };

    const rsi = data.rsi ?? 50;
    const rsiColor = rsi > 70 ? 'text-red-400' : rsi < 30 ? 'text-emerald-400' : 'text-slate-300';

    return (
        <div className="bg-slate-800/80 rounded-xl p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-white">Technical Analysis</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${signalColors[data.signal || 'Neutral'] || signalColors.Neutral}`}>
                    {data.signal}
                </span>
            </div>

            <div className="text-xl font-bold text-white mb-3">
                {data.symbol} — <PriceDisplay amount={data.price || 0} />
            </div>

            {/* RSI Gauge */}
            <div className="mb-3">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Oversold (30)</span>
                    <span className={`font-bold text-xs ${rsiColor}`}>RSI: {rsi.toFixed(1)}</span>
                    <span>Overbought (70)</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 relative">
                    <div className="absolute h-2 bg-gradient-to-r from-emerald-500 via-slate-400 to-red-500 rounded-full w-full opacity-30" />
                    <div
                        className="absolute w-3 h-3 bg-white rounded-full shadow -top-0.5 transition-all"
                        style={{ left: `calc(${Math.min(rsi, 100)}% - 6px)` }}
                    />
                </div>
            </div>

            {/* 52-week Position */}
            <div className="mb-3">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>52w Low: ${data.weekLow52}</span>
                    <span>52w High: ${data.weekHigh52}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5 relative">
                    <div
                        className="absolute h-1.5 bg-cyan-500 rounded-full"
                        style={{ width: `${data.positionIn52wRange || 50}%` }}
                    />
                </div>
            </div>

            {/* Support/Resistance */}
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-900/20 rounded-lg p-2 border border-emerald-700/30">
                    <div className="text-emerald-400 text-[10px] font-medium mb-1">Support Levels</div>
                    {(data.support || []).map((lvl, i) => (
                        <div key={i} className="text-white font-medium">${lvl.toFixed(2)}</div>
                    ))}
                </div>
                <div className="bg-red-900/20 rounded-lg p-2 border border-red-700/30">
                    <div className="text-red-400 text-[10px] font-medium mb-1">Resistance Levels</div>
                    {(data.resistance || []).map((lvl, i) => (
                        <div key={i} className="text-white font-medium">${lvl.toFixed(2)}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Compound Interest Card
export function CompoundInterestCard({ data }: { data: CalculatorData }) {
    return (
        <div className="bg-indigo-900/30 rounded-xl p-4 border border-indigo-600/30">
            <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-white">Compound Interest</span>
            </div>
            <div className="bg-indigo-800/30 rounded-lg p-3 mb-3">
                <div className="text-indigo-300 text-xs mb-1">Final Amount</div>
                <div className="text-2xl font-bold text-indigo-400"><PriceDisplay amount={data.finalAmount || 0} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Principal</div>
                    <div className="text-white font-medium"><PriceDisplay amount={data.principal || 0} /></div>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Total Interest</div>
                    <div className="text-indigo-400 font-medium"><PriceDisplay amount={data.totalInterest || 0} /></div>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Rate</div>
                    <div className="text-white font-medium">{data.rate}</div>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Effective Rate</div>
                    <div className="text-white font-medium">{data.effectiveRate}%</div>
                </div>
            </div>
            {/* Mini year-by-year chart */}
            {data.yearlyBreakdown && data.yearlyBreakdown.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="text-[10px] text-slate-400 mb-1">Growth Over Time</div>
                    <div className="flex items-end gap-0.5 h-12">
                        {data.yearlyBreakdown.map((yr, i) => {
                            const maxVal = data.yearlyBreakdown![data.yearlyBreakdown!.length - 1]?.value || 1;
                            const heightPct = (yr.value / maxVal) * 100;
                            return (
                                <div
                                    key={i}
                                    className="flex-1 bg-indigo-500/60 rounded-t hover:bg-indigo-400/80 transition-colors"
                                    style={{ height: `${heightPct}%` }}
                                    title={`Year ${yr.year}: $${yr.value.toLocaleString()}`}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// News Results Card
export function NewsCard({ data }: { data: NewsData }) {
    const results = data.results || [];
    if (results.length === 0 && data.message) {
        return (
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-sm text-slate-400">
                {data.message}
            </div>
        );
    }

    return (
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
                <Newspaper className="w-5 h-5 text-sky-400" />
                <span className="font-bold text-white">News: {data.query}</span>
            </div>
            <div className="space-y-2">
                {results.slice(0, 5).map((article, idx) => (
                    <div key={idx} className="bg-slate-700/30 rounded-lg p-2.5">
                        <div className="text-xs font-medium text-white mb-1">{article.title}</div>
                        {article.summary && (
                            <div className="text-[10px] text-slate-400 mb-1">{article.summary}</div>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            {article.source && <span>{article.source}</span>}
                            {article.publishedAt && (
                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Market Movers Card
export function MarketMoversCard({ data }: { data: { type?: string; movers?: StockData[] } }) {
    const movers = data.movers || [];
    const isGainers = data.type === 'gainers';

    return (
        <div className={`rounded-xl p-4 border ${isGainers ? 'bg-emerald-900/20 border-emerald-600/30' : 'bg-red-900/20 border-red-600/30'}`}>
            <div className="flex items-center gap-2 mb-3">
                <TrendingUp className={`w-5 h-5 ${isGainers ? 'text-emerald-400' : 'text-red-400'}`} />
                <span className="font-bold text-white">Top {isGainers ? 'Gainers' : 'Losers'}</span>
            </div>
            <div className="space-y-1.5">
                {movers.map((s, idx) => {
                    const cp = s.changePercent ?? 0;
                    return (
                        <div key={idx} className="flex items-center justify-between py-1.5 px-2 bg-slate-800/40 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 w-4">{idx + 1}.</span>
                                <div>
                                    <div className="text-xs font-bold text-white">{s.symbol}</div>
                                    <div className="text-[10px] text-slate-500">{s.name}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-white font-medium"><PriceDisplay amount={s.price || 0} /></div>
                                <div className={`text-[10px] font-bold ${cp >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {cp >= 0 ? '+' : ''}{cp.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Main ToolResultCard - renders appropriate card based on tool
interface ToolResultCardProps {
    tool: string;
    result: unknown;
}

export function ToolResultCard({ tool, result }: ToolResultCardProps) {
    const data = result as Record<string, unknown>;

    if (data?.error) {
        return <ErrorCard message={data.error as string} />;
    }

    // Stock quote / crypto
    if ((tool === 'get_stock_quote' || tool === 'get_crypto_price') && data?.symbol) {
        return <StockCard data={data as StockData} />;
    }

    // Comparison
    if (tool === 'compare_stocks' && data?.stocks) {
        return <ComparisonCard data={data as unknown as ComparisonData} />;
    }

    // Screener
    if (tool === 'screen_stocks' && data?.results) {
        return <ScreenerCard data={data as unknown as ScreenerData} />;
    }

    // Sector performance
    if (tool === 'get_sector_performance' && data?.sectors) {
        return <SectorPerformanceCard data={data as unknown as SectorData} />;
    }

    // Technical indicators
    if (tool === 'get_technical_indicators' && data?.symbol) {
        return <TechnicalCard data={data as unknown as TechnicalData} />;
    }

    // Compound interest
    if (tool === 'calculate_compound_interest' && data?.finalAmount !== undefined) {
        return <CompoundInterestCard data={data as CalculatorData} />;
    }

    // News
    if (tool === 'search_news') {
        return <NewsCard data={data as unknown as NewsData} />;
    }

    // Market movers
    if ((tool === 'get_top_gainers' || tool === 'get_top_losers') && data?.movers) {
        return <MarketMoversCard data={data as { type?: string; movers?: StockData[] }} />;
    }

    // SIP calculator
    if (tool === 'calculate_sip' && data?.totalValue) {
        return <SIPCard data={data as CalculatorData} />;
    }

    // EMI calculator
    if (tool === 'calculate_emi' && data?.emi) {
        return <EMICard data={data as CalculatorData} />;
    }

    // Weather
    if (tool === 'get_weather' && data?.temperature !== undefined) {
        return <WeatherCard data={data as WeatherData} />;
    }

    // Forex
    if (tool === 'get_forex_rates' && data?.rates) {
        return <ForexCard data={data as ForexData} />;
    }

    // Generic result display for unknown tools
    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">{tool.replace(/_/g, ' ')}</span>
            </div>
            <pre className="text-xs text-slate-300 overflow-auto max-h-32">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}

export default ToolResultCard;
