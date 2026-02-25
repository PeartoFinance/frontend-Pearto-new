'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { AIWidget } from '@/components/ai';
import BooyahHero from '@/components/booyah/BooyahHero';
import BooyahSearch from '@/components/booyah/BooyahSearch';
import PredictionCard from '@/components/booyah/PredictionCard';
import SentimentGauge from '@/components/booyah/SentimentGauge';
import TechnicalDashboard from '@/components/booyah/TechnicalDashboard';
import PriceChartPanel from '@/components/booyah/PriceChartPanel';
import AIReasoningPanel from '@/components/booyah/AIReasoningPanel';
import TrendingPicks from '@/components/booyah/TrendingPicks';
import RiskRewardWidget from '@/components/booyah/RiskRewardWidget';
import SentimentHeatmapWidget from '@/components/booyah/SentimentHeatmapWidget';
import { getStockProfile, getStockHistory, getStockForecast, type MarketStock, type PriceHistoryPoint, type DetailedForecast } from '@/services/marketService';
import { post } from '@/services/api';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

export interface BooyahPrediction {
    signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
    confidence: number;
    sentiment: number; // -100 to +100
    targetPrice: number | null;
    stopLoss: number | null;
    timeHorizon: string;
    reasoning: string;
    technicals: {
        rsiSignal: string;
        macdSignal: string;
        smaSignal: string;
        volumeSignal: string;
        overallScore: number;
    };
    risks: string[];
    catalysts: string[];
}

export default function BooyahPage() {
    const { formatPrice } = useCurrency();
    const [selectedSymbol, setSelectedSymbol] = useState<string>('');
    const [stockData, setStockData] = useState<MarketStock | null>(null);
    const [historyData, setHistoryData] = useState<PriceHistoryPoint[]>([]);
    const [forecast, setForecast] = useState<DetailedForecast | null>(null);
    const [prediction, setPrediction] = useState<BooyahPrediction | null>(null);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyzePrediction = useCallback(async (symbol: string, stock: MarketStock, history: PriceHistoryPoint[]) => {
        setAiLoading(true);
        try {
            const prompt = `You are a professional financial analyst AI. Analyze ${symbol} (${stock.name}) and provide a structured prediction.

Current Price: ${formatPrice(stock.price || 0)}
Change: ${stock.changePercent?.toFixed(2)}%
Volume: ${stock.volume}
Market Cap: ${stock.marketCap || 'N/A'}
52W High: ${stock.high52w ? formatPrice(stock.high52w) : 'N/A'} | 52W Low: ${stock.low52w ? formatPrice(stock.low52w) : 'N/A'}
P/E: ${stock.peRatio || 'N/A'} | Beta: ${stock.beta || 'N/A'}
EPS: ${stock.eps || 'N/A'}
Recent price points: ${history.slice(-5).map(p => formatPrice(p.close || 0)).join(', ')}

Respond in EXACTLY this JSON format, no other text:
{
    "signal": "STRONG_BUY|BUY|HOLD|SELL|STRONG_SELL",
    "confidence": 75,
    "sentiment": 60,
    "targetPrice": 185.50,
    "stopLoss": 160.00,
    "timeHorizon": "3-6 months",
    "reasoning": "Detailed 2-3 sentence analysis...",
    "technicals": {
        "rsiSignal": "Bullish/Bearish/Neutral - brief reason",
        "macdSignal": "Bullish/Bearish/Neutral - brief reason",
        "smaSignal": "Bullish/Bearish/Neutral - brief reason",
        "volumeSignal": "Bullish/Bearish/Neutral - brief reason",
        "overallScore": 72
    },
    "risks": ["risk1", "risk2"],
    "catalysts": ["catalyst1", "catalyst2"]
}`;

            const response = await post<{ success: boolean; response: string }>('/ai/chat', {
                message: prompt,
                context: { pageType: 'booyah-prediction', pageData: { symbol, price: stock.price } }
            });

            const text = response.response || '';
            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                setPrediction({
                    signal: parsed.signal || 'HOLD',
                    confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
                    sentiment: Math.min(100, Math.max(-100, parsed.sentiment || 0)),
                    targetPrice: parsed.targetPrice || null,
                    stopLoss: parsed.stopLoss || null,
                    timeHorizon: parsed.timeHorizon || '3-6 months',
                    reasoning: parsed.reasoning || 'Analysis unavailable.',
                    technicals: {
                        rsiSignal: parsed.technicals?.rsiSignal || 'Neutral',
                        macdSignal: parsed.technicals?.macdSignal || 'Neutral',
                        smaSignal: parsed.technicals?.smaSignal || 'Neutral',
                        volumeSignal: parsed.technicals?.volumeSignal || 'Neutral',
                        overallScore: Math.min(100, Math.max(0, parsed.technicals?.overallScore || 50)),
                    },
                    risks: parsed.risks || [],
                    catalysts: parsed.catalysts || [],
                });
            }
        } catch (err) {
            console.error('AI prediction failed:', err);
            // Set a fallback prediction based on available data
            setPrediction(null);
        } finally {
            setAiLoading(false);
        }
    }, [formatPrice]);

    const handleSymbolSelect = useCallback(async (symbol: string) => {
        if (!symbol.trim()) return;
        setSelectedSymbol(symbol);
        setLoading(true);
        setError(null);
        setPrediction(null);
        setForecast(null);

        try {
            const [profile, history, forecastData] = await Promise.allSettled([
                getStockProfile(symbol),
                getStockHistory(symbol, '6mo', '1d'),
                getStockForecast(symbol),
            ]);

            const stock = profile.status === 'fulfilled' ? profile.value : null;
            const histResult = history.status === 'fulfilled' ? history.value.data : [];
            const fcResult = forecastData.status === 'fulfilled' ? forecastData.value : null;

            if (!stock) {
                setError(`Could not find data for ${symbol}. Try another symbol.`);
                setLoading(false);
                return;
            }

            setStockData(stock);
            setHistoryData(histResult);
            setForecast(fcResult);
            setLoading(false);

            // Run AI analysis after data is loaded
            analyzePrediction(symbol, stock, histResult);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load market data. Please try again.');
            setLoading(false);
        }
    }, [analyzePrediction]);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto">
                    {/* Hero Section */}
                    <BooyahHero />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                        {/* Search Section */}
                        <div className="relative -mt-8 z-10 mb-8">
                            <BooyahSearch onSelect={handleSymbolSelect} />
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Loading Skeleton */}
                        {loading && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className={`${i === 0 ? 'lg:col-span-2' : ''} h-64 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse`} />
                                ))}
                            </div>
                        )}

                        {/* Results */}
                        {stockData && !loading && (
                            <div className="space-y-6">
                                {/* Stock Header */}
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        {stockData.logoUrl && (
                                            <img src={stockData.logoUrl} alt={stockData.symbol} className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700" />
                                        )}
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {stockData.symbol}
                                                <span className="text-base font-normal text-slate-500 dark:text-slate-400">{stockData.name}</span>
                                            </h2>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(stockData.price || 0)}</span>
                                                <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg ${(stockData.changePercent ?? 0) >= 0
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                    }`}>
                                                    {(stockData.changePercent ?? 0) >= 0 ? '+' : ''}{stockData.changePercent?.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {prediction && (
                                        <div className={`px-4 py-2 rounded-xl font-bold text-lg ${prediction.signal.includes('BUY')
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                            : prediction.signal === 'HOLD'
                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                            }`}>
                                            {prediction.signal === 'STRONG_BUY' ? '🔥 BOOYAH! STRONG BUY' :
                                                prediction.signal === 'BUY' ? '📈 BUY' :
                                                    prediction.signal === 'HOLD' ? '⏸ HOLD' :
                                                        prediction.signal === 'SELL' ? '📉 SELL' : '🚨 STRONG SELL'}
                                        </div>
                                    )}
                                </div>

                                {/* Main Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left Column - 2 cols wide */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <PriceChartPanel
                                            symbol={selectedSymbol}
                                            data={historyData}
                                            prediction={prediction}
                                            currentPrice={stockData.price}
                                        />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <RiskRewardWidget
                                                prediction={prediction}
                                                currentPrice={stockData.price}
                                                loading={aiLoading}
                                            />
                                            <SentimentHeatmapWidget
                                                prediction={prediction}
                                                loading={aiLoading}
                                            />
                                        </div>

                                        <TechnicalDashboard
                                            data={historyData}
                                            prediction={prediction}
                                            loading={aiLoading}
                                        />
                                    </div>

                                    {/* Right Column - 1 col wide */}
                                    <div className="space-y-6">
                                        <PredictionCard prediction={prediction} loading={aiLoading} />
                                        <SentimentGauge
                                            sentiment={prediction?.sentiment ?? 0}
                                            confidence={prediction?.confidence ?? 0}
                                            loading={aiLoading}
                                        />
                                        <AIReasoningPanel
                                            prediction={prediction}
                                            stockData={stockData}
                                            forecast={forecast}
                                            loading={aiLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Default State - Trending Picks */}
                        {!stockData && !loading && !error && (
                            <TrendingPicks onSelect={handleSymbolSelect} />
                        )}
                    </div>
                </main>
            </div>

            <AIWidget pageType="booyah" type="compact" />
        </div>
    );
}
