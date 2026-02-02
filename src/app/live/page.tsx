import { Metadata } from 'next';
import LiveClientWrapper from './LiveClientWrapper';

export const metadata: Metadata = {
    title: 'Live Charts | Pearto Finance',
    description: 'Real-time stock and crypto charts with live price updates. Monitor markets with auto-refreshing intraday data.',
    openGraph: {
        title: 'Live Charts | Pearto Finance',
        description: 'Real-time stock and crypto charts with live price updates'
    }
};

import { Suspense } from 'react';

export default function LivePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400">Loading live charts...</span>
                </div>
            </div>
        }>
            <LiveClientWrapper />
        </Suspense>
    );
}
