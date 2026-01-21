'use client';

import { useState, useEffect } from 'react';
import { Loader2, Target } from 'lucide-react';
import { getStockForecast, type DetailedForecast } from '@/services/marketService';
import {
    PriceTargetCard,
    AnalystConsensusCard,
    FinancialForecastTable,
    RecommendationTrends
} from '@/components/forecast';

interface ForecastTabProps {
    symbol: string;
    currentPrice?: number;
}

export default function ForecastTab({ symbol, currentPrice }: ForecastTabProps) {
    const [forecast, setForecast] = useState<DetailedForecast | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getStockForecast(symbol);
                setForecast(data);
            } catch (e) {
                console.error('Failed to load forecast:', e);
                setError('Forecast data not available.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [symbol]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !forecast) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                    {error || 'No analyst forecast available. Sync from admin panel.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Row 1: Price Target + Analyst Consensus */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <PriceTargetCard
                    low={forecast.priceTarget?.low ?? null}
                    mean={forecast.priceTarget?.mean ?? null}
                    high={forecast.priceTarget?.high ?? null}
                    current={forecast.priceTarget?.current || currentPrice || null}
                    upside={forecast.priceTarget?.upside ?? null}
                />

                <AnalystConsensusCard
                    consensus={forecast.analystConsensus?.consensus || 'N/A'}
                    strongBuy={forecast.analystConsensus?.strongBuy || 0}
                    buy={forecast.analystConsensus?.buy || 0}
                    hold={forecast.analystConsensus?.hold || 0}
                    sell={forecast.analystConsensus?.sell || 0}
                    strongSell={forecast.analystConsensus?.strongSell || 0}
                    total={forecast.analystConsensus?.total || 0}
                />
            </div>

            {/* Row 2: Financial Forecast Table */}
            <FinancialForecastTable
                annual={forecast.earningsEstimates?.annual || []}
                quarterly={forecast.earningsEstimates?.quarterly || []}
            />

            {/* Row 3: Recommendation Trends */}
            <RecommendationTrends
                trends={forecast.recommendationTrends || []}
            />
        </div>
    );
}
