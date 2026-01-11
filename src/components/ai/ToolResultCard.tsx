'use client';

import React from 'react';
import {
    TrendingUp, ArrowUp, ArrowDown, Calculator, BarChart3,
    DollarSign, Cloud
} from 'lucide-react';

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

// Stock/Crypto Card
export function StockCard({ data }: { data: StockData }) {
    const changePercent = data.changePercent ?? data.changePercent24h ?? 0;
    const isPositive = changePercent >= 0;

    return (
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
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
                ${(data.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-700/50 rounded-lg p-2">
                    <div className="text-slate-500">Volume</div>
                    <div className="text-white font-medium">{((data.volume ?? data.volume24h) || 0).toLocaleString()}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                    <div className="text-slate-500">Mkt Cap</div>
                    <div className="text-white font-medium">${((data.marketCap || 0) / 1e9).toFixed(1)}B</div>
                </div>
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
                <div className="text-2xl font-bold text-emerald-400">${(data.totalValue || 0).toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Monthly</div>
                    <div className="text-white font-medium">${data.monthlyInvestment?.toLocaleString()}</div>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Invested</div>
                    <div className="text-white font-medium">${data.totalInvested?.toLocaleString()}</div>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Returns</div>
                    <div className="text-emerald-400 font-medium">${data.estimatedReturns?.toLocaleString()}</div>
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
                <div className="text-2xl font-bold text-blue-400">${(data.emi || 0).toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Principal</div>
                    <div className="text-white font-medium">${(data.principal || 0).toLocaleString()}</div>
                </div>
                <div className="p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400">Total Interest</div>
                    <div className="text-amber-400 font-medium">${(data.totalInterest || 0).toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
}

// Weather Card
export function WeatherCard({ data }: { data: WeatherData }) {
    return (
        <div className="bg-linear-to-br from-sky-600 to-blue-700 rounded-xl p-4">
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

    if ((tool === 'get_stock_quote' || tool === 'get_crypto_price') && data?.symbol) {
        return <StockCard data={data as StockData} />;
    }

    if (tool === 'calculate_sip' && data?.totalValue) {
        return <SIPCard data={data as CalculatorData} />;
    }

    if (tool === 'calculate_emi' && data?.emi) {
        return <EMICard data={data as CalculatorData} />;
    }

    if (tool === 'get_weather' && data?.temperature !== undefined) {
        return <WeatherCard data={data as WeatherData} />;
    }

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
