import { Suspense } from 'react';
import { Metadata } from 'next';
import ChartClientWrapper from './ChartClientWrapper';
import Footer from '@/components/layout/Footer';

interface Props {
    params: Promise<{ slug: string[] }>;
    searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    // Reconstruct symbol (e.g. ['USD', 'JPY'] → 'USD/JPY', or ['AAPL'] → 'AAPL')
    const symbol = slug.join('/').toUpperCase();

    return {
        title: `${symbol} Advanced Chart | Pearto Finance`,
        description: `Interactive advanced chart for ${symbol} with drawing tools, technical indicators, and real-time data.`,
        openGraph: {
            title: `${symbol} Chart`,
            description: `Professional charting for ${symbol}`,
        }
    };
}

export default async function ChartPage({ params }: Props) {
    const { slug } = await params;
    // Reconstruct symbol — handles both 'AAPL' and 'USD/JPY' (from [...slug])
    const symbol = slug.join('/').toUpperCase();

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ChartClientWrapper symbol={symbol} />
        </Suspense>
    );
}
