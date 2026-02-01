import { Suspense } from 'react';
import { Metadata } from 'next';
import ChartClientWrapper from './ChartClientWrapper';

interface Props {
    params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    return {
        title: `${upperSymbol} Advanced Chart | Pearto Finance`,
        description: `Interactive advanced chart for ${upperSymbol} with drawing tools, technical indicators, and real-time data.`,
        openGraph: {
            title: `${upperSymbol} Chart`,
            description: `Professional charting for ${upperSymbol}`,
        }
    };
}

export default async function ChartPage({ params }: Props) {
    const { symbol } = await params;

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ChartClientWrapper symbol={symbol.toUpperCase()} />
        </Suspense>
    );
}
