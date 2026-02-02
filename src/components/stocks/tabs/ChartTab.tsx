'use client';

import { useState, useCallback, useEffect } from 'react';
import AdvancedStockChart from '@/components/charts/AdvancedStockChart';
import { getStockHistory } from '@/services/marketService';

interface ChartTabProps {
    symbol: string;
    currentPrice?: number;
    open?: number;
    high?: number;
    low?: number;
    previousClose?: number;
    volume?: number;
    change?: number;
    changePercent?: number;
}

type Period = '1D' | '2D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '3Y' | '5Y' | 'All';

interface PriceDataPoint {
    date: string;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume: number | null;
}

export default function ChartTab({
    symbol,
    currentPrice,
    change = 0,
    changePercent = 0,
}: ChartTabProps) {
    const [period, setPeriod] = useState<Period>('1M');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PriceDataPoint[]>([]);

    // Period mapping for API
    const periodMap: Record<Period, { period: string; interval: string }> = {
        '1D': { period: '1d', interval: '5m' },
        '2D': { period: '2d', interval: '15m' },
        '5D': { period: '5d', interval: '15m' },
        '1M': { period: '1mo', interval: '1d' },
        '3M': { period: '3mo', interval: '1d' },
        '6M': { period: '6mo', interval: '1d' },
        'YTD': { period: 'ytd', interval: '1d' },
        '1Y': { period: '1y', interval: '1d' },
        '3Y': { period: '3y', interval: '1wk' },
        '5Y': { period: '5y', interval: '1wk' },
        'All': { period: 'max', interval: '1mo' },
    };

    // Fetch data
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { period: p, interval } = periodMap[period];
            const response = await getStockHistory(symbol, p, interval);
            if (response?.data) {
                // Use full timestamp for intraday periods (1D, 2D, 5D), date-only for daily+
                const isIntraday = ['1D', '2D', '5D'].includes(period);
                setData(response.data.map((d: any) => ({
                    date: isIntraday ? d.date : d.date.split('T')[0],
                    open: d.open,
                    high: d.high,
                    low: d.low,
                    close: d.close,
                    volume: d.volume,
                })));
            }
        } catch (err) {
            console.error('Failed to load chart data:', err);
        } finally {
            setLoading(false);
        }
    }, [symbol, period]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod as Period);
    };

    return (
        <AdvancedStockChart
            data={data}
            symbol={symbol}
            loading={loading}
            height={420}
            period={period}
            onPeriodChange={handlePeriodChange}
        />
    );
}
