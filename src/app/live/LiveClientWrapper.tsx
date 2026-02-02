'use client';

import dynamic from 'next/dynamic';

const LiveChartPage = dynamic(
    () => import('@/components/charts/LiveChartPage'),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400">Loading live charts...</span>
                </div>
            </div>
        )
    }
);

interface LiveClientWrapperProps {
    symbol?: string;
}

import { useSearchParams } from 'next/navigation';

export default function LiveClientWrapper({ symbol: propSymbol }: LiveClientWrapperProps) {
    const searchParams = useSearchParams();
    const symbol = searchParams.get('symbol') || propSymbol || 'AAPL';

    return <LiveChartPage symbol={symbol} />;
}
