import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Live Markets | Pearl Finance',
    description: 'Real-time market data for stocks, crypto, indices, and commodities with live price updates.',
    openGraph: {
        title: 'Live Markets - Real-Time Trading Data',
        description: 'Track live prices across all markets including stocks, cryptocurrency, indices, and commodities.',
        type: 'website',
    }
};

export default function LiveMarketsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
