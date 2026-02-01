'use client';

import dynamic from 'next/dynamic';

const AdvancedChartPage = dynamic(
    () => import('@/components/charts/AdvancedChartPage'),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }
);

interface ChartClientWrapperProps {
    symbol: string;
}

export default function ChartClientWrapper({ symbol }: ChartClientWrapperProps) {
    return <AdvancedChartPage symbol={symbol} />;
}
