'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with live data
const LiveMarketsPage = dynamic(
    () => import('@/components/markets/LiveMarketsPage'),
    {
        ssr: false,
        loading: () => <LiveMarketsLoading />
    }
);

function LiveMarketsLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Loading live markets...</p>
            </div>
        </div>
    );
}

export default function LivePage() {
    return (
        <Suspense fallback={<LiveMarketsLoading />}>
            <LiveMarketsPage />
        </Suspense>
    );
}
